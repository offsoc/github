DROP TABLE IF EXISTS `copilot_administrative_blocks`;
CREATE TABLE `copilot_administrative_blocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint unsigned NOT NULL,
  `blockable_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `blockable_id` bigint NOT NULL,
  `reason` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_copilot_administrative_blocks_on_blockable` (`blockable_type`,`blockable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_aggregate_usage_details`;
CREATE TABLE `copilot_aggregate_usage_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `editor_details` varchar(200) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL COMMENT 'The version of the editor used by the user',
  `usage_date` date DEFAULT NULL COMMENT 'Date for which usage was reported',
  `usage_hour` int DEFAULT NULL COMMENT 'Hour for which usage was reported',
  `usage_count` int DEFAULT '0' COMMENT 'Number of times the user used the editor on this date in this hour',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_org_editor_date_details` (`user_id`,`editor_details`,`usage_date`),
  KEY `index_copilot_aggregate_usage_details_on_editor_details` (`editor_details`),
  KEY `index_copilot_aggregate_usage_details_on_usage_date` (`usage_date`),
  KEY `index_copilot_aggregate_usage_details_on_usage_hour` (`usage_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_business_trials`;
CREATE TABLE `copilot_business_trials` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `copilot_plan` tinyint NOT NULL DEFAULT '0' COMMENT 'the GitHub Copilot plan the trial is for, e.g. Copilot Enterprise or Copilot Business',
  `trialable_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `trialable_id` bigint unsigned NOT NULL COMMENT 'The object (Business/Enterprise or Org) that this trial is for',
  `trial_length` int NOT NULL DEFAULT '30' COMMENT 'The length of the trial in days',
  `started_at` datetime(6) NOT NULL COMMENT 'The time the trial started',
  `ends_at` datetime(6) NOT NULL COMMENT 'The time the trial ends',
  `managing_user_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_business_trials_on_trialable` (`trialable_type`,`trialable_id`),
  KEY `index_copilot_business_trials_on_managing_user_id` (`managing_user_id`),
  KEY `index_copilot_business_trials_on_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_coding_guideline_paths`;
CREATE TABLE `copilot_coding_guideline_paths` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `copilot_coding_guideline_id` bigint unsigned NOT NULL,
  `path` varchar(200) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_on_copilot_coding_guideline_id_02dcbc1309` (`copilot_coding_guideline_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_coding_guidelines`;
CREATE TABLE `copilot_coding_guidelines` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `name` varchar(200) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `example_code_violations` text COLLATE utf8mb4_unicode_520_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `copilot_code_guidelines_repo_id_and_name` (`repository_id`,`name`),
  KEY `index_copilot_coding_guidelines_on_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_completion_feedback`;
CREATE TABLE `copilot_completion_feedback` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `job_id` varchar(55) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `sentiment` int NOT NULL DEFAULT '0',
  `contact` tinyint(1) NOT NULL DEFAULT '0',
  `context` blob NOT NULL,
  `body` mediumblob,
  `classification` int NOT NULL DEFAULT '0',
  `session_id` varchar(55) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_copilot_completion_feedback_on_sentiment` (`sentiment`),
  KEY `index_copilot_completion_feedback_on_session_id` (`session_id`),
  KEY `index_copilot_completion_feedback_on_job_id` (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_complimentary_users`;
CREATE TABLE `copilot_complimentary_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `free_user_type` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'the type of the free user',
  `last_checked_date` date NOT NULL,
  `subscribed` tinyint(1) NOT NULL DEFAULT '0',
  `subscribed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_complimentary_users_on_user_id` (`user_id`),
  KEY `index_free_user_type` (`free_user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_configurations`;
CREATE TABLE `copilot_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `configurable_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `configurable_id` bigint NOT NULL COMMENT 'The object (Business, Org, or User) that this configuration is for',
  `public_code_suggestions` int NOT NULL DEFAULT '0' COMMENT 'Whether to show code suggestions from public sources',
  `user_telemetry` int NOT NULL DEFAULT '0' COMMENT 'Whether to send telemetry data to GitHub',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `copilot_enabled` int NOT NULL DEFAULT '0' COMMENT 'Whether Copilot is enabled for this configurable (Organization or Business)',
  `seat_management` int NOT NULL DEFAULT '0',
  `chat_enabled` int NOT NULL DEFAULT '0',
  `max_seats` int NOT NULL DEFAULT '0' COMMENT 'The maximum number of seats allowed for this configurable (Organization or Business)',
  `dotcom_chat` tinyint NOT NULL DEFAULT '0',
  `custom_models` tinyint NOT NULL DEFAULT '0',
  `cli` tinyint NOT NULL DEFAULT '0',
  `private_docs` tinyint NOT NULL DEFAULT '0',
  `github_enterprise_feature_group` tinyint NOT NULL DEFAULT '0' COMMENT 'Keep track if the group of enterprise features has been enabled',
  `pr_summarizations` tinyint NOT NULL DEFAULT '0' COMMENT 'policy for GitHub Copilot for Pull Request Summarizations',
  `pr_diff_chats` tinyint NOT NULL DEFAULT '0' COMMENT 'policy for GitHub Copilot for Pull Request Diff Chat',
  `usage_telemetry_api` tinyint NOT NULL DEFAULT '0',
  `copilot_plan` tinyint NOT NULL DEFAULT '0' COMMENT 'the current GitHub Copilot plan, e.g. Copilot Enterprise or Copilot Business',
  `pending_plan_downgrade_date` date DEFAULT NULL,
  `ide_chat` tinyint NOT NULL DEFAULT '2',
  `user_feedback_opt_in` tinyint NOT NULL DEFAULT '1' COMMENT 'policy for GitHub Copilot for user feedback opt in',
  `bing_github_chat` tinyint NOT NULL DEFAULT '0' COMMENT 'policy for Bing usage by Copilot in GitHub',
  `mobile_chat` tinyint NOT NULL DEFAULT '0' COMMENT 'The policy for Copilot in Mobile',
  `copilot_extensions` tinyint NOT NULL DEFAULT '0' COMMENT 'The policy for allowing Copilot extensions',
  `beta_features_github_chat` tinyint NOT NULL DEFAULT '0' COMMENT 'policy for beta features usage by Copilot in GitHub',
  `private_telemetry` tinyint NOT NULL DEFAULT '0' COMMENT 'The policy for allowing private telemetry capture',
  `prompt_overlap` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether to show code suggestions from public sources when the response is contained within the prompt',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_index_copilot_configurations_on_configurable` (`configurable_id`,`configurable_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_custom_instructions`;
CREATE TABLE `copilot_custom_instructions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `owner_type` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `prompt` text COLLATE utf8mb4_unicode_520_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `updated_by_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_custom_instructions_on_owner_id_and_owner_type` (`owner_id`,`owner_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_engaged_oss_repositories`;
CREATE TABLE `copilot_engaged_oss_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL COMMENT 'The repository',
  `language_name_id` bigint unsigned NOT NULL COMMENT 'The language the repository qualifies for engaged oss',
  `license_id` bigint unsigned NOT NULL COMMENT 'The license the repository uses',
  `rank` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'The rank of the repository for the language',
  `stargazer_count` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'The number of stargazers the repository has when updated',
  `fork_count` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'The number of forks the repository has when updated',
  `last_pushed_at` datetime(6) DEFAULT NULL COMMENT 'The last time the repository was pushed to when updated',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_engaged_oss_repositories_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_engaged_oss_users`;
CREATE TABLE `copilot_engaged_oss_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `language` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'all' COMMENT 'the language of the processor job (default all for all of github)',
  `role` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'read' COMMENT 'the highest role of the user in this repo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_engaged_oss_users_on_repository_id_and_user_id` (`repository_id`,`user_id`),
  KEY `index_copilot_engaged_oss_users_on_language` (`language`),
  KEY `index_copilot_engaged_oss_users_on_role` (`role`),
  KEY `index_copilot_engaged_oss_users_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_extensions_agreement_signatures`;
CREATE TABLE `copilot_extensions_agreement_signatures` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `signatory_id` bigint unsigned NOT NULL COMMENT 'The user who signed the agreement',
  `organization_id` bigint unsigned DEFAULT NULL COMMENT 'Optional. The organization that the user signed the agreement on behalf of',
  `business_id` bigint unsigned DEFAULT NULL COMMENT 'Optional. The business that the user signed the agreement on behalf of',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_copilot_extensions_agreement_signatures_on_signatory_id` (`signatory_id`),
  KEY `idx_on_organization_id_85e1de1099` (`organization_id`),
  KEY `index_copilot_extensions_agreement_signatures_on_business_id` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_ide_notifications`;
CREATE TABLE `copilot_ide_notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `notification_id` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'This represents the notification message to be sent',
  `acknowledged_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_ide_notifications_on_user_id_and_notification_id` (`user_id`,`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_ignores`;
CREATE TABLE `copilot_ignores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned DEFAULT NULL COMMENT 'The organization that ultimately owns this exclusion document',
  `resource_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `resource_id` bigint NOT NULL COMMENT 'The repository or organization that owns this exclusion document',
  `document` mediumblob COMMENT 'The exclusion document itself',
  `updated_by_id` bigint unsigned DEFAULT NULL COMMENT 'The user who last updated the record',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_ignores_on_resource` (`resource_type`,`resource_id`),
  KEY `index_copilot_ignores_on_organization_id` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_indexed_repositories`;
CREATE TABLE `copilot_indexed_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `markdown_only` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_indexed_repositories_on_repository_id` (`repository_id`),
  KEY `index_copilot_indexed_repositories_on_organization_id` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_organization_events`;
CREATE TABLE `copilot_organization_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned DEFAULT NULL,
  `owner_type` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `organization_id` bigint DEFAULT NULL COMMENT 'The organization',
  `user_id` bigint unsigned NOT NULL COMMENT 'The user who triggered the event',
  `event_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'The type of event',
  `event_data` text COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'The data for the event',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_copilot_organization_events_on_org_id_event_type` (`organization_id`,`event_type`),
  KEY `index_copilot_organization_events_on_user_id_event_type` (`user_id`,`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_public_users`;
CREATE TABLE `copilot_public_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `settings` json DEFAULT NULL COMMENT 'The user''s settings and details for Copilot',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_public_users_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_required_authorizations`;
CREATE TABLE `copilot_required_authorizations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `owner_id` bigint NOT NULL,
  `reason` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_copilot_required_authorizations_on_owner` (`owner_type`,`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_seat_assignments`;
CREATE TABLE `copilot_seat_assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned DEFAULT NULL,
  `owner_type` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `organization_id` bigint DEFAULT NULL,
  `assignable_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `assignable_id` bigint NOT NULL,
  `pending_cancellation_date` date DEFAULT NULL,
  `assigning_user_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_copilot_seat_assignments_on_organization_id` (`organization_id`),
  KEY `index_copilot_seat_assignments_on_assignables` (`assignable_id`,`assignable_type`),
  KEY `index_copilot_seat_assignments_on_owner_id_and_owner_type` (`owner_id`,`owner_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_seat_emissions`;
CREATE TABLE `copilot_seat_emissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned DEFAULT NULL,
  `owner_type` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `organization_id` bigint DEFAULT NULL COMMENT 'The organization that this seat emission is for',
  `emission` json NOT NULL COMMENT 'The emission message (in JSON) that was sent',
  `unique_id` varchar(36) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'UUID - The unique ID of the seat emission',
  `occurred_at` datetime(6) NOT NULL COMMENT 'The date/time that the seat emission occurred',
  `quantity` decimal(22,9) NOT NULL DEFAULT '0.000000000' COMMENT 'The quantity of the seat emission',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_copilot_seat_emissions_on_organization_id` (`organization_id`),
  KEY `index_copilot_seat_emissions_on_unique_id` (`unique_id`),
  KEY `index_copilot_seat_emissions_on_occurred_at` (`occurred_at`),
  KEY `index_copilot_seat_assignments_on_owner_id_and_owner_type` (`owner_id`,`owner_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_seat_histories`;
CREATE TABLE `copilot_seat_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned DEFAULT NULL,
  `owner_type` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `business_id` bigint DEFAULT NULL,
  `organization_id` bigint DEFAULT NULL,
  `seat_id` bigint DEFAULT NULL,
  `assigned_user_id` bigint DEFAULT NULL,
  `seat_created_at` date DEFAULT NULL,
  `seat_deleted_at` date DEFAULT NULL,
  `billing_cycle_start_date` date NOT NULL,
  `billing_cycle_end_date` date NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_seat_histories_on_seat_id` (`seat_id`),
  KEY `index_copilot_seat_histories_on_assigned_user_id` (`assigned_user_id`),
  KEY `business_and_billing_cycle` (`business_id`,`billing_cycle_start_date`,`billing_cycle_end_date`),
  KEY `organization_and_billing_cycle` (`organization_id`,`billing_cycle_start_date`,`billing_cycle_end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_seats`;
CREATE TABLE `copilot_seats` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint DEFAULT NULL,
  `copilot_seat_assignment_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `assigned_user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_copilot_seats_on_organization_id` (`organization_id`),
  KEY `index_copilot_seats_on_copilot_seat_assignment_id` (`copilot_seat_assignment_id`),
  KEY `index_copilot_seats_on_assigned_user_id` (`assigned_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_tech_preview_users`;
CREATE TABLE `copilot_tech_preview_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `sent_email_count` int NOT NULL DEFAULT '0' COMMENT 'incremented after each email sent and checked before sending',
  `subscribed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_copilot_tech_preview_users_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_usage_metrics`;
CREATE TABLE `copilot_usage_metrics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `business_id` bigint DEFAULT NULL COMMENT 'The business that this usage metric is under (if any)',
  `organization_id` bigint DEFAULT NULL COMMENT 'The organization that this usage metric is under',
  `team_id` bigint DEFAULT NULL COMMENT 'The team that this usage metric is under',
  `enterprise_team_id` bigint DEFAULT NULL COMMENT 'The enterprise team that this usage metric is under',
  `language_name_id` bigint DEFAULT NULL COMMENT 'The language this usage metric is for',
  `date` date NOT NULL COMMENT 'The date this usage metric is for',
  `suggestions_count` int NOT NULL DEFAULT '0' COMMENT 'The number of suggestions made',
  `acceptances_count` int NOT NULL DEFAULT '0' COMMENT 'The number of suggestions accepted',
  `lines_suggested` int NOT NULL DEFAULT '0' COMMENT 'The number of lines suggested',
  `lines_accepted` int NOT NULL DEFAULT '0' COMMENT 'The number of lines accepted',
  `active_users` int NOT NULL DEFAULT '0' COMMENT 'The number of active users (have accepted at least one suggestion)',
  `chat_messages` int NOT NULL DEFAULT '0' COMMENT 'The number of chat messages sent',
  `chat_active_users` int NOT NULL DEFAULT '0' COMMENT 'The number of active chat users',
  `chat_acceptances` int NOT NULL DEFAULT '0' COMMENT 'The number of chat messages sent',
  `editor` int NOT NULL DEFAULT '0' COMMENT 'The editor this usage metric is for',
  `metadata` json NOT NULL COMMENT 'The metadata for this usage metric',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `language` varchar(100) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL COMMENT 'The language this usage metric is for (if no matching LanguageName)',
  PRIMARY KEY (`id`),
  KEY `index_copilot_usage_metrics_on_business_id` (`business_id`),
  KEY `index_copilot_usage_metrics_on_organization_id` (`organization_id`),
  KEY `index_copilot_usage_metrics_on_language_name_id` (`language_name_id`),
  KEY `index_copilot_usage_metrics_on_team_id` (`team_id`),
  KEY `index_copilot_usage_metrics_on_date` (`date`),
  KEY `index_copilot_usage_metrics_on_editor` (`editor`),
  KEY `index_copilot_usage_metrics_on_enterprise_team_id` (`enterprise_team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `integration_agents`;
CREATE TABLE `integration_agents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `integration_id` bigint unsigned NOT NULL,
  `url` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `client_authorization_url` text COLLATE utf8mb4_unicode_520_ci,
  `skill_data` json DEFAULT NULL,
  `app_type` enum('disabled','agent','skill') COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'agent',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_integration_agents_on_integration_id` (`integration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `orca_models`;
CREATE TABLE `orca_models` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned NOT NULL,
  `resource` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `deployment` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `pipeline_id` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_orca_models_on_pipeline_id` (`pipeline_id`),
  KEY `index_orca_models_on_organization_id` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
