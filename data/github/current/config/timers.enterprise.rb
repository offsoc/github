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
require_relative "../packages/planning/app/jobs/memex_kv_cleanup_expired_data_job"
require_relative "../packages/repositories/app/jobs/calculate_topic_applied_counts_job"
require_relative "../packages/pull_requests/app/jobs/ipr_kv_cleanup_expired_data_job"
require_relative "../packages/repositories/app/jobs/purge_stale_upload_manifest_file_blobs_job"
require_relative "../packages/repositories/app/jobs/remove_expired_announcements_job"
require_relative "../packages/repositories/app/jobs/repository_bulk_purge_job"
require_relative "../packages/repositories/app/jobs/repository_orchestration_sweeper_job"
require_relative "../packages/security_products/app/jobs/security_center/dead_letter_job"
require_relative "../packages/security_products/app/jobs/security_center/kv_cleanup_expired_data_job"
require_relative "../app/jobs/actions/export_ghes_actions_job_executions_job"
require_relative "../app/jobs/audit_log_stream_health_checker_job"
require_relative "../app/jobs/memex_hydro_project_automation/instrumentation/shared"
require_relative "../app/jobs/memex_hydro_project_automation/instrumentation/scheduled_runner"
require_relative "../app/jobs/memex_project_workflow_scheduled_runner_job"
require_relative "../app/jobs/clean_locks_job"
require_relative "../packages/users/app/jobs/purge_orphaned_followers_job"
require_relative "../packages/discussions/app/jobs/discussions_kv_cleanup_expired_data_job"
require_relative "../packages/management_tools/app/jobs/feature_management_kv_cleanup_expired_data_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/purge_soft_deleted_organizations_job"
require_relative "../app/jobs/feeds_kv_cleanup_expired_data_job"
require_relative "../packages/users/app/jobs/users_kv_cleanup_expired_data_job"
require_relative "../packages/profiles/app/jobs/profiles_kv_cleanup_expired_data_job"
require_relative "../app/jobs/security_products_enablement_kv_cleanup_expired_data_job"

# This load private implementation of the job and the public helper exposing the class name of the job
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/models/security_overview_analytics/feature_flag_helper"
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/jobs/security_overview_analytics/calendar_population_job"
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/jobs/security_overview_analytics/repository_data_cleanup_job"
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/jobs/security_overview_analytics/data_retention_enforcement_job"
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/public/security_overview_analytics/helpers"
require "#{GitHub::AppEnvironment.root}/packages/community_and_safety/app/jobs/clean_expired_interaction_limits_job"

## Notifications jobs
require "#{GitHub::AppEnvironment.root}/packages/notifications/app/jobs/delete_expired_notifications_key_values_job"

require "#{GitHub::AppEnvironment.root}/packages/apps/app/jobs/cleanup_expired_permissions_job"

# configure ActiveJob
ActiveJob::Base.queue_adapter = :aqueduct

if ENV.fetch("TIMERD_STRUCTURED_LOGS", "true") == "true"
  logger = ActiveSupport::Logger.new(STDOUT)
  logger.level = ::Logger::INFO
  logger.formatter = ::GitHub::Logging::LogfmtFormatter.new(GitHub::Logger.default_log_data.merge(ns: "timer_daemon"))
  ActiveJob::Base.logger = ActiveSupport::TaggedLogging.new(logger)
end

# configure daemon
daemon = TimerDaemon.instance
daemon.redis = GitHub.job_coordination_redis
scheduler = JobScheduler.new(daemon)

# report exceptions to Failbot
daemon.error do |boom, timer|
  Failbot.report(boom, timer: timer.name)
end

# test timer
daemon.schedule "test", 30.seconds do
  daemon.log(body: "hello from #$$")
end

if GitHub.cluster_web_server?
  daemon.schedule "dgit-liveness-check", 10.seconds, scope: :host do
    GitHub::DGit.liveness_check
  end
end

# Pages garbage DFS disk usage + garbage collection
if GitHub.kube?
  # Do not scope the jobs to individual hosts because our storage is currently
  # shared (via a volume) so all hosts have the same view of the whole DFS.
  daemon.schedule "pages-partition-usage", 1.minute do
    GitHub::Pages::Allocator.update_disk_usage!(hostname: GitHub.local_pages_host_name)
  end
  daemon.schedule "pages-garbage-collect", 1.hour do
    GitHub::Pages::GarbageCollector.run!
  end
# Elsewhere, scope the jobs to individual (DFS) hosts.
elsif GitHub.cluster_pages_server? || GitHub.single_instance?
  daemon.schedule "pages-partition-usage", 1.minute, scope: :host do
    GitHub::Pages::Allocator.update_disk_usage!(hostname: GitHub.local_pages_host_name)
  end
  daemon.schedule "pages-garbage-collect", 1.hour, scope: :host do
    GitHub::Pages::GarbageCollector.run!
  end
end

[
  CalculateTopicAppliedCountsJob,
  DeleteExpiredReservedLoginTombstonesJob,
  SpokesSyncCacheReplicaSchedulerJob,

  GistMaintenanceSchedulerJob,
  NetworkMaintenanceSchedulerJob,
  RepositoryOrchestrationSweeperJob,
  GistPurgeJob,
  QueueMediaTransitionJobsJob,
  RepositoryBulkPurgeJob,
  RemoveExpiredOauthJob,
  RulesetSweeperJob,

  # Storage archiving and purging
  PurgeRestorablesJob,
  PurgeStaleUploadManifestFileBlobsJob,
  DeletePurgedStorageBlobsJob,
  UpdateStoragePartitionsJob,
  StorageClusterMaintenanceSchedulerJob,

  # LFS
  DeletePurgedMediaBlobsJob,

  WikiMaintenanceSchedulerJob,

  # Gitbackups maintenance
  GitbackupsWalJob,

  # LDAP sync
  LdapTeamSyncJob,
  LdapUserSyncJob,

  # SAML
  SamlSessionRevokeJob,

  # Authentication
  AuthenticationKvCleanupExpiredDataJob,

  # KV Cleanup
  GrowthNoticeKvCleanupExpiredDataJob,
  GrowthLastActivityKvCleanupExpiredDataJob,
  IprKvCleanupExpiredDataJob,
  FeedsKvCleanupExpiredDataJob,
  SecurityProductsEnablementKvCleanupExpiredDataJob,

  # GitHubConnect
  GitHubConnectPushNewContributionsJob,
  UpdateConnectInstallationInfo,
  EnterpriseAdvisoryDatabaseSyncJob,
  UploadEnterpriseServerUserAccountsJob,
  UploadConnectMetricsJob,
  ::Actions::ExportGhesActionsJobExecutionsJob,

  # Supply Chain
  DependabotSecurityUpdateTimeoutCleanupJob,

  # code scanning
  StaleCodeScanningCheckRunsScheduledJob,

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

  # PAT Expiry Emails
  PersonalTokenExpiryNoticeJob,
  PersonalTokenExpiredNoticeJob,

  # PAT Request Notices
  NotifyOrgAdminsAboutPatRequestsJob,

  # EMUs
  ScanEmuExternalTeamsJob,
  ScanEmuOrganizationMembershipsJob,
  ScanEmuOrganizationUsersJob,

  # AuditLog Elasticsearch Retention Curator on GHES only
  AuditLogCuratorJob,

  # AuditLog Stream health check Email
  AuditLogStreamHealthCheckerJob,

  # Expiring announcements
  RemoveExpiredAnnouncementsJob,

  # Teams
  CleanUpDeletedTeamsJob,

  # Projects
  BatchedEnqueueMemexProjectColumnIterationUpdateJob,
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

  # Security Center Analytics
  SecurityOverviewAnalytics::Helpers.calendar_population_job_class,
  SecurityOverviewAnalytics::Helpers.repository_data_cleanup_job_class,
  SecurityOverviewAnalytics::Helpers.data_retention_enforcement_job_class,

  # Security Center
  SecurityCenter::DeadLetterJob,
  SecurityCenter::KvCleanupExpiredDataJob,

  # MigrationFile cleanup
  MigrationEnqueueDestroyFileJobsJob,

  # User cleanup
  PurgeOrphanedFollowersJob,
  PurgeSoftDeletedOrganizationsJob,

  # SignupFlow KV cleanup
  SignupFlowKvCleanupExpiredDataJob,

  ###
  # Notifications
  ###
  # clean up expired entries on notification_key_values table
  DeleteExpiredNotificationsKeyValuesJob,

  # Job system cleanup
  CleanLocksJob,

  # Community & Safety
  CleanExpiredInteractionLimitsJob,

  # GitHub Apps
  CleanupExpiredPermissionsJob,

  AssociateOrganizationsWithGlobalBusinessJob,

  # Discussions
  DiscussionsKvCleanupExpiredDataJob,

  # Feature Management
  FeatureManagementKvCleanupExpiredDataJob,

  UsersKvCleanupExpiredDataJob,
  ProfilesKvCleanupExpiredDataJob,
].each do |job|
  scheduler.schedule job
end

# Pages
scheduler.schedule "DeleteDependentPagesReplicasSchedulerJob", interval: 1.day, scope: :global
scheduler.schedule "DpagesEvacuationSchedulerJob", interval: 3.minutes
scheduler.schedule "DpagesMaintenanceSchedulerJob", interval: GitHub.dpages_maintenance_scheduler_schedule_interval

# GitHub Apps
scheduler.schedule "CleanupOrphanedBotsJob", interval: 7.days
