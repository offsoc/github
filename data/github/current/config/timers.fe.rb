# frozen_string_literal: true
TIMERD_SCRIPT = true

require "timer_daemon"
require "github/config/redis"
require File.expand_path("../basic", __FILE__)
require "github"
require "github/config/stats"
require "github/config/active_job"
require "github/config/active_record"
require GitHub::AppEnvironment.root.join("packages/job_scheduling/app/models/job_scheduler")
require "active_support/core_ext/numeric/bytes"
require "active_support/core_ext/numeric/time"
require "github/timeout_and_measure"
require "github/restraint"
require "global_instrumenter"

require "github/config/active_job"
require "github/config/aqueduct"
require "github/config/flipper"
require "github/config/memcache"
require "github/config/hydro"
require "github/faraday_adapter/persistent_excon"
require "active_job/queue_adapters/aqueduct_adapter"
require_relative "instrumentation/jobs"

Hydro.load_schemas(GitHub::AppEnvironment.root.join("lib/hydro"))

require_relative "#{GitHub::AppEnvironment.root}/packages/substrate/app/models/resiliency/response"
require "#{GitHub::AppEnvironment.root}/app/jobs/perform_ofac_downgrades_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/actions/larger_runners_monitor_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/actions/scheduled_delete_action_required_check_suites_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/actions/larger_runners/find_accounts_eligible_for_disable_public_ip_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/audit_log_export_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/audit_log_stream_health_checker_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/azure/check_azure_subscriptions_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/shared_storage/start_aggregation_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/scheduled_two_factor_recovery_request_notifier_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/two_factor_recovery_request_cleanup_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/two_factor_requirement_discovery_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/two_factor_requirement_progression_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/advanced_security/self_serve_trial_cleanup_search_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/auth_and_capture/check_billable_entities_metered_usage_for_authorization_thresholds_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/check_payouts_ledger_discrepancies_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/check_unprocessed_sales_serve_webhooks_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/check_unprocessed_webhooks_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/check_unsuccessful_subscription_synchronizations_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/synchronize_apple_iap_subscription_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/synchronize_apple_iap_subscription_items_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/synchronize_google_iap_subscription_items_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/check_business_organization_transition_failures_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/check_payment_method_unique_number_identifier_reuse_over_threshold_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/billing/git_lfs_storage_metering_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/business_organization_invitation_review_digest_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/personal_token_expiry_notice_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/packages/remove_func_test_packages_job"
require "#{GitHub::AppEnvironment.root}/packages/apps/app/jobs/proxima_app_sync/synchronize_first_party_apps_job"
require "#{GitHub::AppEnvironment.root}/packages/apps/app/jobs/proxima_app_sync/synchronize_third_party_apps_job"

require "#{GitHub::AppEnvironment.root}/app/jobs/enterprise_onboarding/expire_ghas_trial_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/enterprise_onboarding/ghas_trial_eligibility_search_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/purge_soft_deleted_businesses_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/purge_soft_deleted_organizations_job"
require "#{GitHub::AppEnvironment.root}/packages/actions/app/jobs/emit_artifact_expiration_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/abuse/run_required_authorizations_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/billing/cleanup_non_emitting_orgs_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/billing/scheduled_plan_downgrade_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/billing/organizations/scheduled_plan_downgrade_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/business_trials/status_check_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/delete_orphaned_seats_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/engaged_oss_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/free_user_coupon_check_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/free_user_check_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/paid_user_free_check_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/pending_seat_assignments_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/seat_emission_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/seat_management/duplicate_seat_check_job"
require "#{GitHub::AppEnvironment.root}/packages/copilot/app/jobs/copilot/seat_management/invalid_seat_cleanup_job"
require "#{GitHub::AppEnvironment.root}/packages/billing/app/jobs/billing_kv_cleanup_job"
require "#{GitHub::AppEnvironment.root}/packages/billing/app/jobs/scheduled_azure_support_plan_sync_job"
require "#{GitHub::AppEnvironment.root}/packages/licensing/app/jobs/licensing/check_vss_subscription_event_failures_job"
require "#{GitHub::AppEnvironment.root}/packages/licensing/app/jobs/licensing/check_vss_subscription_unprocessed_events_job"
require "#{GitHub::AppEnvironment.root}/packages/licensing/app/jobs/licensing/license_snapshot_for_expired_repository_invitations_job"
require "#{GitHub::AppEnvironment.root}/packages/licensing/app/jobs/licensing/trigger_scheduled_licensing_model_transitions_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces_cache_skus_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces_cleanup_unprocessed_billing_messages_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces_fetch_billing_storage_account_names_dev_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces_fetch_billing_storage_account_names_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces_fetch_billing_storage_account_names_ppe_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces_check_for_hung_async_operations_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces_kv_cleanup_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces/upcoming_retention_notification_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces/past_retention_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces/purge_soft_deleted_codespaces_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces/check_failover_status_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces/check_for_shutdown_codespaces_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces/enqueue_upcoming_template_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces/watch_orphaned_prebuild_templates_job"
require "#{GitHub::AppEnvironment.root}/packages/codespaces/app/jobs/codespaces/clean_up_stuck_provisioning_job"
require "#{GitHub::AppEnvironment.root}/packages/gists/app/jobs/gist_maintenance_scheduler_job"
require "#{GitHub::AppEnvironment.root}/packages/gists/app/jobs/gist_purge_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/trust_tier_update_engaged_oss_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/emu_contribution_sharing_sync_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/migrate_business_provider_job"
require "#{GitHub::AppEnvironment.root}/packages/branch_protections/app/jobs/ruleset_sweeper_job"
require "#{GitHub::AppEnvironment.root}/packages/checks/app/jobs/checks_job_utility"
require "#{GitHub::AppEnvironment.root}/packages/checks/app/jobs/check_steps_orchestrate_deletion_job"
require "#{GitHub::AppEnvironment.root}/packages/checks/app/jobs/check_suites_archive_orchestration_job"
require "#{GitHub::AppEnvironment.root}/packages/checks/app/jobs/check_suites_delete_archived_orchestration_job"
require "#{GitHub::AppEnvironment.root}/packages/checks/app/jobs/statuses_archive_orchestration_job"
require "#{GitHub::AppEnvironment.root}/packages/checks/app/jobs/statuses_delete_archived_orchestration_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/packages/migration/notify_inprogress_migration_job"
require "#{GitHub::AppEnvironment.root}/packages/planning/app/jobs/report_memex_project_items_index_consistency_metric_job"
require "#{GitHub::AppEnvironment.root}/packages/planning/app/jobs/queue_memex_elasticsearch_resyncs_job"
require "#{GitHub::AppEnvironment.root}/packages/planning/app/jobs/memex_kv_cleanup_expired_data_job"
require "#{GitHub::AppEnvironment.root}/packages/pull_requests/app/jobs/ipr_kv_cleanup_expired_data_job"
require "#{GitHub::AppEnvironment.root}/packages/repositories/app/jobs/calculate_topic_applied_counts_job"
require "#{GitHub::AppEnvironment.root}/packages/repositories/app/jobs/remove_expired_announcements_job"
require "#{GitHub::AppEnvironment.root}/packages/repositories/app/jobs/repository_bulk_purge_job"
require "#{GitHub::AppEnvironment.root}/packages/repositories/app/jobs/scheduled_archive_dangling_forks_job"
require "#{GitHub::AppEnvironment.root}/packages/repositories/app/jobs/mirror_scheduler_job"
require "#{GitHub::AppEnvironment.root}/packages/repositories/app/jobs/repository_orchestration_sweeper_job"
require "#{GitHub::AppEnvironment.root}/packages/security_products/app/jobs/codeql_bulk_builder_job"
require "#{GitHub::AppEnvironment.root}/packages/security_products/app/jobs/codeql_database_cleanup_scheduler_job"
require "#{GitHub::AppEnvironment.root}/packages/security_products/app/jobs/codeql_variant_analysis_finalizer_job"
require "#{GitHub::AppEnvironment.root}/packages/security_products/app/jobs/security_center/dead_letter_job"
require "#{GitHub::AppEnvironment.root}/packages/security_products/app/jobs/security_center/kv_cleanup_expired_data_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/memex_hydro_project_automation/instrumentation/shared"
require "#{GitHub::AppEnvironment.root}/app/jobs/memex_hydro_project_automation/instrumentation/scheduled_runner"
require "#{GitHub::AppEnvironment.root}/app/jobs/memex_project_workflow_scheduled_runner_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/aqueduct_test_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/actions/scheduled_sync_dependents_count_repo_action_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/actions/scheduled_sync_dependents_count_repo_action_using_batch_dg_api_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/stop_all_stalled_progress_job"
require "#{GitHub::AppEnvironment.root}/packages/issues/app/jobs/dangling_issue_orchestration_starter_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/clean_locks_job"
require "#{GitHub::AppEnvironment.root}/packages/users/app/jobs/purge_orphaned_followers_job"
require "#{GitHub::AppEnvironment.root}/lib/background_job_queues"
require "#{GitHub::AppEnvironment.root}/packages/community_and_safety/app/jobs/clean_expired_interaction_limits_job"
require "#{GitHub::AppEnvironment.root}/packages/marketplace/app/jobs/azure_models/fetch_catalog_items_job"
require "#{GitHub::AppEnvironment.root}/packages/discussions/app/jobs/discussions_kv_cleanup_expired_data_job"
require "#{GitHub::AppEnvironment.root}/packages/management_tools/app/jobs/feature_management_kv_cleanup_expired_data_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/feeds_kv_cleanup_expired_data_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/security_products_enablement_kv_cleanup_expired_data_job"

## Notifications jobs
require "#{GitHub::AppEnvironment.root}/packages/notifications/app/jobs/delete_expired_notifications_key_values_job"

# Credit Decision Engine
require "#{GitHub::AppEnvironment.root}/packages/credit_decision_engine/app/public/credit_decision_engine"
require "#{GitHub::AppEnvironment.root}/packages/credit_decision_engine/app/jobs/credit_decision_engine/abstract_credit_check_status_poll_job"
require "#{GitHub::AppEnvironment.root}/packages/billing/app/jobs/credit_check_status_poll_job"

# Trade Compliance
require "#{GitHub::AppEnvironment.root}/packages/trade_compliance/app/public/trade_compliance"
require "#{GitHub::AppEnvironment.root}/packages/trade_compliance/app/public/trade_compliance/trade_screening"
require "#{GitHub::AppEnvironment.root}/packages/trade_compliance/app/jobs/trade_compliance/trade_screening/kv_cleanup_expired_data_job"
require_relative "../packages/users/app/jobs/users_kv_cleanup_expired_data_job"
require_relative "../packages/profiles/app/jobs/profiles_kv_cleanup_expired_data_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/trade_controls/sdn/eis_poll_job"
require "#{GitHub::AppEnvironment.root}/app/jobs/trade_controls/sdn/perform_trade_screening_retry_job"

# This load private implementation of the job and the public helper exposing the class name of the job
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/models/security_overview_analytics/feature_flag_helper"
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/jobs/security_overview_analytics/calendar_population_job"
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/jobs/security_overview_analytics/repository_data_cleanup_job"
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/jobs/security_overview_analytics/data_retention_enforcement_job"
require "#{GitHub::AppEnvironment.root}/packages/security_overview_analytics/app/public/security_overview_analytics/helpers"

require "#{GitHub::AppEnvironment.root}/packages/apps/app/jobs/cleanup_expired_permissions_job"

require "#{GitHub::AppEnvironment.root}/packages/security_products/app/jobs/security_products_enablement/progress_tracker_keys_monitor_job"

# configure ActiveJob
ActiveJob::Base.queue_adapter = :aqueduct

# configure daemon
daemon = TimerDaemon.instance
daemon.err = GitHub.logger.method(:info)
daemon.redis = GitHub.job_coordination_redis
scheduler = JobScheduler.new(daemon)

ScheduledFeTimerError = Class.new(StandardError)

# report exceptions to Failbot
daemon.error do |boom, timer|
  begin
    begin
      raise boom
    rescue boom.class
      raise ScheduledFeTimerError.new("timer #{timer.name} failed")
    end
  rescue ScheduledFeTimerError => wrapped
    Failbot.report(wrapped, timer: timer.name)
  end
end

daemon.schedule "timerd-heartbeat-fe-global", 10.seconds do
  GitHub.dogstats.increment "timerd.heartbeat", tags: ["config:fe", "scope:global"]
end

daemon.schedule "timerd-heartbeat-fe-host", 10.seconds, scope: :host do
  GitHub.dogstats.increment "timerd.heartbeat", tags: ["config:fe", "scope:host"]
end

daemon.schedule "dgit-disk-stats-timer", GitHub.dgit_disk_stats_interval do
  SpokesDiskStatsCacheFillJob.perform_later(Time.now.to_i)
end

daemon.schedule "dotcom-worker-monitor", AqueductTestJob::MONITOR_JOB_INTERVAL, scope: :host do
  BackgroundJobQueues.monitor_queue_names.each do |queue_name|
    AqueductTestJob.set(queue: queue_name).perform_later
  end
end

[
  # Billing
  PerformManualDunningPeriodJob,
  PerformPendingPlanChangesJob,
  BillingCouponReminderJob,
  BillingDeleteObsoleteCouponExpirationNoticesJob,
  BillingExpiringCardRemindersJob,
  BillingUpdateExchangeRatesJob,
  BillingUpdateTransactionsWithPendingStatusJob,
  BillingRunStartJob,
  EnsureRecentlyUpdatedPayoutsLedgersInBalanceJob,
  BillingFreeTrialReminderJob,
  PerformOFACDowngradesJob,
  RetrieveFailedZuoraWebhooksJob,
  YearlyCycleNoticeStartJob,
  Billing::SharedStorage::StartAggregationJob,
  Billing::Azure::CheckAzureSubscriptionsJob,
  Billing::CheckPayoutsLedgerDiscrepanciesJob,
  Billing::CheckUnprocessedWebhooksJob,
  Billing::CheckUnprocessedSalesServeWebhooksJob,
  Billing::CheckUnsuccessfulSubscriptionSynchronizationsJob,
  Billing::SynchronizeAppleIapSubscriptionJob,
  Billing::SynchronizeAppleIapSubscriptionItemsJob,
  Billing::SynchronizeGoogleIapSubscriptionItemsJob,
  Billing::CheckBusinessOrganizationTransitionFailuresJob,
  Billing::CheckPaymentMethodUniqueNumberIdentifierReuseOverThresholdJob,
  Billing::GitLfsStorageMeteringJob,
  Billing::AuthAndCapture::CheckBillableEntitiesMeteredUsageForAuthorizationThresholdsJob,
  BillingKvCleanupJob,
  CreditCheckStatusPollJob,
  ScheduledAzureSupportPlanSyncJob,

  # Licensing
  Licensing::CheckVssSubscriptionEventFailuresJob,
  Licensing::CheckVssSubscriptionUnprocessedEventsJob,
  Licensing::LicenseSnapshotForExpiredRepositoryInvitationsJob,
  Licensing::TriggerScheduledLicensingModelTransitionsJob,

  # Cached Topics stats
  CalculateTopicAppliedCountsJob,

  NewsletterDeliveryJob,

  # Git Maintenance
  NetworkMaintenanceSchedulerJob,
  WikiMaintenanceSchedulerJob,
  GistMaintenanceSchedulerJob,

  QueueMediaTransitionJobsJob,

  ###
  # Notifications
  ###
  NewsiesAutoSubscribeJob,  # Iterates through all users in `notification_subscriptions`
  # clean up expired entries on mysql2/notification_key_values
  DeleteExpiredNotificationsKeyValuesJob,


  RemoveExpiredOauthJob,
  RemoveStaleOauthJob,
  RemoveStalePublicKeysJob,
  RemoveStaleAuthenticationRecordsJob,
  RemoveStaleAuthenticatedDevicesJob,

  OtpSmsTimingCleanupJob,

  # grab nexmo sms provider account balance
  NexmoBalanceStatsJob,

  SyncAssetUsageSchedulerJob,

  # orchestrations
  DanglingIssueOrchestrationStarterJob,
  RepositoryOrchestrationSweeperJob,

  # deleting stuff
  RulesetSweeperJob,
  MigrationEnqueueDestroyFileJobsJob,
  PurgeArchivedAssetsJob,
  PurgeRestorablesJob,
  RepositoryBulkPurgeJob,
  GistPurgeJob,
  DestroyDeletedPackageVersionsJob,
  PurgeFlaggedUploadsJob,
  Packages::RemoveFuncTestPackagesJob,
  DeleteExpiredReservedLoginTombstonesJob,
  ActionsKvCleanupExpiredDataJob,
  PurgeOrphanedFollowersJob,
  GrowthNoticeKvCleanupExpiredDataJob,
  GrowthLastActivityKvCleanupExpiredDataJob,
  PurgeSoftDeletedOrganizationsJob,
  IprKvCleanupExpiredDataJob,
  FeedsKvCleanupExpiredDataJob,
  SecurityProductsEnablementKvCleanupExpiredDataJob,

  # archive
  ScheduledArchiveDanglingForksJob,

  # spam
  UpdateUserHiddenMismatchesJob,
  SpamKvCleanupJob,

  # Authentication
  QintelImportNewFiles,
  ScheduledTwoFactorRecoveryRequestNotifierJob,
  TwoFactorRecoveryRequestCleanupJob,
  AuthenticationKvCleanupExpiredDataJob,
  AuthenticatedAfterTwoFactorRecoveryRequestJob,
  TwoFactorRequiredNotifierJob,
  TwoFactorRequirementDiscoveryJob,
  TwoFactorRequirementProgressionJob,
  ScheduledGlobalNoticeRefreshJob,

  # Git Backups
  GitbackupsSchedulerJob,
  GitbackupsSweeperJob,
  GitbackupsEnsureFreshKeyJob,
  GitbackupsMigrationSchedulerJob,

  # GitHub Models
  AzureModels::FetchCatalogItemsJob,

  # Marketplace
  UpdateMarketplaceInsightsJob,
  MarketplaceBlogSyncJob,
  SyncMarketplaceSearchIndexJob,

  MirrorSchedulerJob,

  # Supply Chain
  DependabotSecurityUpdateTimeoutCleanupJob,
  VulnerabilityAlertingEventProcessObserverJob,

  # code scanning
  StaleCodeScanningCheckRunsScheduledJob,
  CodeqlBulkBuilderJob,
  CodeqlDatabaseCleanupSchedulerJob,
  CodeqlVariantAnalysisFinalizerJob,

  ExampleScheduledJob,

  EnqueueAqueductTestJob,
  AqueductRelayTestJob,

  ScienceEventCleanupJob,

  # feature-management
  StaleCheckJob,

  EnqueueUpcomingRemindersJob,

  # Enterprise accounts
  BusinessOrganizationInvitationReviewDigestJob,
  BusinessTrialExpirationJob,
  BusinessTrialRestoreUpgradeStateJob,
  BusinessReportExportsCleanupJob,
  InvalidateExpiredInvitesJob,
  ExpireBusinessAdminInvitationsJob,
  ExpireBusinessOrganizationInvitationsJob,
  SendBusinessOrganizationInvitationRemindersJob,
  PurgeSoftDeletedBusinessesJob,
  PurgeCancelledTrialsJob,
  NotifyExpiredTrialAndQueueDeletionJob,

  # Delete redundant business organization invitations
  DeleteRedundantBusinessOrganizationInvitationsJob,

  # Copilot
  Copilot::Abuse::RunRequiredAuthorizationsJob,
  Copilot::Billing::CleanupNonEmittingOrgsJob,
  Copilot::Billing::ScheduledPlanDowngradeJob,
  Copilot::Billing::Organizations::ScheduledPlanDowngradeJob,
  Copilot::BusinessTrials::StatusCheckJob,
  Copilot::DeleteOrphanedSeatsJob,
  Copilot::EngagedOssJob,
  Copilot::FreeUserCouponCheckJob,
  Copilot::FreeUserCheckJob,
  Copilot::PaidUserFreeCheckJob,
  Copilot::PendingSeatAssignmentsJob,
  Copilot::SeatEmissionJob,
  Copilot::SeatManagement::DuplicateSeatCheckJob,
  Copilot::SeatManagement::InvalidSeatCleanupJob,

  # Codespaces
  CodespacesCacheSkusJob,
  CodespacesCheckForHungAsyncOperationsJob,
  CodespacesCleanupUnprocessedBillingMessagesJob,
  CodespacesFetchBillingStorageAccountNamesDevJob,
  CodespacesFetchBillingStorageAccountNamesJob,
  CodespacesFetchBillingStorageAccountNamesPpeJob,
  Codespaces::CheckFailoverStatusJob,
  Codespaces::CheckForShutdownCodespacesJob,
  Codespaces::EnqueueUpcomingTemplateJob,
  Codespaces::PastRetentionJob,
  Codespaces::PurgeSoftDeletedCodespacesJob,
  Codespaces::UpcomingRetentionNotificationJob,
  Codespaces::WatchOrphanedPrebuildTemplatesJob,
  Codespaces::CleanUpStuckProvisioningJob,
  CodespacesKvCleanupJob,

  # Trade Compliance
  TradeCompliance::TradeScreening::KvCleanupExpiredDataJob,
  TradeControls::Sdn::EisPollJob,
  TradeControls::Sdn::PerformTradeScreeningRetryJob,

  # Advanced Security
  MeteredAdvancedSecurityScheduledEmitterJob,

  # projects
  BatchedEnqueueMemexProjectColumnIterationUpdateJob,
  PurgeDeletedMemexProjectsJob,
  MemexKvCleanupExpiredDataJob,
  MemexWaitlistProcessorJob,
  ReportMemexProjectItemsIndexConsistencyMetricJob,
  QueueMemexElasticsearchResyncsJob,

  # Actions & Checks
  Actions::ScheduledDeleteActionRequiredCheckSuitesJob,
  Actions::LargerRunnersMonitorJob,

  # Actions & Larger Runners
  Actions::LargerRunners::FindAccountsEligibleForDisablePublicIpJob,

  CheckStepsOrchestrateDeletionJob,
  CheckSuitesArchiveOrchestrationJob,
  CheckSuitesDeleteArchivedOrchestrationJob,
  StatusesArchiveOrchestrationJob,
  StatusesDeleteArchivedOrchestrationJob,
  EmitArtifactExpirationJob,

  # PAT Expiry Notices
  PersonalTokenExpiryNoticeJob,
  PersonalTokenExpiredNoticeJob,

  # PAT Request Notices
  NotifyOrgAdminsAboutPatRequestsJob,

  # Proxima App Sync
  ProximaAppSync::SynchronizeFirstPartyAppsJob,
  ProximaAppSync::SynchronizeThirdPartyAppsJob,

  # EMUs
  EmuContributionSharingSyncJob,
  MigrateBusinessProviderJob,
  ScanEmuExternalTeamsJob,
  ScanEmuOrganizationMembershipsJob,
  ScanEmuOrganizationUsersJob,

  # GHAS Trial removal
  EnterpriseOnboarding::ExpireGhasTrialJob,

  # GHAS Trial eligibility
  EnterpriseOnboarding::GhasTrialEligibilitySearchJob,
  # Advanced Security self-serve trial expiry cleanup
  Billing::AdvancedSecurity::SelfServeTrialCleanupSearchJob,

  # Org admin notification about requested features
  MemberFeatureRequestNotificationJob,

  # GitHub for Startups Renewal email
  StartupProgramRenewalEmailJob,

  # GitHub for Startups Coupon EA email
  StartupProgramCouponEmailJob,

  # Expiring announcements
  RemoveExpiredAnnouncementsJob,

  # Trust tiers
  TrustTierUpdateEngagedOssJob,

  # Teams
  CleanUpDeletedTeamsJob,

  # Packages
  Packages::Migration::NotifyInprogressMigrationJob,

  # Memex Automation
  MemexProjectWorkflowScheduledRunnerJob,

  # Sync dependents count for actions
  Actions::ScheduledSyncDependentsCountRepoActionJob,

  # Distributed progress tracking
  StopAllStalledProgressJob,

  # Sync dependents count for actions using batched dg api
  Actions::ScheduledSyncDependentsCountRepoActionUsingBatchDgApiJob,

  # Security Center Analytics
  SecurityOverviewAnalytics::Helpers.calendar_population_job_class,
  SecurityOverviewAnalytics::Helpers.repository_data_cleanup_job_class,
  SecurityOverviewAnalytics::Helpers.data_retention_enforcement_job_class,

  # Security Center
  SecurityCenter::DeadLetterJob,
  SecurityCenter::KvCleanupExpiredDataJob,

  # Job system cleanup
  CleanLocksJob,

  # Audit log
  AuditLogExportJob,
  AuditLogStreamHealthCheckerJob,

  # Community & Safety
  CleanExpiredInteractionLimitsJob,

  # Signup Flow
  SignupFlowKvCleanupExpiredDataJob,

  # GitHub Apps
  CleanupExpiredPermissionsJob,

  # Discussions
  DiscussionsKvCleanupExpiredDataJob,

  # Feature Management
  FeatureManagementKvCleanupExpiredDataJob,

  # Security products enablement
  SecurityProductsEnablement::ProgressTrackerKeysMonitorJob,

  UsersKvCleanupExpiredDataJob,
  ProfilesKvCleanupExpiredDataJob,
].each do |job|
  scheduler.schedule job
end

# Search engine indexing
scheduler.schedule "SearchEngineIndexing::EnqueueUsersForIndexingJob", interval: 1.day, condition: -> { !GitHub.enterprise? }
scheduler.schedule "SearchEngineIndexing::EnqueueRepositoriesForIndexingJob", interval: 1.hour, condition: -> { !GitHub.enterprise? }

scheduler.schedule "FeatureShowcasesJob", interval: 1.day
scheduler.schedule "MailchimpDataQualitySyncJob", interval: 1.week

# Sponsors
scheduler.schedule "AutoAcceptSponsorsApplicationsJob", interval: 24.hours, condition: -> { GitHub.sponsors_enabled? }
scheduler.schedule "CancelSponsorshipsFromAbusiveSponsorsJob", interval: 1.day, condition: -> { GitHub.sponsors_enabled? }
scheduler.schedule "DeactivateExpiredSponsorshipsJob", interval: 1.day, condition: -> { GitHub.sponsors_enabled? }
scheduler.schedule "EnableSponsorsPayoutsJob", interval: 1.day, condition: -> { GitHub.sponsors_enabled? }
scheduler.schedule "PopulateSponsorsFraudReviewsJob", interval: 4.hours, condition: -> { GitHub.sponsors_enabled? }
scheduler.schedule "SponsorsProfileSetupReminderJob", interval: 1.day, condition: -> { GitHub.sponsors_enabled? }
scheduler.schedule "SyncSponsorsStripeAccountsJob", interval: 5.minutes, condition: -> { GitHub.sponsors_enabled? }
scheduler.schedule "UpdateSponsorsActivityMetricsJob", interval: 1.day, condition: -> { GitHub.sponsors_enabled? }
scheduler.schedule "ScheduledSponsorsPatreonSyncJob", interval: 24.hours, condition: -> { GitHub.sponsors_enabled? }

# Pages
scheduler.schedule "DeleteDependentPagesReplicasSchedulerJob", interval: 1.day, scope: :global
scheduler.schedule "DpagesEvacuationSchedulerJob", interval: 3.minutes
scheduler.schedule "DpagesMaintenanceSchedulerJob", interval: GitHub.dpages_maintenance_scheduler_schedule_interval
scheduler.schedule "PageCertificateRemoveDuplicateJob", interval: 1.hour, condition: -> { GitHub.fastly_enabled? && GitHub.pages_custom_domain_https_enabled? }
scheduler.schedule "PageCertificateRemoveExpiredJob", interval: 1.hour, condition: -> { GitHub.fastly_enabled? && GitHub.pages_custom_domain_https_enabled? }
scheduler.schedule "PageCertificateRenewJob", interval: 30.seconds, condition: -> { GitHub.pages_custom_domain_https_enabled? }
scheduler.schedule "PageMigrateHostSchedulerJob", interval: 2.minutes
scheduler.schedule "Pages::DestroySoftDeletedPagesJob", interval: 12.hours
scheduler.schedule "Pages::ProcessPendingDomainsJob", interval: 12.hours
scheduler.schedule "Pages::VerifyDomainsJob", interval: 7.days

# Growth
scheduler.schedule "MemberFeatureRequest::SyncCopilotForBusinessSeatStatusJob", interval: 24.hours

# Copilot
scheduler.schedule "PullRequests::Copilot::ScheduledSummariesFeedbackCleanupJob", interval: 1.day, condition: -> { !GitHub.enterprise? }

# GitHub Apps
scheduler.schedule "CleanupOrphanedBotsJob", interval: 7.days

# Advisory Database
scheduler.schedule "EPSSIngestionJob", interval: 1.day, condition: -> { !GitHub.enterprise? }
