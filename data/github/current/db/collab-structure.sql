DROP TABLE IF EXISTS `abuse_reports`;
CREATE TABLE `abuse_reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reporting_user_id` bigint unsigned DEFAULT NULL,
  `reported_user_id` bigint unsigned NOT NULL,
  `reported_content_id` bigint unsigned DEFAULT NULL,
  `reported_content_type` varchar(40) DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `reason` tinyint NOT NULL DEFAULT '0',
  `show_to_maintainer` tinyint(1) NOT NULL DEFAULT '0',
  `resolved` tinyint(1) NOT NULL DEFAULT '0',
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_abuse_reports_on_reported_user_id` (`reported_user_id`),
  KEY `index_abuse_reports_on_content_and_reason` (`reported_content_id`,`reported_content_type`,`reason`),
  KEY `index_abuse_reports_on_repo_and_show_to_maintainer_and_resolved` (`repository_id`,`show_to_maintainer`,`resolved`),
  KEY `index_abuse_reports_on_reporting_user_id_and_user_hidden` (`reporting_user_id`,`user_hidden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `achievement_progressions`;
CREATE TABLE `achievement_progressions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `achievable_slug` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `private_count` int NOT NULL DEFAULT '0',
  `public_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_achievement_progressions_on_user_id_and_achievable_slug` (`user_id`,`achievable_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `achievements`;
CREATE TABLE `achievements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `achievable_slug` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `tier` int unsigned NOT NULL DEFAULT '0',
  `unlocked_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `unlocking_model_id` bigint unsigned DEFAULT NULL,
  `unlocking_model_type` varchar(40) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `unlocking_oid` varchar(40) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `seen_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `visibility` int NOT NULL DEFAULT '0',
  `hidden` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_user_id_and_slug_and_tier_and_visibility` (`user_id`,`achievable_slug`,`tier`,`visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `action_packages_metadata`;
CREATE TABLE `action_packages_metadata` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `action_package_name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `tag_name` varbinary(1024) NOT NULL,
  `package_metadata` json DEFAULT NULL,
  `state` tinyint unsigned NOT NULL,
  `error_message` text COLLATE utf8mb4_unicode_520_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `release_tag` varbinary(1024) NOT NULL DEFAULT '',
  `major_version` int unsigned NOT NULL DEFAULT '0',
  `is_latest` tinyint(1) NOT NULL DEFAULT '0',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_action_packages_metadata_action_package_name_tag` (`action_package_name`,`tag_name`),
  KEY `index_action_packages_metadata_name_major_version_latest_deleted` (`action_package_name`,`major_version`,`is_latest`,`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `actions_allowlists`;
CREATE TABLE `actions_allowlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_type` varchar(255) NOT NULL,
  `entity_id` int NOT NULL,
  `github_owned_allowed` tinyint(1) NOT NULL DEFAULT '0',
  `verified_allowed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_actions_allowlists_on_entity_type_and_entity_id` (`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `acv_contributors`;
CREATE TABLE `acv_contributors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `contributor_email` varchar(255) NOT NULL,
  `ignore` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_id_contributor_email` (`repository_id`,`contributor_email`),
  KEY `index_contributor_email_ignore` (`contributor_email`,`ignore`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `advisory_credits`;
CREATE TABLE `advisory_credits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ghsa_id` varchar(19) NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `declined_at` datetime DEFAULT NULL,
  `recipient_id` bigint unsigned NOT NULL,
  `notified_at` datetime DEFAULT NULL,
  `repository_advisory_id` bigint unsigned DEFAULT NULL,
  `vulnerability_id` bigint unsigned DEFAULT NULL,
  `credit_type` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_advisory_credits_on_ghsa_id_and_recipient_id` (`ghsa_id`,`recipient_id`),
  KEY `index_advisory_credits_on_ghsa_id_and_accepted_at` (`ghsa_id`,`accepted_at`),
  KEY `index_advisory_credits_on_recipient_id_and_accepted_at` (`recipient_id`,`accepted_at`),
  KEY `index_advisory_credits_on_accepted_at_and_vulnerability_id` (`accepted_at`,`vulnerability_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `allowed_action_patterns`;
CREATE TABLE `allowed_action_patterns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actions_allowlist_id` int NOT NULL,
  `value` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_allowed_action_patterns_on_actions_allowlist_id_and_value` (`actions_allowlist_id`,`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `allowed_stacks_patterns`;
CREATE TABLE `allowed_stacks_patterns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `stacks_allowlist_id` bigint NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_allowed_stacks_patterns_on_stacks_allowlist_id_and_value` (`stacks_allowlist_id`,`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `application_callback_urls`;
CREATE TABLE `application_callback_urls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` blob NOT NULL,
  `application_id` int NOT NULL,
  `application_type` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_callback_urls_on_application_and_url` (`application_id`,`application_type`,`url`(2000))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `applied_discussion_labels`;
CREATE TABLE `applied_discussion_labels` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `discussion_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `label_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_applied_discussion_labels_on_discussion_id_and_label_id` (`discussion_id`,`label_id`),
  KEY `index_applied_discussion_labels_on_label_id_and_discussion_id` (`label_id`,`discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `attribution_invitations`;
CREATE TABLE `attribution_invitations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_id` bigint unsigned NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `state` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `bypass_email` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_attribution_invitations_on_source_id` (`source_id`),
  KEY `index_attribution_invitations_on_creator_id` (`creator_id`),
  KEY `index_attribution_invitations_on_owner_id` (`owner_id`),
  KEY `index_attribution_invitations_on_target_id_and_owner_id` (`target_id`,`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `audit_log_async_queries`;
CREATE TABLE `audit_log_async_queries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint unsigned NOT NULL,
  `actor_type` enum('User') COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'User',
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `query_id` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `operation_id` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_audit_log_async_queries_on_query_id` (`query_id`),
  UNIQUE KEY `index_audit_log_async_queries_on_operation_id` (`operation_id`),
  KEY `index_al_async_queries_on_actor_id_and_completed_and_created_at` (`actor_id`,`completed`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_log_azure_blob_sink_configurations`;
CREATE TABLE `audit_log_azure_blob_sink_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `container` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `key_id` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `encrypted_sas_url` text COLLATE utf8mb4_unicode_520_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_log_azure_hubs_sink_configurations`;
CREATE TABLE `audit_log_azure_hubs_sink_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `key_id` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `encrypted_connstring` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_log_datadog_sink_configurations`;
CREATE TABLE `audit_log_datadog_sink_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `encrypted_token` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `site` enum('US','US3','US5','EU1','US1-FED','AP1') COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'US',
  `key_id` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_log_git_event_exports`;
CREATE TABLE `audit_log_git_event_exports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint unsigned NOT NULL,
  `subject_id` bigint unsigned NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `total_chunks` int unsigned DEFAULT '0' COMMENT 'Total number of chunks in git export',
  `expired` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Has the export expired',
  `truncated` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Has the export been truncated',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_audit_log_git_event_exports_on_token` (`token`),
  KEY `index_audit_log_git_event_exports_on_actor_id_and_token` (`actor_id`,`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `audit_log_google_cloud_sink_configurations`;
CREATE TABLE `audit_log_google_cloud_sink_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `bucket` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `key_id` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `encrypted_json_credentials` varchar(4096) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_log_hec_sink_configurations`;
CREATE TABLE `audit_log_hec_sink_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `domain` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `port` int DEFAULT NULL,
  `key_id` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `encrypted_token` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `ssl_verify` tinyint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_log_s3_sink_configurations`;
CREATE TABLE `audit_log_s3_sink_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `bucket` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `key_id` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `encrypted_access_key_id` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `encrypted_secret_key` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `authentication_type` enum('access_keys','oidc_auditlog','oidc_github') COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'access_keys',
  `arn_role` varchar(2048) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `region` varchar(36) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_log_settings`;
CREATE TABLE `audit_log_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `business_id` bigint NOT NULL,
  `name` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_audit_log_settings_on_business_id` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_log_splunk_sink_configurations`;
CREATE TABLE `audit_log_splunk_sink_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `domain` varchar(1024) DEFAULT NULL,
  `port` int DEFAULT '8088',
  `key_id` varchar(1024) DEFAULT NULL,
  `encrypted_token` varchar(1024) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `ssl_verify` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `audit_log_stream_configurations`;
CREATE TABLE `audit_log_stream_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `business_id` bigint DEFAULT NULL,
  `sink_id` bigint unsigned NOT NULL,
  `sink_type` varchar(255) DEFAULT NULL,
  `status` varchar(1024) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `paused_at` datetime(6) DEFAULT NULL,
  `gh_staff_disabled` tinyint(1) NOT NULL DEFAULT '0',
  `idx` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_audit_log_stream_configurations_on_business_id` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `audit_log_web_exports`;
CREATE TABLE `audit_log_web_exports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint unsigned NOT NULL,
  `subject_id` bigint unsigned NOT NULL,
  `subject_type` enum('User','Organization','Business') COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'User',
  `format_type` enum('json','csv') COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'json',
  `export_id` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `phrase` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `total_chunks` int unsigned DEFAULT '0' COMMENT 'Total number of chunks in export',
  `expired` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Has the export expired',
  `truncated` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Has the export been truncated',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_audit_log_web_exports_on_export_id` (`export_id`),
  KEY `index_audit_log_web_exports_on_subject_id_and_subject_type` (`subject_id`,`subject_type`),
  KEY `index_audit_log_web_exports_on_actor_id` (`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `badges`;
CREATE TABLE `badges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `contributor` tinyint(1) NOT NULL DEFAULT '0',
  `collaborator` tinyint(1) NOT NULL DEFAULT '0',
  `first_time_contributor` tinyint(1) NOT NULL DEFAULT '0',
  `first_timer` tinyint(1) NOT NULL DEFAULT '0',
  `maintainer` tinyint(1) NOT NULL DEFAULT '0',
  `member` tinyint(1) NOT NULL DEFAULT '0',
  `owner` tinyint(1) NOT NULL DEFAULT '0',
  `spammy` tinyint(1) NOT NULL DEFAULT '0',
  `sponsor` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_badges_on_user_id_and_repository_id` (`user_id`,`repository_id`),
  KEY `index_badges_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `branch_issue_references`;
CREATE TABLE `branch_issue_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `branch_name` varbinary(1024) NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `issue_repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `branch_repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_branch_issue_ref_branch_name_issue_id_repo_id` (`branch_name`,`issue_id`,`branch_repository_id`),
  KEY `idx_branch_issue_ref_issue_id_repo_id` (`issue_id`,`issue_repository_id`),
  KEY `idx_branch_issue_ref_branch_name_repo_id` (`branch_name`,`issue_repository_id`),
  KEY `index_branch_issue_references_on_branch_repository_id` (`branch_repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `bulk_dmca_takedown_repositories`;
CREATE TABLE `bulk_dmca_takedown_repositories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int DEFAULT NULL,
  `bulk_dmca_takedown_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bulk_dmca_takedown_repositories_on_repository_id` (`repository_id`),
  KEY `bulk_dmca_takedown_repositories_on_bulk_id` (`bulk_dmca_takedown_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `bulk_dmca_takedowns`;
CREATE TABLE `bulk_dmca_takedowns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `disabling_user_id` int NOT NULL,
  `notice_public_url` text NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `bulk_sponsorship_imports`;
CREATE TABLE `bulk_sponsorship_imports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsor_id` bigint unsigned NOT NULL,
  `data` json NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_bulk_sponsorship_imports_on_sponsor_id` (`sponsor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `bulk_sponsorship_tier_selections`;
CREATE TABLE `bulk_sponsorship_tier_selections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsor_id` bigint unsigned NOT NULL,
  `sponsors_tier_ids` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_bulk_sponsorship_tier_selections_on_sponsor_id` (`sponsor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `business_user_accounts`;
CREATE TABLE `business_user_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `business_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `login` varchar(255) NOT NULL DEFAULT '',
  `business_roles_bitfield` int unsigned DEFAULT NULL,
  `ghec_license` tinyint unsigned DEFAULT NULL,
  `two_factor_status` tinyint unsigned DEFAULT NULL,
  `profile_name` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `verified_emails` text,
  `cost_center` varchar(36) DEFAULT NULL,
  `spammy` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_business_user_accounts_on_business_id_and_user_id` (`business_id`,`user_id`),
  KEY `index_business_user_accounts_on_business_id_user_id_login` (`business_id`,`user_id`,`login`),
  KEY `index_business_user_accounts_on_user_id` (`user_id`),
  KEY `index_business_user_accounts_on_business_id_ghec_license` (`business_id`,`ghec_license`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `close_issue_references`;
CREATE TABLE `close_issue_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned NOT NULL,
  `issue_id` bigint unsigned NOT NULL,
  `pull_request_author_id` bigint unsigned NOT NULL,
  `issue_repository_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `source` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_close_issue_references_on_pull_request_id_and_issue_id` (`pull_request_id`,`issue_id`),
  KEY `idx_close_issue_refs_pr_author_issue_id` (`pull_request_author_id`,`issue_id`),
  KEY `index_close_issue_references_on_issue_id_and_issue_repository_id` (`issue_id`,`issue_repository_id`),
  KEY `index_close_issue_references_on_issue_repository_id` (`issue_repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `codespace_allowed_permissions`;
CREATE TABLE `codespace_allowed_permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target_id` bigint unsigned NOT NULL,
  `target_type` enum('Repository','User') COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `resource` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `action` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `is_prebuild` tinyint(1) NOT NULL DEFAULT '0',
  `codespace_prebuild_configuration_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_codespace_prms_on_repo_user_prbld_trgt_prms` (`repository_id`,`user_id`,`is_prebuild`,`codespace_prebuild_configuration_id`,`target_id`,`target_type`,`resource`,`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespace_async_operations`;
CREATE TABLE `codespace_async_operations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `operation` int NOT NULL,
  `op_started_at` datetime(6) DEFAULT NULL,
  `op_ended_at` datetime(6) DEFAULT NULL,
  `codespace_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_codespace_async_operations_on_codespace_id` (`codespace_id`),
  KEY `codespace_async_ops_started_at_and_ended_at` (`operation`,`op_started_at`,`op_ended_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespace_billing_entries`;
CREATE TABLE `codespace_billing_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `billable_owner_type` varchar(30) NOT NULL,
  `billable_owner_id` bigint NOT NULL,
  `codespace_owner_type` varchar(30) NOT NULL,
  `codespace_owner_id` bigint NOT NULL,
  `codespace_guid` char(36) NOT NULL,
  `codespace_plan_name` varchar(90) NOT NULL,
  `codespace_created_at` timestamp NULL DEFAULT NULL,
  `codespace_deleted_at` timestamp NULL DEFAULT NULL,
  `codespace_deprovisioned_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint DEFAULT NULL,
  `copilot_workspace_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_codespace_billing_on_billable_owner` (`billable_owner_type`,`billable_owner_id`),
  KEY `idx_codespace_billing_on_codespace_owner` (`codespace_owner_type`,`codespace_owner_id`),
  KEY `idx_codespaces_billing_on_guid` (`codespace_guid`),
  KEY `index_codespace_billing_entries_on_copilot_workspace_id` (`copilot_workspace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `codespace_prebuild_configuration_locations`;
CREATE TABLE `codespace_prebuild_configuration_locations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codespace_prebuild_configuration_id` bigint unsigned DEFAULT NULL,
  `location` tinyint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `geo` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_codespace_prebuild_configuration_id_and_location` (`codespace_prebuild_configuration_id`,`location`),
  KEY `index_on_codespace_prebuild_configuration_id_and_geo` (`codespace_prebuild_configuration_id`,`geo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespace_prebuild_configurations`;
CREATE TABLE `codespace_prebuild_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `branch` varbinary(1024) NOT NULL,
  `vscs_target` varchar(21) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `vscs_target_url` text COLLATE utf8mb4_unicode_520_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `latest_workflow_run_id` bigint unsigned DEFAULT NULL,
  `devcontainer_path` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `trigger` tinyint NOT NULL DEFAULT '1',
  `state` tinyint NOT NULL DEFAULT '0',
  `maximum_template_versions` int NOT NULL DEFAULT '2',
  `permission_granted` tinyint(1) NOT NULL DEFAULT '1',
  `fast_path_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `runner_group` varchar(128) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `runner_label` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_codespace_prebuild_config_on_workflow_run_id` (`latest_workflow_run_id`),
  UNIQUE KEY `codespace_prebuild_config_repo_branch_target_devcontainer` (`repository_id`,`branch`,`vscs_target`,`devcontainer_path`),
  KEY `index_codespace_prebuild_config_on_state_and_repo` (`state`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespace_prebuild_notification_users`;
CREATE TABLE `codespace_prebuild_notification_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codespace_prebuild_configuration_id` bigint unsigned NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `owner_type` enum('User','Team') COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_prebuild_notification_users_on_prebuild_config_id` (`codespace_prebuild_configuration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespace_prebuild_template_billing_entries`;
CREATE TABLE `codespace_prebuild_template_billing_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `prebuild_template_id` bigint unsigned NOT NULL,
  `prebuild_plan_name` varchar(90) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `billable_owner_id` bigint unsigned NOT NULL,
  `billable_owner_type` enum('Organization','User') COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `prebuild_template_guid` varchar(36) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `prebuild_created_at` datetime(6) NOT NULL,
  `prebuild_deleted_at` datetime(6) DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_prebuild_billing_entry_on_template_id` (`prebuild_template_id`),
  KEY `index_prebuild_billing_entry_on_guid` (`prebuild_template_guid`),
  KEY `index_prebuild_billing_entry_on_billable_owner` (`billable_owner_id`,`billable_owner_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespace_prebuild_template_creation_schedules`;
CREATE TABLE `codespace_prebuild_template_creation_schedules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codespace_prebuild_configuration_id` bigint unsigned NOT NULL,
  `time_zone_name` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `delivery_time` int NOT NULL,
  `delivery_day` int NOT NULL,
  `next_delivery_at` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_prebuild_template_schedules_on_prebuild_configuration_id` (`codespace_prebuild_configuration_id`),
  KEY `index_prebuild_template_creation_schedules_on_next_delivery_at` (`next_delivery_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespace_prebuild_templates`;
CREATE TABLE `codespace_prebuild_templates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `oid` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `branch` varbinary(1024) NOT NULL,
  `prebuild_hash` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `sku_name` int NOT NULL DEFAULT '0',
  `guid` varchar(36) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `state` int NOT NULL DEFAULT '0',
  `location` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `vscs_target` varchar(21) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `vscs_target_url` text COLLATE utf8mb4_unicode_520_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `provisioning_job_status_id` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `codespace_prebuild_configuration_id` bigint unsigned DEFAULT NULL,
  `devcontainer_path` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `plan_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_codespace_prebuild_templates_on_name` (`name`),
  UNIQUE KEY `index_codespace_prebuild_templates_on_guid` (`guid`),
  UNIQUE KEY `index_codespace_prebuild_templates_on_provisioning_job_status_id` (`provisioning_job_status_id`),
  KEY `index_codespace_prebuild_templates_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespace_unprocessed_billing_messages`;
CREATE TABLE `codespace_unprocessed_billing_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` char(36) NOT NULL,
  `azure_storage_account_name` varchar(24) NOT NULL,
  `body` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `vscs_target` varchar(21) NOT NULL DEFAULT 'production',
  PRIMARY KEY (`id`),
  KEY `index_codespace_unprocessed_billing_messages_on_message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `codespace_usage_records`;
CREATE TABLE `codespace_usage_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `owner_id` bigint NOT NULL,
  `billable_owner_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `billable_owner_id` bigint NOT NULL,
  `codespace_guid` char(36) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `copilot_workspace_id` char(36) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `start_at` datetime(6) NOT NULL,
  `end_at` datetime(6) NOT NULL,
  `usage_seconds` int unsigned DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_codespace_usage_records_on_owner` (`owner_type`,`owner_id`),
  KEY `index_codespace_usage_records_on_billable_owner` (`billable_owner_type`,`billable_owner_id`),
  KEY `index_codespace_usage_records_on_codespace_guid` (`codespace_guid`),
  KEY `index_codespace_usage_records_on_copilot_workspace_id` (`copilot_workspace_id`),
  KEY `index_codespace_usage_records_on_start_at` (`start_at`),
  KEY `index_codespace_usage_records_on_end_at` (`end_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespaces_key_values`;
CREATE TABLE `codespaces_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_codespaces_key_values_on_key` (`key`),
  KEY `index_codespaces_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `codespaces_repository_authorizations`;
CREATE TABLE `codespaces_repository_authorizations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `access_type` enum('read','write') COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_codespaces_authorizations_on_user_and_repository` (`user_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `commit_contribution_summaries`;
CREATE TABLE `commit_contribution_summaries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `year` smallint unsigned NOT NULL,
  `total_count` bigint unsigned NOT NULL,
  `counts` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_user_id_repository_id_year_8377997181` (`user_id`,`repository_id`,`year`),
  KEY `index_commit_contribution_summaries_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `commit_contributions`;
CREATE TABLE `commit_contributions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `repository_id` int unsigned DEFAULT NULL,
  `commit_count` int unsigned DEFAULT '0',
  `committed_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `commit_contrib_user_repo_date` (`user_id`,`repository_id`,`committed_date`),
  KEY `index_commit_contributions_on_user_id_and_committed_date` (`user_id`,`committed_date`),
  KEY `index_commit_contributions_on_repository_id_and_committed_date` (`repository_id`,`committed_date`),
  KEY `index_commit_contributions_on_user_committed_date_and_repo` (`user_id`,`committed_date`,`repository_id`),
  KEY `index_commit_contributions_on_repo_user_committed_date_and_count` (`repository_id`,`user_id`,`committed_date`,`commit_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `community_insights_daily_counts`;
CREATE TABLE `community_insights_daily_counts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `entry_date` date NOT NULL,
  `discussions_count` int unsigned NOT NULL DEFAULT '0',
  `issues_count` int unsigned NOT NULL DEFAULT '0',
  `pull_requests_count` int unsigned NOT NULL DEFAULT '0',
  `discussion_contributors_count` int unsigned NOT NULL DEFAULT '0',
  `discussion_new_contributor_count` int unsigned NOT NULL DEFAULT '0',
  `discussion_logged_in_page_view_count` int unsigned NOT NULL DEFAULT '0',
  `discussion_anonymous_page_view_count` int unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_repository_id_and_entry_date` (`repository_id`,`entry_date`),
  KEY `index_community_insights_daily_counts_on_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `compliance_reports`;
CREATE TABLE `compliance_reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `report_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `availability` tinyint NOT NULL DEFAULT '0',
  `coverage_period` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `url` text COLLATE utf8mb4_unicode_520_ci,
  `display_order` int DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_compliance_reports_on_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `compromised_password_datasources`;
CREATE TABLE `compromised_password_datasources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `version` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `import_finished_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_compromised_password_datasources_on_name_and_version` (`name`,`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `compromised_passwords`;
CREATE TABLE `compromised_passwords` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sha1_password` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_compromised_passwords_on_sha1_password` (`sha1_password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `deceased_users`;
CREATE TABLE `deceased_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_deceased_users_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `deleted_discussions`;
CREATE TABLE `deleted_discussions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `deleted_by_id` int NOT NULL,
  `old_discussion_id` int NOT NULL,
  `number` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_deleted_discussions_on_repository_id_and_number` (`repository_id`,`number`),
  KEY `index_deleted_discussions_on_old_discussion_id_and_repository_id` (`old_discussion_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `deleted_issues`;
CREATE TABLE `deleted_issues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `deleted_by_id` bigint unsigned NOT NULL,
  `number` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `old_issue_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_deleted_issues_on_repository_id_and_number` (`repository_id`,`number`),
  KEY `index_deleted_issues_on_old_issue_id_and_repository_id` (`old_issue_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `device_authorization_grants`;
CREATE TABLE `device_authorization_grants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `access_denied` tinyint(1) NOT NULL DEFAULT '0',
  `application_id` bigint NOT NULL,
  `application_type` varchar(16) NOT NULL,
  `hashed_device_code` varbinary(44) DEFAULT NULL,
  `device_code_last_eight` varchar(8) DEFAULT NULL,
  `scopes` text,
  `user_code` varchar(9) COLLATE utf8mb3_general_ci DEFAULT NULL,
  `oauth_access_id` bigint DEFAULT NULL,
  `expires_at` bigint NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ip` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_device_authorization_grants_on_user_code` (`user_code`),
  UNIQUE KEY `index_device_authorization_grants_on_hashed_device_code` (`hashed_device_code`),
  UNIQUE KEY `index_device_authorization_grants_on_oauth_access_id` (`oauth_access_id`),
  KEY `index_device_authorization_grants_on_expires_at` (`expires_at`),
  KEY `index_device_authorization_grants_on_application` (`application_id`,`application_type`),
  KEY `index_device_grants_on_oauth_access_id_and_expires_at` (`oauth_access_id`,`expires_at`),
  KEY `index_device_authorization_grants_on_access_denied` (`access_denied`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_categories`;
CREATE TABLE `discussion_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `emoji` varchar(44) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT ':hash:',
  `name` varchar(512) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` mediumblob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `supports_mark_as_answer` tinyint(1) NOT NULL DEFAULT '1',
  `supports_announcements` tinyint(1) NOT NULL DEFAULT '0',
  `supports_polls` tinyint(1) NOT NULL DEFAULT '0',
  `discussion_section_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_categories_on_repository_id_and_name` (`repository_id`,`name`),
  UNIQUE KEY `index_discussion_categories_on_repository_id_and_slug` (`repository_id`,`slug`),
  KEY `index_discussion_categories_on_discussion_section_id` (`discussion_section_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `discussion_category_pins`;
CREATE TABLE `discussion_category_pins` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL COMMENT 'the repository which the discussion belongs to',
  `discussion_id` bigint unsigned NOT NULL COMMENT 'the discussion which is pinned',
  `pinned_by_id` bigint unsigned NOT NULL COMMENT 'the user which pinned the discussion',
  `category_id` bigint unsigned NOT NULL COMMENT 'the category which the discussion is pinned in',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_unique_discussion_category_pin` (`repository_id`,`category_id`,`discussion_id`),
  KEY `index_discussion_category_pins_on_created_at` (`created_at`),
  KEY `index_discussion_category_pins_on_discussion_id` (`discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `discussion_comment_edits`;
CREATE TABLE `discussion_comment_edits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_comment_id` int NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int DEFAULT NULL,
  `diff` mediumblob,
  PRIMARY KEY (`id`),
  KEY `index_discussion_comment_edits_on_discussion_comment_id` (`discussion_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_comment_reactions`;
CREATE TABLE `discussion_comment_reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_comment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `content` varchar(30) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reactions_comment_identity` (`user_id`,`discussion_comment_id`,`content`),
  KEY `index_discussion_comment_reactions_on_discussion_comment_id` (`discussion_comment_id`),
  KEY `reactions_on_discussion_comment_content_created` (`discussion_comment_id`,`content`,`created_at`),
  KEY `reactions_on_discussion_comment_hidden_created` (`discussion_comment_id`,`user_hidden`,`created_at`),
  KEY `comment_reactions_on_user_hidden_and_user_id` (`user_id`,`user_hidden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_comment_votes`;
CREATE TABLE `discussion_comment_votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_id` int NOT NULL,
  `comment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `upvote` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_comment_votes_on_user_discussion_comment` (`user_id`,`discussion_id`,`comment_id`),
  KEY `index_discussion_comment_votes_on_comment_upvote_user` (`comment_id`,`upvote`,`user_id`),
  KEY `index_discussion_comment_votes_on_discussion_upvote_created` (`discussion_id`,`comment_id`,`upvote`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_comments`;
CREATE TABLE `discussion_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `discussion_id` bigint unsigned NOT NULL,
  `parent_comment_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `body` mediumblob NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `comment_hidden_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) GENERATED ALWAYS AS ((`deleted_at` is not null)) VIRTUAL NOT NULL,
  `last_edited_at` datetime DEFAULT NULL,
  `total_upvotes` int NOT NULL DEFAULT '0',
  `total_downvotes` int NOT NULL DEFAULT '0',
  `nested_comments_count` int NOT NULL DEFAULT '0',
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `detected_language` varchar(42) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_discussion_comments_on_user_id_and_user_hidden` (`user_id`,`user_hidden`),
  KEY `index_discussion_comments_on_repository_id_and_created_at` (`repository_id`,`created_at`),
  KEY `index_discussion_comments_on_parent_comment_id_and_discussion_id` (`parent_comment_id`,`discussion_id`),
  KEY `idx_discussion_comments_on_user_discussion_user_hidden_deleted` (`user_id`,`discussion_id`,`user_hidden`,`deleted_at`),
  KEY `index_discussion_comments_disc_id_user_id_user_hidden_created_at` (`discussion_id`,`user_id`,`user_hidden`,`created_at`),
  KEY `discussion_id_parent_comment_id_created_at_user_hidden_user_id` (`discussion_id`,`parent_comment_id`,`created_at`,`user_hidden`,`user_id`),
  KEY `index_discussion_comments_on_detected_language` (`detected_language`),
  KEY `idx_on_discussion_id_user_hidden_comment_hidden_del_0f8cf9757f` (`discussion_id`,`user_hidden`,`comment_hidden`,`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_edits`;
CREATE TABLE `discussion_edits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_id` int NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int DEFAULT NULL,
  `diff` mediumblob,
  PRIMARY KEY (`id`),
  KEY `index_discussion_edits_on_discussion_id` (`discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_events`;
CREATE TABLE `discussion_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `discussion_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `comment_id` bigint unsigned DEFAULT NULL,
  `event_type` int NOT NULL,
  `created_at` datetime NOT NULL,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `issue_repository_id` bigint unsigned DEFAULT NULL,
  `issue_id` bigint unsigned DEFAULT NULL,
  `state_reason` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_events_on_issue_id` (`issue_id`),
  KEY `idx_discussion_events_on_repo_discussion_type_created_at` (`repository_id`,`discussion_id`,`event_type`,`created_at`),
  KEY `index_discussion_events_on_actor_id` (`actor_id`),
  KEY `index_on_discussion_id_event_type_comment_id_created_at` (`discussion_id`,`event_type`,`comment_id`,`created_at`),
  KEY `idx_discussion_events_on_comment_and_type_and_created` (`comment_id`,`event_type`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_poll_options`;
CREATE TABLE `discussion_poll_options` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `discussion_poll_id` bigint unsigned NOT NULL,
  `option` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `discussion_poll_votes_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_discussion_poll_options_on_discussion_poll_id` (`discussion_poll_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `discussion_poll_votes`;
CREATE TABLE `discussion_poll_votes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `discussion_poll_id` bigint unsigned NOT NULL,
  `discussion_poll_option_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_poll_votes_on_discussion_poll_id_and_user_id` (`discussion_poll_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `discussion_polls`;
CREATE TABLE `discussion_polls` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `discussion_id` bigint unsigned NOT NULL,
  `question` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `discussion_poll_votes_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_discussion_polls_on_discussion_id` (`discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `discussion_reactions`;
CREATE TABLE `discussion_reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `discussion_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `content` varchar(30) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reactions_identity` (`user_id`,`discussion_id`,`content`),
  KEY `index_discussion_reactions_on_discussion_id` (`discussion_id`),
  KEY `index_reactions_on_discussion_content_created_at` (`discussion_id`,`content`,`created_at`),
  KEY `reactions_on_discussion_user_hidden_created_at` (`discussion_id`,`user_hidden`,`created_at`),
  KEY `index_reactions_on_user_hidden_and_user_id` (`user_id`,`user_hidden`),
  KEY `index_discussion_reactions_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_sections`;
CREATE TABLE `discussion_sections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `emoji` varchar(44) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT ':hash:',
  `name` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `slug` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_discussion_sections_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `discussion_spotlights`;
CREATE TABLE `discussion_spotlights` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `discussion_id` bigint unsigned NOT NULL,
  `spotlighted_by_id` bigint unsigned NOT NULL,
  `position` tinyint NOT NULL DEFAULT '1',
  `preconfigured_color` tinyint DEFAULT NULL,
  `custom_color` varchar(10) DEFAULT NULL,
  `pattern` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_spotlights_on_repository_id_and_position` (`repository_id`,`position`),
  UNIQUE KEY `index_discussion_spotlights_on_discussion_id_and_repository_id` (`discussion_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_transfers`;
CREATE TABLE `discussion_transfers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `old_repository_id` int NOT NULL,
  `old_discussion_id` int NOT NULL,
  `old_discussion_number` int NOT NULL,
  `new_repository_id` int NOT NULL,
  `new_discussion_id` int NOT NULL,
  `new_discussion_event_id` int DEFAULT NULL,
  `actor_id` int NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `reason` varbinary(1024) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_discussion_transfers_on_old_discussion_id` (`old_discussion_id`),
  KEY `index_discussion_transfers_on_new_discussion_id` (`new_discussion_id`),
  KEY `index_discussion_transfers_on_old_repo_and_old_discussion_number` (`old_repository_id`,`old_discussion_number`),
  KEY `index_discussion_transfers_on_new_discussion_event_id` (`new_discussion_event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_votes`;
CREATE TABLE `discussion_votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discussion_id` int NOT NULL,
  `user_id` int NOT NULL,
  `upvote` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_votes_on_user_id_and_discussion_id` (`user_id`,`discussion_id`),
  KEY `index_discussion_votes_on_discussion_upvote_created` (`discussion_id`,`upvote`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussions`;
CREATE TABLE `discussions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varbinary(1024) NOT NULL,
  `body` mediumblob,
  `repository_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `chosen_comment_id` bigint unsigned DEFAULT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_count` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `number` int NOT NULL,
  `issue_id` bigint unsigned DEFAULT NULL,
  `converted_at` datetime DEFAULT NULL,
  `error_reason` int NOT NULL DEFAULT '0',
  `state` int NOT NULL DEFAULT '0',
  `discussion_type` int NOT NULL DEFAULT '0',
  `discussion_category_id` bigint unsigned NOT NULL,
  `bumped_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_edited_at` datetime DEFAULT NULL,
  `total_upvotes` int NOT NULL DEFAULT '0',
  `total_downvotes` int NOT NULL DEFAULT '0',
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `release_id` bigint unsigned DEFAULT NULL,
  `direct_comment_count` int NOT NULL DEFAULT '0',
  `detected_language` varchar(42) DEFAULT NULL,
  `team_post_id` bigint unsigned DEFAULT NULL,
  `allow_reactions` tinyint(1) NOT NULL DEFAULT '1',
  `state_reason` tinyint DEFAULT NULL,
  `locked_at` datetime(6) DEFAULT NULL,
  `closed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussions_on_number_and_repository_id` (`number`,`repository_id`),
  KEY `index_discussions_on_created_at_and_repository_id` (`created_at`,`repository_id`),
  KEY `index_discussions_on_repository_id_and_user_id_and_user_hidden` (`repository_id`,`user_id`,`user_hidden`),
  KEY `index_discussions_on_user_id_and_user_hidden` (`user_id`,`user_hidden`),
  KEY `index_discussions_on_issue_id_and_repository_id` (`issue_id`,`repository_id`),
  KEY `index_discussions_on_repo_score_chosen_comment` (`repository_id`,`chosen_comment_id`),
  KEY `index_discussions_on_repository_id_and_state` (`repository_id`,`state`),
  KEY `idx_discussions_type_repo_chosen_comment_score` (`discussion_type`,`repository_id`,`chosen_comment_id`),
  KEY `index_discussions_on_repository_id_and_updated_at` (`repository_id`,`updated_at`),
  KEY `index_discussions_on_repository_id_and_bumped_at` (`repository_id`,`bumped_at`),
  KEY `index_discussions_on_repository_id_and_user_hidden` (`repository_id`,`user_hidden`),
  KEY `index_discussions_on_release_id` (`release_id`),
  KEY `index_discussions_on_repository_id_and_discussion_category_id` (`repository_id`,`discussion_category_id`),
  KEY `index_discussions_on_detected_language` (`detected_language`),
  KEY `index_discussions_on_team_post_id` (`team_post_id`),
  KEY `index_repo_upvotes_created_at` (`repository_id`,`created_at`,`total_upvotes`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussions_key_values`;
CREATE TABLE `discussions_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussions_key_values_on_key` (`key`),
  KEY `index_discussions_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `email_domain_reputation_records`;
CREATE TABLE `email_domain_reputation_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email_domain` varchar(255) NOT NULL,
  `mx_exchange` varchar(255) DEFAULT NULL,
  `a_record` varchar(255) DEFAULT NULL,
  `sample_size` int NOT NULL DEFAULT '0',
  `not_spammy_sample_size` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_email_domain_reputation_records_on_a_record` (`a_record`,`mx_exchange`,`email_domain`),
  KEY `index_email_domain_reputation_records_on_email_domain` (`email_domain`),
  KEY `index_email_domain_reputation_records_on_mx_exchange` (`mx_exchange`),
  KEY `index_email_domain_reputation_records_on_a_record_sample_size` (`a_record`,`sample_size`,`email_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `enterprise_banner_dismissals`;
CREATE TABLE `enterprise_banner_dismissals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enterprise_banner_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_dismissals_on_enterprise_banner_id_and_user_id` (`enterprise_banner_id`,`user_id`),
  KEY `index_enterprise_banner_dismissals_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `enterprise_banners`;
CREATE TABLE `enterprise_banners` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `owner_type` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `message` varchar(512) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `dismissible` tinyint(1) NOT NULL DEFAULT '0',
  `expires_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_enterprise_banners_on_owner_id_and_owner_type` (`owner_id`,`owner_type`),
  KEY `index_enterprise_banners_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `enterprise_contributions`;
CREATE TABLE `enterprise_contributions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `enterprise_installation_id` bigint unsigned DEFAULT NULL,
  `count` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `contributed_on` date NOT NULL,
  `business_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_enterprise_contributions_on_user_installation_contributed` (`user_id`,`enterprise_installation_id`,`contributed_on`),
  KEY `index_enterprise_contributions_on_user_id_and_contributed_on` (`user_id`,`contributed_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `enterprise_installation_user_account_emails`;
CREATE TABLE `enterprise_installation_user_account_emails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enterprise_installation_user_account_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `email` varchar(255) NOT NULL,
  `primary` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_enterprise_inst_user_account_emails_account_id_and_email` (`enterprise_installation_user_account_id`,`email`),
  KEY `idx_ent_install_ua_emails_on_ent_install_ua_id_primary_email` (`enterprise_installation_user_account_id`,`primary`,`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `enterprise_installation_user_accounts`;
CREATE TABLE `enterprise_installation_user_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enterprise_installation_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `remote_user_id` bigint unsigned NOT NULL,
  `remote_created_at` datetime NOT NULL,
  `login` varchar(255) NOT NULL,
  `profile_name` varchar(255) DEFAULT NULL,
  `site_admin` tinyint(1) NOT NULL DEFAULT '0',
  `suspended_at` datetime DEFAULT NULL,
  `business_user_account_id` bigint unsigned DEFAULT NULL,
  `using_advanced_security` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_enterprise_inst_user_accounts_inst_id_and_remote_user_id` (`enterprise_installation_id`,`remote_user_id`),
  KEY `index_enterprise_installation_user_accounts_on_installation_id` (`enterprise_installation_id`),
  KEY `idx_ent_installation_user_accounts_on_business_user_account_id` (`business_user_account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `enterprise_installation_user_accounts_uploads`;
CREATE TABLE `enterprise_installation_user_accounts_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `business_id` int NOT NULL,
  `enterprise_installation_id` int DEFAULT NULL,
  `uploader_id` int DEFAULT NULL,
  `content_type` varchar(40) NOT NULL,
  `size` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `guid` varchar(36) DEFAULT NULL,
  `state` int NOT NULL DEFAULT '0',
  `storage_blob_id` int DEFAULT NULL,
  `oid` varchar(64) DEFAULT NULL,
  `storage_provider` varchar(30) DEFAULT NULL,
  `sync_state` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_enterprise_inst_user_accounts_uploads_on_business_id` (`business_id`,`guid`),
  KEY `index_enterprise_inst_user_accounts_uploads_on_installation_id` (`enterprise_installation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `enterprise_oidc_issuer_url_customisations`;
CREATE TABLE `enterprise_oidc_issuer_url_customisations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enterprise_id` bigint unsigned NOT NULL,
  `include_enterprise_name` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_enterprise_oidc_issuer_url_customisations_on_enterprise_id` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `external_identity_attribute_mappings`;
CREATE TABLE `external_identity_attribute_mappings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_type` varchar(255) DEFAULT NULL,
  `provider_id` int DEFAULT NULL,
  `scheme` int NOT NULL,
  `target` int NOT NULL,
  `source` text NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index_on_id_attr_mapping_by_provider` (`provider_id`,`provider_type`,`scheme`,`target`),
  KEY `index_on_id_attr_mapping_by_provider` (`provider_id`,`provider_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `feature_enrollments`;
CREATE TABLE `feature_enrollments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `feature_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `enrolled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `enrollee_type` varchar(40) NOT NULL,
  `enrollee_id` bigint unsigned NOT NULL,
  `last_actor_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_enrollee_id_and_enrollee_type_and_feature_id` (`enrollee_id`,`enrollee_type`,`feature_id`),
  KEY `index_feature_enrollments_on_feature_id` (`feature_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `feature_management_key_values`;
CREATE TABLE `feature_management_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_feature_management_key_values_on_key` (`key`),
  KEY `index_feature_management_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `features`;
CREATE TABLE `features` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `public_name` varchar(40) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `description` mediumblob,
  `feedback_link` text,
  `enrolled_by_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `flipper_feature_id` bigint unsigned DEFAULT NULL,
  `legal_agreement_required` tinyint(1) NOT NULL DEFAULT '0',
  `image_link` text,
  `documentation_link` text,
  `published_at` datetime DEFAULT NULL,
  `flipper_feature_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_features_on_public_name` (`public_name`),
  UNIQUE KEY `index_features_on_slug` (`slug`),
  UNIQUE KEY `index_features_on_flipper_feature_id` (`flipper_feature_id`),
  KEY `index_features_on_legal_agreement_required` (`legal_agreement_required`),
  KEY `idx_on_published_at_flipper_feature_id_legal_agreement_required` (`published_at`,`flipper_feature_id`,`legal_agreement_required`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `fraud_flagged_sponsors`;
CREATE TABLE `fraud_flagged_sponsors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sponsors_fraud_review_id` int NOT NULL,
  `sponsor_id` int NOT NULL,
  `matched_current_client_id` varchar(255) DEFAULT NULL,
  `matched_current_ip` varchar(40) DEFAULT NULL,
  `matched_historical_ip` varchar(40) DEFAULT NULL,
  `matched_historical_client_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `matched_current_ip_region_and_user_agent` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_review_and_sponsor` (`sponsors_fraud_review_id`,`sponsor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `ghes_licenses`;
CREATE TABLE `ghes_licenses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `business_id` bigint unsigned NOT NULL,
  `reference_number` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `license_type` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `state` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `metered` tinyint(1) NOT NULL DEFAULT '0',
  `seats` int DEFAULT NULL,
  `advanced_security_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `advanced_security_seats` int NOT NULL DEFAULT '0',
  `expires_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `support_cluster` tinyint(1) NOT NULL DEFAULT '0',
  `support_key` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_ghes_licenses_on_reference_number` (`reference_number`),
  KEY `index_ghes_licenses_on_business_id` (`business_id`),
  KEY `index_ghes_licenses_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `git_signing_ssh_public_keys`;
CREATE TABLE `git_signing_ssh_public_keys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `key` blob NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `fingerprint_sha256` varbinary(96) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_git_signing_ssh_public_keys_on_fingerprint_sha256` (`fingerprint_sha256`),
  KEY `index_git_signing_ssh_public_keys_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `global_notices`;
CREATE TABLE `global_notices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `name` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `last_checked_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_global_notices_on_user_id` (`user_id`),
  KEY `index_global_notices_on_user_id_last_checked_at_and_name` (`user_id`,`last_checked_at`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gpg_authorizations`;
CREATE TABLE `gpg_authorizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `repository_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_gpg_authorizations_on_user_and_repository` (`user_id`,`repository_id`),
  KEY `idx_gpg_authorizations_on_repository` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `growth_last_activity_key_values`;
CREATE TABLE `growth_last_activity_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_growth_last_activity_key_values_on_key` (`key`),
  KEY `index_growth_last_activity_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `growth_notice_key_values`;
CREATE TABLE `growth_notice_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_growth_notice_key_values_on_key` (`key`),
  KEY `index_growth_notice_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `imports`;
CREATE TABLE `imports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `creator_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `integration_aliases`;
CREATE TABLE `integration_aliases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `integration_id` int NOT NULL,
  `slug` varchar(34) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_integration_aliases_on_integration_id` (`integration_id`),
  UNIQUE KEY `index_integration_aliases_on_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `integration_manifests`;
CREATE TABLE `integration_manifests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(40) NOT NULL,
  `name` varchar(255) NOT NULL,
  `owner_id` int NOT NULL,
  `creator_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_integration_manifests_on_code` (`code`),
  KEY `index_integration_manifests_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `integration_single_files`;
CREATE TABLE `integration_single_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `integration_version_id` int NOT NULL,
  `path` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_integration_version_id_and_path` (`integration_version_id`,`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `interaction_limits`;
CREATE TABLE `interaction_limits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target` tinyint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `restriction` tinyint unsigned DEFAULT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_target_user_id_repository_id_403dac0b52` (`target`,`user_id`,`repository_id`),
  KEY `index_interaction_limits_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `ip_allowlist_entries`;
CREATE TABLE `ip_allowlist_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_type` varchar(20) NOT NULL,
  `owner_id` int NOT NULL,
  `allow_list_value` varchar(45) NOT NULL,
  `range_from` varbinary(16) NOT NULL,
  `range_to` varbinary(16) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_ip_allowlist_entries_on_owner_and_active_and_range_values` (`owner_type`,`owner_id`,`active`,`range_from`,`range_to`),
  KEY `index_ip_allowlist_entries_on_owner_and_allow_list_value` (`owner_type`,`owner_id`,`allow_list_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_boost_awards`;
CREATE TABLE `issue_boost_awards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_boost_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `value` tinyint unsigned NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_issue_boost_awards_on_issue_boost_id` (`issue_boost_id`),
  KEY `index_issue_boost_awards_on_user_id` (`user_id`),
  KEY `index_issue_boost_awards_on_pull_request_id` (`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_transfers`;
CREATE TABLE `issue_transfers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `old_repository_id` bigint unsigned NOT NULL,
  `old_issue_id` bigint unsigned NOT NULL,
  `old_issue_number` bigint unsigned NOT NULL,
  `new_repository_id` bigint unsigned NOT NULL,
  `new_issue_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `state` varchar(16) NOT NULL,
  `reason` varbinary(1024) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_issue_transfers_on_old_issue_id` (`old_issue_id`),
  KEY `index_issue_transfers_on_old_repository_id_and_old_issue_number` (`old_repository_id`,`old_issue_number`),
  KEY `index_issue_transfers_on_new_issue_id` (`new_issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `key_links`;
CREATE TABLE `key_links` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key_prefix` varchar(32) NOT NULL,
  `url_template` text NOT NULL,
  `owner_type` varchar(255) NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `is_alphanumeric` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_key_links_on_owner_id_and_owner_type_and_key_prefix` (`owner_id`,`owner_type`,`key_prefix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `marketplace_blog_posts`;
CREATE TABLE `marketplace_blog_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varbinary(200) NOT NULL,
  `external_post_id` int NOT NULL,
  `url` varchar(175) NOT NULL,
  `description` varbinary(700) DEFAULT NULL,
  `author` varchar(75) NOT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `published_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_marketplace_blog_posts_on_external_post_id` (`external_post_id`),
  KEY `index_marketplace_blog_posts_on_featured_and_published_at` (`featured`,`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `merge_group_entries`;
CREATE TABLE `merge_group_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `merge_queue_id` bigint unsigned NOT NULL,
  `merge_group_id` bigint unsigned NOT NULL,
  `merge_queue_entry_id` bigint unsigned NOT NULL,
  `position` int NOT NULL,
  `retries` int NOT NULL DEFAULT '0',
  `base_oid` varchar(40) DEFAULT NULL,
  `head_oid` varchar(40) DEFAULT NULL,
  `head_ref` varbinary(1024) DEFAULT NULL,
  `state` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `merge_group_queue_entry_id` (`merge_group_id`,`merge_queue_entry_id`),
  UNIQUE KEY `index_merge_group_entries_on_merge_group_id_and_position` (`merge_group_id`,`position`),
  KEY `queue_id_queue_entry_id` (`merge_queue_id`,`merge_queue_entry_id`),
  KEY `index_merge_group_entries_on_merge_queue_id_and_head_oid` (`merge_queue_id`,`head_oid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `merge_group_stats`;
CREATE TABLE `merge_group_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `merge_queue_id` int NOT NULL,
  `repository_id` int NOT NULL,
  `ref` varbinary(1024) NOT NULL,
  `base_branch` varbinary(1024) NOT NULL,
  `first_pr_queued_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `pull_requests_merged_count` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_merge_group_stats_on_merge_queue_id_and_created_at` (`merge_queue_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `merge_groups`;
CREATE TABLE `merge_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `merge_queue_id` int NOT NULL,
  `base_oid` varchar(40) DEFAULT NULL,
  `locked` tinyint(1) DEFAULT NULL,
  `state` int NOT NULL DEFAULT '0',
  `merge_group_entries_count` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `merge_head_merge_group_entry_id` int DEFAULT NULL,
  `mergeable_merge_group_entries_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_merge_groups_on_merge_queue_id_and_locked` (`merge_queue_id`,`locked`),
  KEY `queue_id_state_mergeable_entry_count_entry_count` (`merge_queue_id`,`state`,`mergeable_merge_group_entries_count`,`merge_group_entries_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `merge_queue_entries`;
CREATE TABLE `merge_queue_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned DEFAULT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `enqueuer_id` bigint unsigned NOT NULL,
  `enqueued_at` datetime NOT NULL,
  `dequeuer_id` bigint unsigned DEFAULT NULL,
  `dequeued_at` datetime DEFAULT NULL,
  `dequeue_reason` int DEFAULT NULL,
  `deploy_started_at` datetime DEFAULT NULL,
  `solo` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `merge_queue_id` bigint unsigned DEFAULT NULL,
  `jump_queue` tinyint(1) NOT NULL DEFAULT '0',
  `author_id` bigint unsigned NOT NULL,
  `base_sha` varchar(40) DEFAULT NULL,
  `head_sha` varchar(40) DEFAULT NULL,
  `head_ref` varbinary(1024) DEFAULT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `locked` tinyint(1) NOT NULL DEFAULT '0',
  `position` int DEFAULT NULL,
  `checks_requested_at` datetime(6) DEFAULT NULL,
  `enqueued_rule_suite_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_merge_queue_entries_on_merge_queue_id_and_pull_request_id` (`merge_queue_id`,`pull_request_id`),
  KEY `index_merge_queue_entries_on_sort_columns` (`merge_queue_id`,`jump_queue`,`enqueued_at`),
  KEY `index_merge_queue_entries_on_pull_request_id` (`pull_request_id`),
  KEY `index_merge_queue_entries_on_merge_queue_id_and_author_id` (`merge_queue_id`,`author_id`),
  KEY `index_merge_queue_entries_on_merge_queue_id_and_enqueuer_id` (`merge_queue_id`,`enqueuer_id`),
  KEY `index_merge_queue_entries_on_merge_queue_id_and_locked` (`merge_queue_id`,`locked`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `merge_queue_entry_stats`;
CREATE TABLE `merge_queue_entry_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `merge_queue_id` int NOT NULL,
  `merge_queue_entry_id` int NOT NULL,
  `enqueued_at` datetime NOT NULL,
  `merged_at` datetime DEFAULT NULL,
  `enqueued_in_position` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_merge_queue_entry_stats_on_merge_queue_id_and_enqueued_at` (`merge_queue_id`,`enqueued_at`),
  KEY `index_merge_queue_entry_stats_on_merge_queue_entry_id` (`merge_queue_entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `merge_queue_locked_refs`;
CREATE TABLE `merge_queue_locked_refs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `merge_queue_id` int NOT NULL,
  `ref` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_merge_queue_locked_refs_on_repository_id_and_ref` (`repository_id`,`ref`),
  KEY `index_merge_queue_locked_refs_on_merge_queue_id` (`merge_queue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `merge_queues`;
CREATE TABLE `merge_queues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `branch` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `current_merge_group_id` bigint unsigned DEFAULT NULL,
  `max_merge_group_size` tinyint NOT NULL DEFAULT '5',
  `min_merge_group_size` tinyint NOT NULL DEFAULT '1',
  `min_merge_group_size_wait_seconds` smallint DEFAULT NULL,
  `check_run_retries_limit` tinyint NOT NULL DEFAULT '0',
  `protected_branch_id` bigint unsigned DEFAULT NULL,
  `merge_method` enum('merge','squash','rebase') NOT NULL DEFAULT 'merge',
  `max_entries_to_build` tinyint unsigned NOT NULL DEFAULT '5',
  `check_response_timeout_minutes` smallint unsigned NOT NULL DEFAULT '60',
  `merging_strategy` enum('ALLGREEN','HEADGREEN') NOT NULL DEFAULT 'ALLGREEN',
  `max_entries_to_merge` tinyint unsigned NOT NULL DEFAULT '5',
  `min_entries_to_merge` tinyint unsigned NOT NULL DEFAULT '1',
  `min_entries_to_merge_wait_minutes` smallint unsigned NOT NULL DEFAULT '5',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_merge_queues_on_repository_id_and_branch` (`repository_id`,`branch`),
  UNIQUE KEY `index_merge_queues_on_protected_branch_id` (`protected_branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `move_work_items`;
CREATE TABLE `move_work_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `move_work_id` bigint NOT NULL COMMENT 'the move work which this item is linked',
  `resource_id` bigint unsigned NOT NULL COMMENT 'the resource id',
  `resource_type` enum('Repository','Project','MemexProject') COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'the type of the resource',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_move_work_items_on_move_work_id` (`move_work_id`),
  KEY `index_move_work_items_on_resource_id_and_resource_type` (`resource_id`,`resource_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `move_works`;
CREATE TABLE `move_works` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT 'the user which requested a move work',
  `origin_id` bigint unsigned NOT NULL COMMENT 'the origin of the work. can be the user who requested the move work or a organization',
  `target_id` bigint unsigned NOT NULL COMMENT 'the organization which we will move to',
  `state` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the state of the move work',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `feature` tinyint unsigned DEFAULT NULL COMMENT 'enum representing the feature move work was initiated from',
  PRIMARY KEY (`id`),
  KEY `index_move_works_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `ofac_downgrades`;
CREATE TABLE `ofac_downgrades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `downgrade_on` date DEFAULT NULL,
  `is_complete` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_ofac_downgrades_on_user_id` (`user_id`),
  KEY `index_ofac_downgrades_on_downgrade_on` (`downgrade_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `organization_collaborators`;
CREATE TABLE `organization_collaborators` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `organization_id` bigint unsigned NOT NULL,
  `business_id` bigint unsigned DEFAULT NULL,
  `public` tinyint(1) NOT NULL DEFAULT '0',
  `public_only_forks` tinyint(1) NOT NULL DEFAULT '0',
  `private` tinyint(1) NOT NULL DEFAULT '0',
  `private_only_forks` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_organization_collaborators_on_user_organization_business` (`user_id`,`organization_id`,`business_id`),
  KEY `index_organization_collaborators_on_public` (`public`),
  KEY `index_organization_collaborators_on_public_only_forks` (`public_only_forks`),
  KEY `index_organization_collaborators_on_private` (`private`),
  KEY `index_organization_collaborators_on_private_only_forks` (`private_only_forks`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `organization_discussion_post_replies`;
CREATE TABLE `organization_discussion_post_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `number` int NOT NULL,
  `body` mediumblob NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `user_id` int NOT NULL,
  `organization_discussion_post_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_org_disc_replies_organization_discussion_post_id_and_number` (`organization_discussion_post_id`,`number`),
  KEY `index_organization_discussion_post_replies_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `organization_discussion_posts`;
CREATE TABLE `organization_discussion_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `number` int NOT NULL,
  `title` varbinary(1024) NOT NULL,
  `body` mediumblob NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `user_id` int NOT NULL,
  `organization_id` int NOT NULL,
  `pinned_at` datetime DEFAULT NULL,
  `pinned_by_user_id` int DEFAULT NULL,
  `private` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_org_discussion_posts_on_organization_id_and_number` (`organization_id`,`number`),
  KEY `index_organization_discussion_posts_on_user_id` (`user_id`),
  KEY `idx_org_discussion_posts_on_organization_id_and_pinned_at` (`organization_id`,`pinned_at`),
  KEY `idx_org_discussion_posts_on_organization_id_and_private` (`organization_id`,`private`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `organization_discussion_repositories`;
CREATE TABLE `organization_discussion_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_organization_discussion_repositories_on_organization_id` (`organization_id`),
  UNIQUE KEY `index_organization_discussion_repositories_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `organization_oidc_sub_claim_templates`;
CREATE TABLE `organization_oidc_sub_claim_templates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned NOT NULL DEFAULT '0',
  `template` varchar(512) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_organization_oidc_sub_claim_templates_on_organization_id` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `organization_profiles`;
CREATE TABLE `organization_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_update_email` varchar(255) DEFAULT NULL,
  `organization_id` bigint unsigned NOT NULL,
  `sponsoring_linked_organization_id` bigint unsigned DEFAULT NULL,
  `stripe_customer_id` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_organization_profiles_on_organization_id` (`organization_id`),
  KEY `index_organization_profiles_on_sponsoring_linked_id_and_org_ids` (`sponsoring_linked_organization_id`,`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `otp_sms_timings`;
CREATE TABLE `otp_sms_timings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timing_key` varchar(85) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_otp_sms_timings_on_timing_key` (`timing_key`),
  KEY `index_otp_sms_timings_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pending_automatic_installations`;
CREATE TABLE `pending_automatic_installations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trigger_type` varchar(50) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` int NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `reason` tinyint NOT NULL DEFAULT '0',
  `installed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pending_automatic_installations_on_trigger_and_target` (`trigger_type`,`target_type`,`target_id`),
  KEY `index_pending_automatic_installations_on_target` (`target_type`,`target_id`),
  KEY `index_pending_automatic_installations_on_trigger_type_and_status` (`trigger_type`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `personal_reminders`;
CREATE TABLE `personal_reminders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time_zone_name` varchar(40) NOT NULL,
  `user_id` int NOT NULL,
  `reminder_slack_workspace_id` int NOT NULL,
  `remindable_id` int NOT NULL,
  `remindable_type` varchar(13) NOT NULL,
  `include_review_requests` tinyint(1) NOT NULL DEFAULT '1',
  `include_team_review_requests` tinyint(1) NOT NULL DEFAULT '0',
  `ignore_after_approval_count` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_personal_reminders_on_user_id_and_remindable` (`user_id`,`remindable_type`,`remindable_id`),
  KEY `index_personal_reminders_on_reminder_slack_workspace_id` (`reminder_slack_workspace_id`),
  KEY `index_personal_reminders_on_remindable_type_and_remindable_id` (`remindable_type`,`remindable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `photo_dna_hits`;
CREATE TABLE `photo_dna_hits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uploader_id` int NOT NULL,
  `content_id` int NOT NULL,
  `content_type` varchar(15) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `purged` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_photo_dna_hits_on_uploader_id` (`uploader_id`),
  KEY `index_photo_dna_hits_on_content_id_and_content_type` (`content_id`,`content_type`),
  KEY `index_photo_dna_hits_on_purged_and_created_at` (`purged`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pinned_issue_comments`;
CREATE TABLE `pinned_issue_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_comment_id` bigint unsigned NOT NULL,
  `issue_id` bigint unsigned NOT NULL,
  `pinned_by_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pinned_issue_comments_on_issue_id` (`issue_id`),
  KEY `index_pinned_issue_comments_on_issue_comment_id` (`issue_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pinned_issues`;
CREATE TABLE `pinned_issues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `issue_id` bigint unsigned NOT NULL,
  `pinned_by_id` bigint unsigned NOT NULL,
  `sort` varchar(126) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pinned_issues_on_repository_id_and_issue_id` (`repository_id`,`issue_id`),
  KEY `index_pinned_issues_on_repository_id_and_sort` (`repository_id`,`sort`),
  KEY `index_pinned_issues_on_issue_id` (`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `policy_constraints`;
CREATE TABLE `policy_constraints` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `policy_group_id` bigint unsigned NOT NULL,
  `name` int NOT NULL,
  `value_type` int NOT NULL,
  `enabled_value` tinyint(1) DEFAULT NULL,
  `maximum_value` int DEFAULT NULL,
  `minimum_value` int DEFAULT NULL,
  `allowed_values` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `params` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_policy_constraints_on_policy_group_id_and_name` (`policy_group_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `policy_group_memberships`;
CREATE TABLE `policy_group_memberships` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `policy_group_id` bigint unsigned NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `target_type` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `target_filter` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_policy_group_memberships_on_policy_group_id_and_target` (`policy_group_id`,`target_id`,`target_type`),
  KEY `index_policy_group_memberships_on_target_id_and_target_type` (`target_id`,`target_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `policy_groups`;
CREATE TABLE `policy_groups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `owner_type` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_policy_groups_on_owner_id_and_owner_type_and_name` (`owner_id`,`owner_type`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `potential_sponsorships`;
CREATE TABLE `potential_sponsorships` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `potential_sponsor_id` bigint unsigned NOT NULL,
  `potential_sponsorable_id` bigint unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `created_by_id` bigint unsigned NOT NULL,
  `message` blob,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_potential_sponsorships_on_poten_sponsorable_poten_sponsor` (`potential_sponsorable_id`,`potential_sponsor_id`),
  KEY `idx_potential_sponsorships_on_state_and_potential_sponsorable_id` (`state`,`potential_sponsorable_id`),
  KEY `index_potential_sponsorships_on_potential_sponsor_id` (`potential_sponsor_id`),
  KEY `index_potential_sponsorships_on_created_by_id` (`created_by_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `profile_highlight_contributions`;
CREATE TABLE `profile_highlight_contributions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint NOT NULL,
  `profile_highlight_id` bigint NOT NULL,
  `contributor_email` varchar(255) NOT NULL,
  `ignore` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_profile_highlight_contributions_on_repository_id` (`repository_id`),
  KEY `index_profile_highlight_contributions_on_profile_highlight_id` (`profile_highlight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `profile_highlights`;
CREATE TABLE `profile_highlights` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `eligible` tinyint(1) NOT NULL DEFAULT '0',
  `hidden` tinyint(1) NOT NULL DEFAULT '1',
  `highlight_type` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_profile_highlights_on_user_id_and_eligible_and_hidden` (`user_id`,`eligible`,`hidden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_imports`;
CREATE TABLE `pull_request_imports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `import_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pull_request_imports_pull_request_id` (`pull_request_id`),
  KEY `index_pull_request_imports_import_id` (`import_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `refreshable_type` varchar(80) NOT NULL,
  `refreshable_id` bigint NOT NULL,
  `hashed_token` varbinary(44) NOT NULL,
  `expires_at` bigint NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_refresh_tokens_on_refreshable_id_and_refreshable_type` (`refreshable_id`,`refreshable_type`),
  UNIQUE KEY `index_refresh_tokens_on_hashed_token_and_expires_at` (`hashed_token`,`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `reminder_delivery_times`;
CREATE TABLE `reminder_delivery_times` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time` int NOT NULL,
  `day` tinyint NOT NULL,
  `next_delivery_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `schedulable_id` int NOT NULL,
  `schedulable_type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reminder_delivery_times_on_schedulable_and_time_and_day` (`schedulable_type`,`schedulable_id`,`time`,`day`),
  KEY `index_reminder_delivery_times_on_next_delivery_at` (`next_delivery_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `reminder_event_subscriptions`;
CREATE TABLE `reminder_event_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` int NOT NULL,
  `subscriber_id` int NOT NULL,
  `subscriber_type` varchar(16) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `options` varbinary(1024) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reminder_event_subscriptions_subscriber_and_event_type` (`subscriber_id`,`subscriber_type`,`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `reminder_repository_links`;
CREATE TABLE `reminder_repository_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reminder_id` int NOT NULL,
  `repository_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_reminder_repository_links_on_reminder_id` (`reminder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `reminder_slack_workspace_memberships`;
CREATE TABLE `reminder_slack_workspace_memberships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reminder_slack_workspace_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reminder_slack_user_on_user_id_and_slack_workspace_id` (`user_id`,`reminder_slack_workspace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `reminder_slack_workspaces`;
CREATE TABLE `reminder_slack_workspaces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slack_id` varchar(120) NOT NULL,
  `remindable_type` varchar(13) NOT NULL,
  `remindable_id` int NOT NULL,
  `name` varbinary(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `type` varchar(40) NOT NULL DEFAULT 'ReminderSlackWorkspace',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reminder_slack_workspaces_on_remindable_and_slack_id` (`remindable_type`,`remindable_id`,`slack_id`),
  KEY `index_reminder_slack_workspaces_on_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `reminder_team_memberships`;
CREATE TABLE `reminder_team_memberships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reminder_id` int NOT NULL,
  `team_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reminder_team_memberships_on_reminder_id_and_team_id` (`reminder_id`,`team_id`),
  KEY `index_reminder_team_memberships_on_team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `reminders`;
CREATE TABLE `reminders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `remindable_type` varchar(13) NOT NULL,
  `remindable_id` bigint unsigned NOT NULL,
  `reminder_slack_workspace_id` bigint unsigned NOT NULL,
  `slack_channel` varchar(80) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `time_zone_name` varchar(40) NOT NULL,
  `min_age` int NOT NULL DEFAULT '0',
  `min_staleness` int NOT NULL DEFAULT '0',
  `include_unassigned_prs` tinyint(1) NOT NULL DEFAULT '0',
  `include_reviewed_prs` tinyint(1) NOT NULL DEFAULT '0',
  `require_review_request` tinyint(1) NOT NULL DEFAULT '1',
  `ignore_draft_prs` tinyint(1) NOT NULL DEFAULT '1',
  `ignore_after_approval_count` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ignored_terms` varbinary(1024) DEFAULT NULL,
  `ignored_labels` varbinary(1024) DEFAULT NULL,
  `required_labels` varbinary(1024) DEFAULT NULL,
  `needed_reviews` tinyint NOT NULL DEFAULT '0',
  `slack_channel_id` varchar(120) DEFAULT NULL,
  `team_id` bigint unsigned DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_reminders_on_reminder_slack_workspace_id` (`reminder_slack_workspace_id`),
  KEY `index_reminders_on_remindable_type_and_remindable_id` (`remindable_type`,`remindable_id`),
  KEY `index_reminders_on_team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_actions_oidc_configs`;
CREATE TABLE `repository_actions_oidc_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `configuration` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_actions_oidc_configs_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_advisories`;
CREATE TABLE `repository_advisories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `author_id` bigint unsigned NOT NULL,
  `publisher_id` bigint unsigned DEFAULT NULL,
  `assignee_id` bigint unsigned DEFAULT NULL,
  `title` varbinary(1024) NOT NULL,
  `description` mediumblob,
  `state` int NOT NULL DEFAULT '0',
  `severity` int DEFAULT NULL,
  `impact` mediumblob,
  `workarounds` mediumblob,
  `cve_id` varbinary(40) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `published_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `withdrawn_at` datetime DEFAULT NULL,
  `workspace_repository_id` bigint unsigned DEFAULT NULL,
  `ghsa_id` varchar(19) NOT NULL,
  `body` mediumblob,
  `owner_id` bigint unsigned DEFAULT NULL,
  `cvss_v3` varbinary(255) DEFAULT NULL,
  `external` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether the advisory was submitted as an external private vulnerability disclosure versus an internal draft advisory',
  `accepted` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether a private vulnerability disclosure has been accepted by a maintainer as a draft advisory',
  `frozen_description` mediumblob COMMENT 'The description of the advisory when the author was removed as a collaborator. Only populated at removal time.',
  `frozen_title` varbinary(1024) DEFAULT NULL COMMENT 'The title of the advisory at the time the author was removed as a collaborator. Only populated at removal time.',
  `repo_advisory_type` tinyint DEFAULT NULL,
  `cvss_v4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_advisories_on_ghsa_id` (`ghsa_id`),
  UNIQUE KEY `index_repository_advisories_on_workspace_repository_id` (`workspace_repository_id`),
  KEY `index_repository_advisories_on_repository_id_and_state` (`repository_id`,`state`),
  KEY `index_repository_advisories_on_owner_and_workspace_repository` (`owner_id`,`workspace_repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_advisory_affected_products`;
CREATE TABLE `repository_advisory_affected_products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_advisory_id` bigint unsigned NOT NULL,
  `ecosystem` varbinary(50) DEFAULT NULL,
  `package` varbinary(100) DEFAULT NULL,
  `affected_versions` blob,
  `patches` mediumblob,
  `affected_functions` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repo_advisory_affected_products_on_repo_advisory_id` (`repository_advisory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_advisory_comments`;
CREATE TABLE `repository_advisory_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_advisory_id` bigint unsigned NOT NULL,
  `user_id` int NOT NULL,
  `body` mediumblob NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_advisory_comments_on_repository_advisory_id` (`repository_advisory_id`),
  KEY `index_repository_advisory_comments_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_advisory_events`;
CREATE TABLE `repository_advisory_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_advisory_id` bigint unsigned NOT NULL,
  `actor_id` int NOT NULL,
  `event` varchar(40) NOT NULL,
  `changed_attribute` varchar(40) DEFAULT NULL,
  `value_was` varbinary(2014) DEFAULT NULL,
  `value_is` varbinary(2014) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `subject_id` bigint unsigned DEFAULT NULL COMMENT 'User ID of the subject of the advisory event',
  `subject_type` varchar(30) NOT NULL DEFAULT 'User' COMMENT 'Class of the advisory event subject (eg. User or Team)',
  PRIMARY KEY (`id`),
  KEY `index_repository_advisory_events_on_repo_adv_id_and_event` (`repository_advisory_id`,`event`),
  KEY `index_repository_advisory_events_on_actor_id_event_created_at` (`actor_id`,`event`,`created_at`),
  KEY `index_repository_advisory_events_on_subject_id_and_subject_type` (`subject_id`,`subject_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_clones`;
CREATE TABLE `repository_clones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_repository_id` int NOT NULL,
  `clone_repository_id` int NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `cloning_user_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `error_reason_code` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_clones_on_clone_repository_id` (`clone_repository_id`),
  KEY `index_repository_clones_on_template_repository_id` (`template_repository_id`),
  KEY `index_repository_clones_on_cloning_user_id` (`cloning_user_id`),
  KEY `index_repository_clones_on_clone_repository_id_and_state` (`clone_repository_id`,`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_contribution_graph_statuses`;
CREATE TABLE `repository_contribution_graph_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `job_status_id` char(36) DEFAULT NULL,
  `last_indexed_oid` varchar(64) DEFAULT NULL,
  `last_viewed_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `top_contributor_ids` blob,
  `last_indexed_at` datetime DEFAULT NULL,
  `job_enqueued_at` datetime DEFAULT NULL,
  `data_source` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_contribution_graph_statuses_repo_id_data_source` (`repository_id`,`data_source`),
  KEY `index_repository_contribution_graph_statuses_on_last_viewed_at` (`last_viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_imports`;
CREATE TABLE `repository_imports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `import_id` int NOT NULL,
  `repository_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_imports_repository_id` (`repository_id`),
  KEY `index_repository_imports_import_id` (`import_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_network_graphs`;
CREATE TABLE `repository_network_graphs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `job_status_id` char(36) DEFAULT NULL,
  `network_hash` varchar(64) DEFAULT NULL,
  `built_at` datetime DEFAULT NULL,
  `focus` int DEFAULT '0',
  `meta` mediumblob,
  `commits_index` mediumblob,
  `commits_data` mediumblob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_network_graphs_on_repository_id` (`repository_id`),
  KEY `index_repository_network_graphs_on_built_at` (`built_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `review_request_delegation_excluded_members`;
CREATE TABLE `review_request_delegation_excluded_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `team_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `excluded_members_team_user_unique` (`team_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `review_request_delegation_included_members`;
CREATE TABLE `review_request_delegation_included_members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `team_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `included_members_team_user_unique` (`team_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `saved_collections`;
CREATE TABLE `saved_collections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dashboard_id` bigint unsigned NOT NULL,
  `priority` bigint unsigned DEFAULT NULL,
  `color` int DEFAULT '0',
  `icon` int DEFAULT '0',
  `description` mediumblob,
  `name` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT '',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `protected_type` int DEFAULT NULL COMMENT 'Denotes a collection''s protected, system-reserved type.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_saved_collections_on_dashboard_id_and_priority` (`dashboard_id`,`priority`),
  UNIQUE KEY `index_saved_collections_on_dashboard_id_and_protected_type` (`dashboard_id`,`protected_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `saved_views`;
CREATE TABLE `saved_views` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `saved_collection_id` bigint unsigned NOT NULL,
  `priority` bigint unsigned DEFAULT NULL,
  `color` int DEFAULT '0',
  `icon` int DEFAULT '0',
  `description` mediumblob,
  `compressed_query` mediumblob,
  `name` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT '',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_saved_views_on_saved_collection_id_and_priority` (`saved_collection_id`,`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `science_events`;
CREATE TABLE `science_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(85) NOT NULL,
  `event_type` varchar(10) NOT NULL,
  `payload` mediumblob NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_science_events_on_name_and_event_type` (`name`,`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `scoped_integration_installations`;
CREATE TABLE `scoped_integration_installations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `integration_installation_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` bigint DEFAULT NULL,
  `authorization_details` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_scoped_installations_on_integration_installation_id` (`integration_installation_id`),
  KEY `index_scoped_integration_installations_on_created_at` (`created_at`),
  KEY `index_scoped_integration_installations_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `search_custom_scopes`;
CREATE TABLE `search_custom_scopes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `query` varchar(500) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `color` int DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_search_custom_scopes_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `search_shortcuts`;
CREATE TABLE `search_shortcuts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dashboard_id` bigint unsigned NOT NULL,
  `priority` bigint unsigned DEFAULT NULL,
  `scoping_repository_id` bigint unsigned DEFAULT NULL,
  `name` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT '',
  `search_type` int NOT NULL DEFAULT '0',
  `icon` int DEFAULT '0',
  `color` int DEFAULT '0',
  `compressed_query` mediumblob,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `description` mediumblob,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_search_shortcuts_on_dashboard_id_and_priority` (`dashboard_id`,`priority`),
  KEY `index_search_shortcuts_on_scoping_repository_id` (`scoping_repository_id`),
  KEY `index_search_shortcuts_on_search_type` (`search_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `site_scoped_integration_installations`;
CREATE TABLE `site_scoped_integration_installations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `integration_id` bigint unsigned NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `target_type` varchar(25) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` bigint DEFAULT NULL,
  `rate_limit` int DEFAULT NULL,
  `authorization_details` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_site_scoped_integration_installations_on_integration_id` (`integration_id`),
  KEY `index_site_scoped_integration_installations_on_target` (`target_id`,`target_type`),
  KEY `index_site_scoped_integration_installations_on_created_at` (`created_at`),
  KEY `index_site_scoped_integration_installations_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsors_activities`;
CREATE TABLE `sponsors_activities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsorable_id` bigint unsigned NOT NULL,
  `sponsorable_metadata` json DEFAULT NULL,
  `sponsor_id` bigint unsigned DEFAULT NULL,
  `action` int NOT NULL,
  `sponsors_tier_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `invoiced` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `old_sponsors_tier_id` bigint unsigned DEFAULT NULL,
  `old_repository_id` bigint unsigned DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `matched_sponsorship` tinyint(1) NOT NULL DEFAULT '0',
  `via_bulk_sponsorship` tinyint(1) NOT NULL DEFAULT '0',
  `payment_source` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_sponsors_activities_on_sponsor_id_and_action_and_timestamp` (`sponsor_id`,`action`,`timestamp`),
  KEY `index_sponsors_activities_on_sponsorable_id_action_and_timestamp` (`sponsorable_id`,`action`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_activity_metrics`;
CREATE TABLE `sponsors_activity_metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `sponsorable_id` int NOT NULL,
  `metric` int NOT NULL,
  `value` int NOT NULL,
  `recorded_on` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sponsors_metrics_on_sponsorable_and_metric_and_recorded_on` (`sponsorable_id`,`metric`,`recorded_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_agreement_signatures`;
CREATE TABLE `sponsors_agreement_signatures` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_agreement_id` bigint unsigned NOT NULL,
  `sponsors_listing_id` bigint unsigned NOT NULL,
  `signatory_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sponsors_agreement_signatures_on_agreement_listing_signatory` (`sponsors_agreement_id`,`sponsors_listing_id`,`signatory_id`),
  KEY `index_sponsors_agreement_signatures_on_sponsors_listing_id` (`sponsors_listing_id`),
  KEY `index_sponsors_agreement_signatures_on_signatory_id` (`signatory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_agreements`;
CREATE TABLE `sponsors_agreements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kind` tinyint NOT NULL DEFAULT '0',
  `body` mediumblob NOT NULL,
  `version` varchar(30) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `organization_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sponsors_agreements_on_kind_and_version` (`kind`,`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_business_tax_identifiers`;
CREATE TABLE `sponsors_business_tax_identifiers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `country` varchar(2) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `region` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `vat_code` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_business_tax_identifiers_on_user_and_created_at` (`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsors_criteria`;
CREATE TABLE `sponsors_criteria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(60) NOT NULL,
  `description` blob NOT NULL,
  `criterion_type` int NOT NULL DEFAULT '0',
  `automated` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `applicable_to` tinyint NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sponsors_criteria_on_slug` (`slug`),
  KEY `index_sponsors_criteria_on_criterion_type` (`criterion_type`),
  KEY `index_sponsors_criteria_on_applicable_to` (`applicable_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_fraud_reviews`;
CREATE TABLE `sponsors_fraud_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sponsors_listing_id` int NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `reviewer_id` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_sponsors_fraud_reviews_on_sponsors_listing_id` (`sponsors_listing_id`),
  KEY `index_sponsors_fraud_reviews_on_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_goal_contributions`;
CREATE TABLE `sponsors_goal_contributions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sponsors_goal_id` int NOT NULL,
  `sponsor_id` int NOT NULL,
  `sponsors_tier_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_sponsors_goal_contributions_on_sponsors_goal_id` (`sponsors_goal_id`),
  KEY `index_sponsors_goal_contributions_on_sponsor_id_and_created_at` (`sponsor_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_goals`;
CREATE TABLE `sponsors_goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sponsors_listing_id` int NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `kind` int NOT NULL DEFAULT '0',
  `target_value` int NOT NULL DEFAULT '0',
  `description` blob,
  `completed_at` datetime DEFAULT NULL,
  `retired_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `standard` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_sponsors_goals_on_sponsors_listing_id_and_state` (`sponsors_listing_id`,`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_invoiced_agreement_signatures`;
CREATE TABLE `sponsors_invoiced_agreement_signatures` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_agreement_id` bigint unsigned NOT NULL,
  `signatory_id` bigint unsigned NOT NULL,
  `organization_id` bigint unsigned NOT NULL,
  `expires_on` date NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_520_ci,
  PRIMARY KEY (`id`),
  KEY `idx_sponsors_invoiced_agreement_signatures_on_spon_agree_org_id` (`sponsors_agreement_id`,`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsors_listing_featured_items`;
CREATE TABLE `sponsors_listing_featured_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_listing_id` bigint unsigned NOT NULL,
  `featureable_type` int NOT NULL,
  `featureable_id` bigint unsigned NOT NULL,
  `position` int NOT NULL DEFAULT '1',
  `description` tinyblob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sponsors_listing_featured_items_unique` (`sponsors_listing_id`,`featureable_type`,`featureable_id`),
  KEY `index_sponsors_listing_featured_items_on_featureable` (`featureable_type`,`featureable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_listing_stafftools_metadata`;
CREATE TABLE `sponsors_listing_stafftools_metadata` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_listing_id` bigint unsigned NOT NULL,
  `sponsorable_id` bigint unsigned NOT NULL,
  `sponsorable_created_at` datetime(6) NOT NULL,
  `sponsorable_time_zone_name` varchar(40) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `has_received_abuse_report` tinyint(1) NOT NULL DEFAULT '0',
  `has_customized_user_profile` tinyint(1) NOT NULL DEFAULT '0',
  `has_public_non_fork_repository` tinyint(1) NOT NULL DEFAULT '0',
  `ignored` tinyint(1) GENERATED ALWAYS AS ((`ignored_at` is not null)) VIRTUAL NOT NULL,
  `ignored_at` datetime(6) DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `approval_requested_at` datetime(6) DEFAULT NULL,
  `banned_at` datetime(6) DEFAULT NULL,
  `banned_by_id` bigint unsigned DEFAULT NULL,
  `banned_reason` varbinary(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sponsors_listing_stafftools_metadata_on_sponsors_listing_id` (`sponsors_listing_id`),
  UNIQUE KEY `index_sponsors_listing_stafftools_metadata_on_sponsorable_id` (`sponsorable_id`),
  KEY `idx_sponsors_listing_stafftools_metadata_listing_ig_spon_created` (`sponsors_listing_id`,`ignored`,`sponsorable_created_at`),
  KEY `idx_sponsors_listing_stafftools_metadata_listing_ig_reviewed_at` (`sponsors_listing_id`,`ignored`,`reviewed_at`),
  KEY `idx_sponsors_listing_stafftools_metadata_listing_ig_apprv_req_at` (`sponsors_listing_id`,`ignored`,`approval_requested_at`),
  KEY `idx_sponsors_listing_stafftools_metadata_listing_id_ig_time_zone` (`sponsors_listing_id`,`ignored`,`sponsorable_time_zone_name`),
  KEY `idx_sponsors_listing_stafftools_metadata_list_ig_repo_prof_abuse` (`sponsors_listing_id`,`ignored`,`has_public_non_fork_repository`,`has_customized_user_profile`,`has_received_abuse_report`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsors_listings`;
CREATE TABLE `sponsors_listings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `sponsorable_id` bigint unsigned NOT NULL,
  `created_by_id` bigint unsigned DEFAULT NULL,
  `short_description` tinyblob,
  `full_description` blob,
  `survey_id` bigint unsigned DEFAULT NULL,
  `contact_email_id` bigint unsigned DEFAULT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `is_fiscal_host` tinyint(1) NOT NULL DEFAULT '0',
  `parent_listing_id` bigint unsigned DEFAULT NULL,
  `featured_description` varbinary(256) DEFAULT NULL,
  `featured_state` int DEFAULT '0',
  `billing_country` char(2) DEFAULT NULL,
  `country_of_residence` char(2) DEFAULT NULL,
  `suggested_custom_tier_amount_in_cents` int DEFAULT NULL,
  `min_custom_tier_amount_in_cents` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `published_at` datetime DEFAULT NULL,
  `joined_at` datetime(6) NOT NULL,
  `accepted_at` datetime(6) DEFAULT NULL,
  `last_payout_at` datetime(6) DEFAULT NULL,
  `payout_probation_started_at` datetime DEFAULT NULL,
  `payout_probation_ended_at` datetime DEFAULT NULL,
  `match_disabled` tinyint(1) NOT NULL DEFAULT '0',
  `stripe_authorization_code` varchar(40) DEFAULT NULL,
  `match_limit_reached_at` datetime DEFAULT NULL,
  `milestone_email_sent_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sponsors_listings_on_slug` (`slug`),
  UNIQUE KEY `index_sponsors_listings_on_sponsorable_id` (`sponsorable_id`),
  KEY `index_sponsors_listings_on_payout_probation` (`payout_probation_started_at`,`payout_probation_ended_at`),
  KEY `index_sponsors_listings_on_state_and_payout_probation_started` (`state`,`payout_probation_started_at`),
  KEY `index_sponsors_listings_on_state_and_payout_probation` (`state`,`payout_probation_ended_at`,`payout_probation_started_at`),
  KEY `index_sponsors_listings_on_match_disabled_and_created_at` (`match_disabled`,`created_at`),
  KEY `index_sponsors_listings_on_match_disabled_and_published_at` (`match_disabled`,`published_at`),
  KEY `index_sponsors_listings_on_stripe_authorization_code` (`stripe_authorization_code`),
  KEY `index_sponsors_listings_on_contact_email_id` (`contact_email_id`),
  KEY `idx_sponsors_listings_on_featured_state_and_sponsorable` (`featured_state`,`sponsorable_id`),
  KEY `index_sponsors_listings_on_parent_listing_id_and_state` (`parent_listing_id`,`state`),
  KEY `index_sponsors_listings_on_is_fiscal_host_and_state` (`is_fiscal_host`,`state`),
  KEY `index_sponsors_listings_on_state_and_last_payout_at` (`state`,`last_payout_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_memberships_criteria`;
CREATE TABLE `sponsors_memberships_criteria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sponsors_criterion_id` int NOT NULL,
  `sponsors_listing_id` bigint unsigned DEFAULT NULL,
  `reviewer_id` int DEFAULT NULL,
  `met` tinyint(1) NOT NULL DEFAULT '0',
  `value` blob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_sponsors_memberships_criteria_on_sponsors_criterion_id` (`sponsors_criterion_id`),
  KEY `index_sponsors_memberships_criteria_on_reviewer_id` (`reviewer_id`),
  KEY `idx_sponsors_memberships_criteria_on_listing_id_and_criterion_id` (`sponsors_listing_id`,`sponsors_criterion_id`),
  KEY `idx_sponsors_memberships_criteria_on_sponsors_listing_id_and_met` (`sponsors_listing_id`,`met`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsors_patreon_campaign_webhooks`;
CREATE TABLE `sponsors_patreon_campaign_webhooks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_patreon_user_id` bigint unsigned NOT NULL COMMENT 'Foreign key to sponsors_patreon_users',
  `campaign_id` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'Campaign ID on Patreon',
  `webhook_id` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'ID of the webhook on Patreon',
  `secret` varbinary(8192) DEFAULT NULL COMMENT 'Secret for verifying events triggered by this webhook',
  `triggers` text COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'List of event types that will trigger the webhook',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_sponsors_patreon_user_id_campaign_id_032ac3281c` (`sponsors_patreon_user_id`,`campaign_id`),
  UNIQUE KEY `index_sponsors_patreon_campaign_webhooks_on_webhook_id` (`webhook_id`),
  KEY `index_sponsors_patreon_campaign_webhooks_on_campaign_id` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsors_patreon_tiers`;
CREATE TABLE `sponsors_patreon_tiers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_patreon_user_id` bigint unsigned NOT NULL COMMENT 'Foreign key to sponsors_patreon_users',
  `campaign_id` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'Patreon campaign ID this tier is part of',
  `amount_in_cents` int NOT NULL COMMENT 'Value of the tier on Patreon associated with this campaign',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_sponsors_patreon_user_id_campaign_id_amount__7c7a736db4` (`sponsors_patreon_user_id`,`campaign_id`,`amount_in_cents`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsors_patreon_users`;
CREATE TABLE `sponsors_patreon_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `patreon_user_id` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `patreon_email` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `patreon_username` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `patreon_access_token` varbinary(8192) DEFAULT NULL,
  `patreon_refresh_token` varbinary(8192) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `enabled_as_sponsorable` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sponsors_patreon_users_on_user_id_and_patreon_user_id` (`user_id`,`patreon_user_id`),
  UNIQUE KEY `index_sponsors_patreon_users_on_patreon_user_id` (`patreon_user_id`),
  KEY `index_sponsors_patreon_users_on_patreon_email` (`patreon_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsors_tiers`;
CREATE TABLE `sponsors_tiers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_listing_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `parent_tier_id` bigint unsigned DEFAULT NULL,
  `name` varbinary(1024) NOT NULL,
  `description` mediumblob NOT NULL,
  `state` smallint NOT NULL DEFAULT '0',
  `frequency` int NOT NULL DEFAULT '0',
  `monthly_price_in_cents` int NOT NULL DEFAULT '0',
  `yearly_price_in_cents` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `standard` tinyint(1) NOT NULL DEFAULT '0',
  `welcome_message` mediumblob,
  PRIMARY KEY (`id`),
  KEY `index_sponsors_tiers_on_listing_and_monthly_price_in_cents` (`sponsors_listing_id`,`monthly_price_in_cents`),
  KEY `index_sponsors_tiers_on_creator_id` (`creator_id`),
  KEY `idx_sponsors_tiers_on_name_sponsors_listing_id_state_frequency` (`name`,`sponsors_listing_id`,`state`,`frequency`),
  KEY `index_sponsors_tiers_on_state_sponsors_listing_id_and_frequency` (`state`,`sponsors_listing_id`,`frequency`),
  KEY `index_sponsors_tiers_on_repo_and_state` (`repository_id`,`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsorship_match_bans`;
CREATE TABLE `sponsorship_match_bans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sponsorable_id` int NOT NULL,
  `sponsor_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_sponsorship_match_bans_on_sponsorable` (`sponsorable_id`),
  KEY `index_sponsorship_match_bans_on_sponsor` (`sponsor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsorship_newsletter_tiers`;
CREATE TABLE `sponsorship_newsletter_tiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sponsorship_newsletter_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `sponsors_tier_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_newsletter_and_tier` (`sponsorship_newsletter_id`,`sponsors_tier_id`),
  KEY `index_newsletter_tiers_on_tier` (`sponsors_tier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsorship_newsletters`;
CREATE TABLE `sponsorship_newsletters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `author_id` int NOT NULL,
  `body` mediumblob NOT NULL,
  `subject` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `sponsorable_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_sponsorship_newsletters_on_author_id` (`author_id`),
  KEY `index_sponsorship_newsletters_on_sponsorable_and_state` (`sponsorable_id`,`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sponsorship_repositories`;
CREATE TABLE `sponsorship_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsor_id` bigint unsigned NOT NULL,
  `sponsorable_id` bigint unsigned NOT NULL,
  `sponsors_tier_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sponsorship_repositories_on_repository_id_sponsor_id_tier_id` (`repository_id`,`sponsor_id`,`sponsors_tier_id`),
  KEY `index_sponsorship_repositories_sponsorable_id_sponsor_id_tier_id` (`sponsorable_id`,`sponsor_id`,`sponsors_tier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsorship_sift_payment_abuse_scores`;
CREATE TABLE `sponsorship_sift_payment_abuse_scores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsorship_id` bigint unsigned NOT NULL,
  `sponsor_id` bigint unsigned NOT NULL,
  `sponsorable_id` bigint unsigned NOT NULL,
  `value` decimal(10,9) NOT NULL,
  `reasons` json DEFAULT NULL,
  `plan_subscription_id` bigint unsigned NOT NULL,
  `billing_transaction_id` bigint unsigned NOT NULL,
  `line_item_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sponsorship_sift_payment_abuse_scores_on_line_item_id` (`line_item_id`),
  KEY `index_sponsorship_sift_payment_abuse_scores_sponsorship_id_value` (`sponsorship_id`,`value`),
  KEY `idx_sponsorship_sift_payment_abuse_scores_billing_xact_id_value` (`billing_transaction_id`,`value`),
  KEY `index_sponsorship_sift_payment_abuse_scores_on_sponsor_id_value` (`sponsor_id`,`value`),
  KEY `index_sponsorship_sift_payment_abuse_scores_sponsorable_id_value` (`sponsorable_id`,`value`),
  KEY `index_sponsorship_sift_payment_abuse_scores_plan_subscription_id` (`plan_subscription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsorship_stripe_radar_risk_scores`;
CREATE TABLE `sponsorship_stripe_radar_risk_scores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `value` tinyint unsigned NOT NULL,
  `outcome` json DEFAULT NULL,
  `billing_transaction_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sponsorship_stripe_radar_risk_scores_billing_xact_id_value` (`billing_transaction_id`,`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sponsorships`;
CREATE TABLE `sponsorships` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `privacy_level` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `paid` tinyint(1) GENERATED ALWAYS AS ((`paid_at` is not null)) VIRTUAL NOT NULL,
  `payment_source` int NOT NULL DEFAULT '0',
  `sponsor_id` bigint unsigned NOT NULL,
  `is_sponsor_opted_in_to_email` tinyint(1) NOT NULL DEFAULT '0',
  `maintainer_notes` text,
  `is_sponsor_tier_reward_fulfilled` tinyint(1) NOT NULL DEFAULT '0',
  `subscription_item_id` bigint unsigned DEFAULT NULL,
  `is_sponsor_opted_in_to_share_with_fiscal_host` tinyint(1) NOT NULL DEFAULT '0',
  `sponsorable_id` bigint unsigned NOT NULL,
  `latest_sponsorable_metadata` json DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `state` int NOT NULL DEFAULT '0',
  `activated_at` datetime(6) DEFAULT NULL,
  `subscribable_id` bigint unsigned NOT NULL,
  `subscribable_selected_at` datetime(6) DEFAULT NULL,
  `skip_proration` tinyint(1) NOT NULL DEFAULT '0',
  `invoiced_sponsorship_transfer_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sponsorships_sponsor_sponsorable_unique` (`sponsor_id`,`sponsorable_id`),
  KEY `index_sponsorships_on_active_and_expires_at` (`active`,`expires_at`),
  KEY `idx_sponsorships_on_invoice_active_subscribable_selected_expires` (`invoiced_sponsorship_transfer_id`,`active`,`subscribable_id`,`subscribable_selected_at`,`expires_at`),
  KEY `index_sponsorships_on_subscribable` (`subscribable_id`),
  KEY `index_sponsorships_on_subscription_item_id` (`subscription_item_id`),
  KEY `index_sponsorships_on_sponsorable_active_subscribable_email_opt` (`sponsorable_id`,`active`,`subscribable_id`,`is_sponsor_opted_in_to_email`),
  KEY `index_sponsorships_on_sponsorable_active_email_opt_in_expires_at` (`sponsorable_id`,`active`,`is_sponsor_opted_in_to_email`,`expires_at`),
  KEY `index_sponsorships_on_state_and_expires_at` (`state`,`expires_at`),
  KEY `index_sponsorships_on_state_and_paid_at` (`state`,`paid_at`),
  KEY `index_sponsorships_on_privacy_level_sponsorable_state_sponsor` (`privacy_level`,`sponsorable_id`,`state`,`sponsor_id`),
  KEY `index_sponsorships_on_sponsorable_id_state_subscribable_id` (`sponsorable_id`,`state`,`subscribable_id`),
  KEY `index_sponsorships_on_payment_source_and_sponsorable_id` (`payment_source`,`sponsorable_id`),
  KEY `index_sponsorships_on_active_invoiced_xfer_id_paid_expires_at` (`active`,`invoiced_sponsorship_transfer_id`,`paid`,`expires_at`),
  KEY `idx_sponsorships_on_active_sponsor_invoiced_xfer_id_paid_expires` (`active`,`sponsor_id`,`invoiced_sponsorship_transfer_id`,`paid`,`expires_at`),
  KEY `index_sponsorships_on_state_invoiced_xfer_id_paid_expires_at` (`state`,`invoiced_sponsorship_transfer_id`,`paid`,`expires_at`),
  KEY `idx_sponsorships_on_state_sponsor_invoiced_xfer_id_paid_expires` (`state`,`sponsor_id`,`invoiced_sponsorship_transfer_id`,`paid`,`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `ssh_certificate_authorities`;
CREATE TABLE `ssh_certificate_authorities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_type` varchar(8) NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `openssh_public_key` text NOT NULL,
  `fingerprint` varbinary(64) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `max_ssh_cert_lifetime_hours` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_ssh_certificate_authorities_on_fingerprint` (`fingerprint`),
  KEY `index_ssh_certificate_authorities_on_owner_type_and_owner_id` (`owner_type`,`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `stacks_allowlists`;
CREATE TABLE `stacks_allowlists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `entity_id` bigint unsigned NOT NULL,
  `entity_type` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `verified_allowed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_stacks_allowlists_on_entity_id_and_entity_type` (`entity_id`,`entity_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `stacks_analytics`;
CREATE TABLE `stacks_analytics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `template_repository_id` bigint unsigned NOT NULL DEFAULT '0',
  `total_instance_count` bigint unsigned NOT NULL DEFAULT '0',
  `present_day_instance_count` bigint unsigned NOT NULL DEFAULT '0',
  `last_29_days_instance_counts` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_stacks_analytics_on_template_repository_id` (`template_repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `stacks_flows`;
CREATE TABLE `stacks_flows` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `instance_id` bigint unsigned NOT NULL,
  `plan_id` bigint unsigned NOT NULL,
  `depends_on` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_stacks_flows_on_instance_id_and_plan_id_and_depends_on` (`instance_id`,`plan_id`,`depends_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `stacks_instances`;
CREATE TABLE `stacks_instances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `inputs` json DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `template_repo` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT '',
  `instance_repository_id` bigint unsigned NOT NULL DEFAULT '0',
  `template_repository_id` bigint unsigned NOT NULL DEFAULT '0',
  `template_ref` varbinary(1024) NOT NULL DEFAULT '',
  `status_details` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_stacks_instances_on_instance_repository_id` (`instance_repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `stacks_plans`;
CREATE TABLE `stacks_plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `instance_id` bigint unsigned NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `actor_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_stacks_plans_on_instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `stacks_statuses`;
CREATE TABLE `stacks_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `instance_id` bigint unsigned NOT NULL,
  `entity_id` bigint unsigned NOT NULL,
  `entity_type` tinyint NOT NULL DEFAULT '0',
  `parent_id` bigint unsigned DEFAULT NULL,
  `plan_id` bigint unsigned NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `message` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_entity_type_and_entity_id` (`instance_id`,`plan_id`,`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `stacks_steps`;
CREATE TABLE `stacks_steps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `instance_id` bigint unsigned NOT NULL,
  `plan_id` bigint unsigned NOT NULL,
  `flow_id` bigint unsigned NOT NULL,
  `type` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `inputs` json DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_stacks_steps_on_instance_id_and_plan_id_and_flow_id` (`instance_id`,`plan_id`,`flow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `successor_invitations`;
CREATE TABLE `successor_invitations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target_id` int NOT NULL,
  `target_type` varchar(40) NOT NULL,
  `inviter_id` int NOT NULL,
  `invitee_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `declined_at` datetime DEFAULT NULL,
  `canceled_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_successor_invitations_on_target` (`target_id`,`target_type`),
  KEY `index_successor_invitations_on_inviter_id` (`inviter_id`),
  KEY `index_successor_invitations_on_invitee_id` (`invitee_id`),
  KEY `index_successor_invitations_on_accepted_at` (`accepted_at`),
  KEY `index_successor_invitations_on_declined_at` (`declined_at`),
  KEY `index_successor_invitations_on_canceled_at` (`canceled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `team_member_delegated_review_requests`;
CREATE TABLE `team_member_delegated_review_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `member_id` int NOT NULL,
  `delegated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_team_member_delegated_review_requests_on_team_member` (`team_id`,`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `trade_compliance_key_values`;
CREATE TABLE `trade_compliance_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_trade_compliance_key_values_on_key` (`key`),
  KEY `index_trade_compliance_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `trade_controls_restrictions`;
CREATE TABLE `trade_controls_restrictions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` enum('unrestricted','partial','full','review','tier_0','tier_1') NOT NULL DEFAULT 'unrestricted',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `trade_restricted_country_code` varchar(32) COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'restricted country and/or region where the violation occurred',
  `restricted_on_creation` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'whether or not the account was restricted on creation due to being in a restricted country/region',
  `enforcement_reason` tinyint unsigned DEFAULT NULL COMMENT 'enum for the compliance violated',
  `last_enforcement_date` datetime(6) DEFAULT NULL COMMENT 'when the last enforcement occurred',
  `last_override_date` datetime(6) DEFAULT NULL COMMENT 'when the last override occurred',
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_trade_controls_restrictions_on_user_id` (`user_id`),
  KEY `index_trade_controls_restrictions_on_type` (`type`),
  KEY `index_on_trade_restricted_country_code` (`trade_restricted_country_code`),
  KEY `index_trade_controls_restrictions_on_enforcement_reason` (`enforcement_reason`),
  KEY `index_trade_controls_restrictions_on_last_enforcement_date` (`last_enforcement_date`),
  KEY `index_trade_controls_restrictions_on_last_override_date` (`last_override_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `two_factor_recovery_requests`;
CREATE TABLE `two_factor_recovery_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `otp_verified` tinyint(1) NOT NULL DEFAULT '0',
  `oauth_access_id` bigint DEFAULT NULL,
  `authenticated_device_id` bigint DEFAULT NULL,
  `public_key_id` bigint DEFAULT NULL,
  `request_completed_at` datetime DEFAULT NULL,
  `reviewer_id` bigint DEFAULT NULL,
  `review_completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `requesting_device_id` bigint DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `declined_at` datetime DEFAULT NULL,
  `staff_review_requested_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_two_factor_recovery_requests_on_user_id_and_created_at` (`user_id`,`created_at`),
  KEY `index_two_factor_recovery_requests_on_user_id_requesting_device` (`user_id`,`requesting_device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `user_dashboard_pins`;
CREATE TABLE `user_dashboard_pins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pinned_item_id` int NOT NULL,
  `pinned_item_type` int NOT NULL,
  `position` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_dashboard_pins_unique` (`user_id`,`pinned_item_type`,`pinned_item_id`),
  KEY `index_user_dashboard_pins_on_user_id_and_position` (`user_id`,`position`),
  KEY `index_user_dashboard_pins_on_pinned_item_id_and_pinned_item_type` (`pinned_item_id`,`pinned_item_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `user_dashboards`;
CREATE TABLE `user_dashboards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_dashboards_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `user_labels`;
CREATE TABLE `user_labels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varbinary(1024) NOT NULL,
  `lowercase_name` varbinary(1024) NOT NULL,
  `description` varbinary(400) DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_user_labels_on_name` (`name`),
  KEY `index_user_labels_on_user_id_and_name` (`user_id`,`name`),
  KEY `index_user_labels_on_user_id_and_lowercase_name` (`user_id`,`lowercase_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `user_list_items`;
CREATE TABLE `user_list_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `user_list_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_rli_on_list_id_and_repo_id` (`user_list_id`,`repository_id`),
  KEY `index_user_list_items_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `user_lists`;
CREATE TABLE `user_lists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `slug` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `description` varchar(400) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `private` tinyint(1) NOT NULL DEFAULT '0',
  `item_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `last_added_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_lists_on_user_id_and_slug` (`user_id`,`slug`),
  KEY `index_user_lists_on_user_id_and_last_added_at` (`user_id`,`last_added_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `user_personal_profiles`;
CREATE TABLE `user_personal_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(64) DEFAULT NULL,
  `last_name` varchar(64) DEFAULT NULL,
  `middle_name` varchar(64) DEFAULT NULL,
  `region` varchar(64) DEFAULT NULL,
  `city` varchar(64) NOT NULL,
  `country_code` varchar(3) NOT NULL,
  `postal_code` varchar(32) DEFAULT NULL,
  `address1` varchar(128) NOT NULL,
  `address2` varchar(128) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `msft_trade_screening_status` tinyint NOT NULL DEFAULT '0',
  `last_trade_screen_date` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `external_uuid` varchar(36) DEFAULT NULL,
  `overdue_email` tinyint NOT NULL DEFAULT '0',
  `owner_id` bigint unsigned DEFAULT NULL,
  `owner_type` varchar(30) NOT NULL DEFAULT 'User',
  `entity_name` varchar(800) DEFAULT NULL,
  `vat_code` varchar(50) DEFAULT NULL,
  `billing_address_validated_at` datetime(6) DEFAULT NULL,
  `billing_trade_screening_status` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_personal_profiles_on_external_uuid` (`external_uuid`),
  UNIQUE KEY `index_user_personal_profiles_on_owner_id_and_owner_type` (`owner_id`,`owner_type`),
  KEY `index_on_msft_trade_screening_status` (`msft_trade_screening_status`),
  KEY `index_user_personal_profiles_on_overdue_email` (`overdue_email`),
  KEY `index_user_personal_profiles_on_last_trade_screen_date` (`last_trade_screen_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `user_reviewed_files`;
CREATE TABLE `user_reviewed_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `filepath` varbinary(1024) NOT NULL,
  `head_sha` varbinary(40) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `dismissed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reviewed_files_on_pull_user_and_filepath` (`pull_request_id`,`user_id`,`filepath`),
  KEY `index_reviewed_files_on_user_pull_and_dismissed` (`user_id`,`pull_request_id`,`dismissed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `user_seen_features`;
CREATE TABLE `user_seen_features` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `feature_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_seen_features_on_user_id_and_feature_id` (`user_id`,`feature_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `webauthn_user_handles`;
CREATE TABLE `webauthn_user_handles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `webauthn_user_handle` binary(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_webauthn_user_handles_on_user_id` (`user_id`),
  KEY `index_webauthn_user_handles_on_handle_and_user_id` (`webauthn_user_handle`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `weekly_commit_contribution_summaries`;
CREATE TABLE `weekly_commit_contribution_summaries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `year` smallint unsigned NOT NULL,
  `total_count` bigint unsigned NOT NULL,
  `counts` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_user_id_repository_id_year_430625bbb7` (`user_id`,`repository_id`,`year`),
  KEY `index_weekly_commit_contribution_summaries_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `workspace_plans`;
CREATE TABLE `workspace_plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(90) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `vscs_target` varchar(21) DEFAULT NULL,
  `resource_provider` varchar(50) DEFAULT 'Microsoft.Codespaces',
  `location` varchar(40) NOT NULL DEFAULT '',
  `business_id` bigint unsigned DEFAULT NULL,
  `subscription` varchar(36) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_workspace_plans_on_name` (`name`),
  KEY `index_workspace_plans_on_business_location_target` (`business_id`,`location`,`vscs_target`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `workspaces`;
CREATE TABLE `workspaces` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned DEFAULT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `guid` char(36) DEFAULT NULL,
  `name` varchar(90) NOT NULL,
  `oid` char(40) NOT NULL,
  `ref` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `plan_id` bigint unsigned DEFAULT NULL,
  `location` varchar(40) NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `last_export_start_at` datetime DEFAULT NULL,
  `last_export_end_at` datetime DEFAULT NULL,
  `sku_name` int DEFAULT NULL,
  `vscs_target_url` text,
  `environment_data` json DEFAULT NULL,
  `environment_data_updated_at` datetime(6) DEFAULT NULL,
  `vscs_target` varchar(21) DEFAULT NULL,
  `billable_owner_type` varchar(30) DEFAULT NULL,
  `billable_owner_id` bigint unsigned DEFAULT NULL,
  `display_name` varchar(48) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `devcontainer_path` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `has_uncommitted_changes` tinyint(1) GENERATED ALWAYS AS (coalesce((json_unquote(json_extract(`environment_data`,_utf8mb4'$.gitStatus.hasUncommittedChanges')) = _utf8mb4'true'),false)) VIRTUAL NOT NULL,
  `has_unpushed_changes` tinyint(1) GENERATED ALWAYS AS (coalesce((json_unquote(json_extract(`environment_data`,_utf8mb4'$.gitStatus.hasUnpushedChanges')) = _utf8mb4'true'),false)) VIRTUAL NOT NULL,
  `retention_period_minutes` mediumint unsigned DEFAULT NULL,
  `restored_at` datetime(6) DEFAULT NULL,
  `restore_count` tinyint unsigned DEFAULT '0',
  `deletion_reason` varchar(30) DEFAULT NULL,
  `shutdown_at` datetime(6) DEFAULT NULL,
  `is_deleted` tinyint(1) GENERATED ALWAYS AS ((`deleted_at` is not null)) VIRTUAL NOT NULL,
  `template_repository_id` bigint unsigned DEFAULT NULL,
  `keep` tinyint(1) NOT NULL DEFAULT '0',
  `retention_expires_at` datetime(6) GENERATED ALWAYS AS (if(((`keep` = false) and (`shutdown_at` is not null) and (`retention_period_minutes` is not null)),(`shutdown_at` + interval `retention_period_minutes` minute),NULL)) VIRTUAL,
  `copilot_workspace_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_workspaces_on_owner_id_and_name` (`owner_id`,`name`),
  UNIQUE KEY `index_workspaces_on_name` (`name`),
  UNIQUE KEY `index_workspaces_on_repository_id_and_owner_id_and_name` (`repository_id`,`owner_id`,`name`),
  UNIQUE KEY `index_workspaces_on_guid_and_owner_id` (`guid`,`owner_id`),
  KEY `index_workspaces_on_billable_owner` (`billable_owner_type`,`billable_owner_id`),
  KEY `index_workspaces_on_owner_id_and_billable_owner_id` (`owner_id`,`billable_owner_id`),
  KEY `index_workspaces_deleted_at_last_used_at` (`deleted_at`,`last_used_at`,`has_uncommitted_changes`,`has_unpushed_changes`),
  KEY `index_workspaces_on_retention_expires_at` (`retention_expires_at`),
  KEY `index_workspaces_owner_id_is_deleted_id_repository_id` (`owner_id`,`is_deleted`,`id`,`repository_id`),
  KEY `index_workspaces_on_billable_owner_id_and_is_deleted` (`billable_owner_id`,`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
