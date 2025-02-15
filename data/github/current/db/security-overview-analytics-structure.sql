DROP TABLE IF EXISTS `security_center_key_values`;
CREATE TABLE `security_center_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_security_center_key_values_on_key` (`key`),
  KEY `index_security_center_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `soa_code_scanning_alert_revisions`;
CREATE TABLE `soa_code_scanning_alert_revisions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `date_id` int unsigned NOT NULL,
  `next_revision_date_id` int unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `alert_number` bigint unsigned NOT NULL,
  `alert_id` bigint unsigned NOT NULL DEFAULT '0',
  `alert_resolved` tinyint(1) NOT NULL,
  `alert_resolution` tinyint unsigned DEFAULT NULL,
  `alert_severity` varchar(12) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `tool` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `rule_sarif_identifier` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `language` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `ref` varbinary(1024) DEFAULT NULL,
  `alert_created_at` datetime(3) NOT NULL,
  `alert_updated_at` datetime(3) NOT NULL,
  `alert_resolved_at` datetime(3) DEFAULT NULL,
  `alert_reopened_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `slice4` tinyint GENERATED ALWAYS AS ((floor(`updated_at`) % 4)) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_soa_code_scanning_alert_revs_on_repo_alert_date` (`repository_id`,`alert_number`,`date_id`),
  UNIQUE KEY `idx_soa_code_scanning_alert_revs_on_repo_alert_next_date` (`repository_id`,`alert_number`,`next_revision_date_id`),
  KEY `index_soa_code_scanning_alert_revs_on_repo_dates` (`repository_id`,`next_revision_date_id`,`date_id`),
  KEY `index_soa_code_scanning_alert_revs_on_dashboard_dates_coverage` (`repository_id`,`alert_resolved`,`alert_resolution`,`tool`,`alert_severity`,`date_id`,`next_revision_date_id`,`alert_created_at`,`alert_resolved_at`,`alert_reopened_at`),
  KEY `idx_soa_code_scanning_alert_revs_on_repo_alert_id_date` (`repository_id`,`alert_id`,`date_id`),
  KEY `idx_soa_code_scanning_alert_revs_on_repo_next_date_severity_tool` (`repository_id`,`next_revision_date_id`,`alert_severity`,`tool`),
  KEY `index_soa_slice4_cs_alert_revs_on_dashboard_dates_coverage` (`slice4`,`repository_id`,`alert_resolved`,`alert_resolution`,`tool`,`alert_severity`,`date_id`,`next_revision_date_id`,`alert_created_at`,`alert_resolved_at`,`alert_reopened_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `soa_code_scanning_pull_request_alerts`;
CREATE TABLE `soa_code_scanning_pull_request_alerts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `date_id` int unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `alert_number` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `analysis_id` bigint unsigned NOT NULL,
  `alert_created_at` datetime(3) NOT NULL COMMENT 'The create_at timestamp of the alert when it was firstly introduced by an analysis.',
  `alert_updated_at` datetime(3) NOT NULL COMMENT 'The latest updated_at timestamp of the alert when the pull request merged.',
  `alert_resolved_at` datetime(3) DEFAULT NULL COMMENT 'The fixed_at or resolved_at timestamp of the alert when the pull request merged.',
  `alert_resolved` tinyint(1) NOT NULL COMMENT 'The resolved state of the alert when the pull request merged.',
  `alert_resolution` tinyint unsigned DEFAULT NULL COMMENT 'The resolution of the alert when the pull request merged.',
  `alert_severity` varchar(12) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `ref` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `tool` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `rule_sarif_identifier` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `has_dfa` tinyint(1) DEFAULT NULL COMMENT 'True if the alert had corresponding developer friendly alert in pull request.',
  `has_dfa_comments` tinyint(1) DEFAULT NULL COMMENT 'True if there was any user made comment to the alert''s DFA.',
  `has_autofix` tinyint(1) DEFAULT NULL COMMENT 'True if the alert had corresponding autofix suggestion in pull request.',
  `autofix_accepted` tinyint(1) DEFAULT NULL COMMENT 'True if the alert was resolved by accepting the autofix suggestion.',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_soa_code_scanning_pr_alert` (`repository_id`,`pull_request_id`,`alert_number`),
  KEY `idx_soa_code_scanning_pr_alert_revision` (`repository_id`,`date_id`,`alert_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `soa_dates`;
CREATE TABLE `soa_dates` (
  `id` int unsigned NOT NULL,
  `date_value` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `soa_dependabot_alert_revisions`;
CREATE TABLE `soa_dependabot_alert_revisions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `date_id` int unsigned NOT NULL,
  `next_revision_date_id` int unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `alert_number` bigint unsigned NOT NULL,
  `alert_resolved` tinyint(1) NOT NULL,
  `alert_resolution` tinyint unsigned DEFAULT NULL,
  `alert_severity` varchar(12) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `ghsa_id` varchar(19) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `package_name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `ecosystem` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `alert_created_at` datetime(3) NOT NULL,
  `alert_updated_at` datetime(3) NOT NULL,
  `alert_resolved_at` datetime(3) DEFAULT NULL,
  `alert_reopened_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `dependency_scope` varchar(22) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `slice4` tinyint GENERATED ALWAYS AS ((floor(`updated_at`) % 4)) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_soa_dependabot_alert_revs_on_repo_alert_date` (`repository_id`,`alert_number`,`date_id`),
  UNIQUE KEY `index_soa_dependabot_alert_revs_on_repo_alert_ndate` (`repository_id`,`alert_number`,`next_revision_date_id`),
  KEY `index_soa_dependabot_alert_revs_on_repo_dates` (`repository_id`,`next_revision_date_id`,`date_id`),
  KEY `index_soa_dependabot_alert_revs_on_dashboard_dates_coverage` (`repository_id`,`alert_resolved`,`alert_resolution`,`alert_severity`,`date_id`,`next_revision_date_id`,`alert_created_at`,`alert_resolved_at`,`alert_reopened_at`),
  KEY `index_soa_slice4_da_revs_on_dashboard_dates_coverage` (`slice4`,`repository_id`,`alert_resolved`,`alert_resolution`,`alert_severity`,`date_id`,`next_revision_date_id`,`alert_created_at`,`alert_resolved_at`,`alert_reopened_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `soa_feature_status_revisions`;
CREATE TABLE `soa_feature_status_revisions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `date_id` int unsigned NOT NULL,
  `next_revision_date_id` int unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `dependabot_alerts_enabled` tinyint(1) NOT NULL,
  `dependabot_security_updates_enabled` tinyint(1) DEFAULT NULL,
  `advanced_security_enabled` tinyint(1) NOT NULL,
  `code_scanning_enabled` tinyint(1) NOT NULL,
  `code_scanning_pr_alerts_enabled` tinyint(1) DEFAULT NULL,
  `secret_scanning_enabled` tinyint(1) NOT NULL,
  `secret_scanning_push_protection_enabled` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_soa_feature_statuses_on_repo_date` (`repository_id`,`date_id`),
  UNIQUE KEY `index_soa_feature_statuses_on_repo_next_date` (`repository_id`,`next_revision_date_id`),
  KEY `index_soa_feature_statuses_on_repo_dates` (`repository_id`,`next_revision_date_id`,`date_id`),
  KEY `index_soa_feature_statuses_ss_on_repo_next_date` (`repository_id`,`secret_scanning_enabled`,`next_revision_date_id`),
  KEY `index_soa_feature_statuses_cs_on_repo_next_date` (`repository_id`,`code_scanning_enabled`,`next_revision_date_id`),
  KEY `index_soa_feature_statuses_da_on_repo_next_date` (`repository_id`,`dependabot_alerts_enabled`,`next_revision_date_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `soa_repositories`;
CREATE TABLE `soa_repositories` (
  `repository_id` bigint unsigned NOT NULL,
  `organization_id` bigint unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `archived` tinyint(1) NOT NULL,
  `event_time` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `visibility` tinyint unsigned NOT NULL,
  `owner_id` bigint unsigned NOT NULL DEFAULT '0',
  `owner_type` enum('USER','ORGANIZATION') COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'ORGANIZATION',
  `business_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`repository_id`),
  UNIQUE KEY `index_soa_repositories_on_org_repo` (`organization_id`,`repository_id`),
  KEY `index_soa_repositories_on_org_archived_name` (`organization_id`,`archived`,`name`),
  KEY `index_soa_repositories_on_org_archived_visibility_name` (`organization_id`,`archived`,`visibility`,`name`),
  KEY `index_soa_repositories_on_business_owner_type_archived_name` (`business_id`,`owner_id`,`owner_type`,`archived`,`name`),
  KEY `index_soa_repositories_on_business_owner_type_arch_vis_name` (`business_id`,`owner_id`,`owner_type`,`archived`,`visibility`,`name`),
  KEY `index_soa_repositories_on_owner_repo` (`owner_id`,`owner_type`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `soa_secret_scanning_alert_revisions`;
CREATE TABLE `soa_secret_scanning_alert_revisions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `date_id` int unsigned NOT NULL,
  `next_revision_date_id` int unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `alert_number` bigint unsigned NOT NULL,
  `alert_type` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `alert_type_provider` varchar(256) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `alert_type_slug` varchar(256) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `alert_bypassed` tinyint(1) NOT NULL DEFAULT '0',
  `alert_validity` tinyint unsigned NOT NULL DEFAULT '0',
  `alert_resolved` tinyint(1) NOT NULL,
  `alert_resolution` tinyint unsigned DEFAULT NULL,
  `alert_created_at` datetime(3) NOT NULL,
  `alert_updated_at` datetime(3) NOT NULL,
  `alert_resolved_at` datetime(3) DEFAULT NULL,
  `alert_reopened_at` datetime(3) DEFAULT NULL,
  `alert_validity_updated_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `slice4` tinyint GENERATED ALWAYS AS ((floor(`updated_at`) % 4)) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_soa_secret_scanning_alert_revs_on_repo_alert_date` (`repository_id`,`alert_number`,`date_id`),
  UNIQUE KEY `index_soa_secret_scanning_alert_revs_on_repo_alert_ndate` (`repository_id`,`alert_number`,`next_revision_date_id`),
  KEY `index_soa_secret_scanning_alert_revs_on_repo_dates` (`repository_id`,`next_revision_date_id`,`date_id`),
  KEY `index_soa_secret_scanning_alert_revs_on_dashboard_dates_coverage` (`repository_id`,`alert_resolved`,`alert_resolution`,`date_id`,`next_revision_date_id`,`alert_created_at`,`alert_resolved_at`,`alert_reopened_at`),
  KEY `index_soa_slice4_ss_alert_revs_on_dashboard_dates_coverage` (`slice4`,`repository_id`,`alert_resolved`,`alert_resolution`,`date_id`,`next_revision_date_id`,`alert_created_at`,`alert_resolved_at`,`alert_reopened_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
