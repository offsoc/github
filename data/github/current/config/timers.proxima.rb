# frozen_string_literal: true
TIMERD_SCRIPT = true

require "timer_daemon"
require "github/config/redis"
require File.expand_path("../basic", __FILE__)
require "github"
require "github/config/stats"
require "github/config/active_job"
require GitHub::AppEnvironment.root.join("packages/job_scheduling/app/models/job_scheduler")
require "active_support/core_ext/numeric/time"
require "active_support/core_ext/numeric/bytes"
require "github/timeout_and_measure"
require "github/config/active_record"
require "github/pages/allocator"
require "github/sql"
require "github/dgit"
require "raindrops"
require "global_instrumenter"

require "github/config/active_job"
require "github/config/aqueduct"
require "github/config/flipper"
require "github/faraday_adapter/persistent_excon"
require "active_job/queue_adapters/aqueduct_adapter"
require "github/logging/logfmt_formatter"
require_relative "instrumentation/jobs"
require_relative "../packages/substrate/app/models/resiliency/response"

require_relative "../packages/branch_protections/app/jobs/ruleset_sweeper_job"
require_relative "../packages/gists/app/jobs/gist_maintenance_scheduler_job"
require_relative "../packages/gists/app/jobs/gist_purge_job"
require_relative "../packages/checks/app/jobs/checks_job_utility"
require_relative "../packages/checks/app/jobs/check_steps_orchestrate_deletion_job"
require_relative "../packages/checks/app/jobs/check_suites_archive_orchestration_job"
require_relative "../packages/checks/app/jobs/check_suites_delete_archived_orchestration_job"
require_relative "../packages/checks/app/jobs/statuses_archive_orchestration_job"
require_relative "../packages/checks/app/jobs/statuses_delete_archived_orchestration_job"
require_relative "../packages/code_scanning/app/jobs/import_advanced_security_app_public_keys_job"
require_relative "../packages/planning/app/jobs/memex_kv_cleanup_expired_data_job"
require_relative "../packages/repositories/app/jobs/calculate_topic_applied_counts_job"
require_relative "../packages/repositories/app/jobs/remove_expired_announcements_job"
require_relative "../packages/repositories/app/jobs/repository_bulk_purge_job"
require_relative "../packages/repositories/app/jobs/repository_orchestration_sweeper_job"
require_relative "../packages/security_products/app/jobs/security_center/dead_letter_job"
require_relative "../packages/security_products/app/jobs/security_center/kv_cleanup_expired_data_job"
require_relative "../app/jobs/audit_log_stream_health_checker_job"
require_relative "../app/jobs/memex_hydro_project_automation/instrumentation/shared"
require_relative "../app/jobs/memex_hydro_project_automation/instrumentation/scheduled_runner"
require_relative "../app/jobs/memex_project_workflow_scheduled_runner_job"
require_relative "../app/jobs/clean_locks_job"
require_relative "../app/jobs/billing/git_lfs_storage_metering_job"
require_relative "../packages/planning/app/jobs/report_memex_project_items_index_consistency_metric_job"
require_relative "../packages/planning/app/jobs/queue_memex_elasticsearch_resyncs_job"
require_relative "../packages/apps/app/jobs/proxima_app_sync/synchronize_first_party_apps_job"
require_relative "../packages/apps/app/jobs/proxima_app_sync/synchronize_third_party_apps_job"
require_relative "../packages/issues/app/jobs/dangling_issue_orchestration_starter_job"
require_relative "../packages/users/app/jobs/purge_orphaned_followers_job"
# This load private implementation of the job and the public helper exposing the class name of the job
require_relative "../packages/security_overview_analytics/app/models/security_overview_analytics/feature_flag_helper"
require_relative "../packages/security_overview_analytics/app/jobs/security_overview_analytics/calendar_population_job"
require_relative "../packages/security_overview_analytics/app/jobs/security_overview_analytics/repository_data_cleanup_job"
require_relative "../packages/security_overview_analytics/app/jobs/security_overview_analytics/data_retention_enforcement_job"
require_relative "../packages/security_overview_analytics/app/public/security_overview_analytics/helpers"
require_relative "../packages/discussions/app/jobs/discussions_kv_cleanup_expired_data_job"
require_relative "../packages/management_tools/app/jobs/feature_management_kv_cleanup_expired_data_job"
require_relative "../app/jobs/feeds_kv_cleanup_expired_data_job"
require_relative "../packages/users/app/jobs/users_kv_cleanup_expired_data_job"
require_relative "../packages/profiles/app/jobs/profiles_kv_cleanup_expired_data_job"
require_relative "../app/jobs/security_products_enablement_kv_cleanup_expired_data_job"

## Notifications jobs
require_relative "../packages/notifications/app/jobs/delete_expired_notifications_key_values_job"

## Codespaces jobs
require_relative "../packages/codespaces/app/jobs/codespaces_job"
require_relative "../packages/codespaces/app/jobs/codespaces_kv_cleanup_job"

require_relative "../packages/apps/app/jobs/cleanup_expired_permissions_job"

## Copilot jobs
require_relative "../packages/copilot/app/jobs/copilot_job"
require_relative "../packages/copilot/app/jobs/copilot/seat_emission_job"

## Licensing jobs
require_relative "../packages/licensing/app/jobs/licensing/trigger_scheduled_licensing_model_transitions_job"
require_relative "../packages/licensing/app/jobs/licensing/license_snapshot_for_expired_repository_invitations_job"

## Billing jobs
require_relative "../app/jobs/billing_update_exchange_rates_job"
require_relative "../app/jobs/billing/azure/check_azure_subscriptions_job"
require_relative "../app/jobs/perform_ofac_downgrades_job"
require_relative "../packages/billing/app/jobs/billing_kv_cleanup_job"
require_relative "../packages/billing/app/jobs/scheduled_azure_support_plan_sync_job"
require_relative "../packages/credit_decision_engine/app/public/credit_decision_engine"
require_relative "../packages/credit_decision_engine/app/jobs/credit_decision_engine/abstract_credit_check_status_poll_job"
require_relative "../packages/billing/app/jobs/credit_check_status_poll_job"

# configure ActiveJob
ActiveJob::Base.queue_adapter = :aqueduct

logger = ActiveSupport::Logger.new(STDOUT)
logger.level = ::Logger::INFO
logger.formatter = ::GitHub::Logging::LogfmtFormatter.new(GitHub::Logger.default_log_data.merge(ns: "timer_daemon"))
ActiveJob::Base.logger = ActiveSupport::TaggedLogging.new(logger)

# configure daemon
daemon = TimerDaemon.instance
daemon.redis = GitHub.job_coordination_redis
scheduler = JobScheduler.new(daemon)

# report exceptions to Failbot
daemon.error do |boom, timer|
  Failbot.report(boom, timer: timer.name)
end

daemon.schedule "timerd-heartbeat-proxima-global", 10.seconds do
  GitHub.dogstats.increment "timerd.heartbeat", tags: ["config:proxima", "scope:global"]
end

daemon.schedule "timerd-heartbeat-proxima-host", 10.seconds, scope: :host do
  GitHub.dogstats.increment "timerd.heartbeat", tags: ["config:proxima", "scope:host"]
end

[
  CalculateTopicAppliedCountsJob,
  DeleteExpiredReservedLoginTombstonesJob,

  NetworkMaintenanceSchedulerJob,
  DanglingIssueOrchestrationStarterJob,
  RepositoryOrchestrationSweeperJob,
  QueueMediaTransitionJobsJob,
  RepositoryBulkPurgeJob,
  RemoveExpiredOauthJob,
  RulesetSweeperJob,

  # Storage archiving and purging
  PurgeArchivedAssetsJob,
  PurgeRestorablesJob,

  WikiMaintenanceSchedulerJob,

  # Git Backups
  GitbackupsSchedulerJob,
  GitbackupsSweeperJob,
  GitbackupsEnsureFreshKeyJob,

  # Supply Chain
  DependabotSecurityUpdateTimeoutCleanupJob,
  EnterpriseAdvisoryDatabaseSyncJob,

  # code scanning
  StaleCodeScanningCheckRunsScheduledJob,
  ImportAdvancedSecurityAppPublicKeysJob,

  QueueCollectMetricsJob,

  # feature-management
  StaleCheckJob,

  # Invalidate expired invitations
  InvalidateExpiredInvitesJob,
  ExpireBusinessAdminInvitationsJob,
  ExpireBusinessOrganizationInvitationsJob,
  SendBusinessOrganizationInvitationRemindersJob,

  # Advanced Security
  MeteredAdvancedSecurityScheduledEmitterJob,

  # Authentication
  AuthenticationKvCleanupExpiredDataJob,

  # Audit Log
  AuditLogStreamHealthCheckerJob,

  # KV Cleanup
  GrowthNoticeKvCleanupExpiredDataJob,
  GrowthLastActivityKvCleanupExpiredDataJob,
  FeedsKvCleanupExpiredDataJob,

  # PAT Expiry Emails
  PersonalTokenExpiryNoticeJob,
  PersonalTokenExpiredNoticeJob,

  # PAT Request Notices
  NotifyOrgAdminsAboutPatRequestsJob,

  # Proxima App Sync
  ProximaAppSync::SynchronizeFirstPartyAppsJob,
  ProximaAppSync::SynchronizeThirdPartyAppsJob,

  # EMUs
  ScanEmuExternalTeamsJob,
  ScanEmuOrganizationMembershipsJob,
  ScanEmuOrganizationUsersJob,

  # Expiring announcements
  RemoveExpiredAnnouncementsJob,

  # Teams
  CleanUpDeletedTeamsJob,

  # Projects
  PurgeDeletedMemexProjectsJob,
  MemexKvCleanupExpiredDataJob,

  # Actions & Checks
  CheckStepsOrchestrateDeletionJob,
  CheckSuitesArchiveOrchestrationJob,
  CheckSuitesDeleteArchivedOrchestrationJob,
  StatusesArchiveOrchestrationJob,
  StatusesDeleteArchivedOrchestrationJob,
  ActionsKvCleanupExpiredDataJob,

  # Dependabot alerts digest
  NewsletterDeliveryJob,

  # Scheduled reminders
  EnqueueUpcomingRemindersJob,

  # Distributed progress tracking
  StopAllStalledProgressJob,

  # Memex Automation
  MemexProjectWorkflowScheduledRunnerJob,

  # Memex Project items index consistency metrics
  ReportMemexProjectItemsIndexConsistencyMetricJob,
  QueueMemexElasticsearchResyncsJob,

  # Security Center Analytics
  SecurityOverviewAnalytics::Helpers.calendar_population_job_class,
  SecurityOverviewAnalytics::Helpers.repository_data_cleanup_job_class,
  SecurityOverviewAnalytics::Helpers.data_retention_enforcement_job_class,

  # Security Center
  SecurityCenter::DeadLetterJob,
  SecurityProductsEnablementKvCleanupExpiredDataJob,
  SecurityCenter::KvCleanupExpiredDataJob,

  # User cleanup
  PurgeOrphanedFollowersJob,

  ###
  # Notifications
  ###
  # clean up expired entries on notification_key_values table
  DeleteExpiredNotificationsKeyValuesJob,

  # Platform Health
  SpamKvCleanupJob,

  # Billing
  BillingKvCleanupJob,
  Billing::GitLfsStorageMeteringJob,
  ScheduledAzureSupportPlanSyncJob,
  BillingUpdateExchangeRatesJob,
  Billing::Azure::CheckAzureSubscriptionsJob,
  CreditCheckStatusPollJob,
  PerformOFACDowngradesJob,

  # Job system cleanup
  CleanLocksJob,

  # Signup Flow
  SignupFlowKvCleanupExpiredDataJob,

  # Codespaces
  CodespacesKvCleanupJob,

  # GitHub Apps
  CleanupExpiredPermissionsJob,

  # Copilot
  Copilot::SeatEmissionJob,

  # Discussions
  DiscussionsKvCleanupExpiredDataJob,

  # Feature Management
  FeatureManagementKvCleanupExpiredDataJob,

  # Licensing
  Licensing::TriggerScheduledLicensingModelTransitionsJob,
  Licensing::LicenseSnapshotForExpiredRepositoryInvitationsJob,

  UsersKvCleanupExpiredDataJob,
  ProfilesKvCleanupExpiredDataJob,
].each do |job|
  scheduler.schedule job
end

# Pages
scheduler.schedule "DeleteDependentPagesReplicasSchedulerJob", interval: 1.day, scope: :global
scheduler.schedule "DpagesEvacuationSchedulerJob", interval: 3.minutes
scheduler.schedule "DpagesMaintenanceSchedulerJob", interval: GitHub.dpages_maintenance_scheduler_schedule_interval
scheduler.schedule "PageUpdatesJob", interval: 1.minute, condition: -> { PageUpdatesJob.enabled? }

# GitHub Apps
scheduler.schedule "CleanupOrphanedBotsJob", interval: 7.days
