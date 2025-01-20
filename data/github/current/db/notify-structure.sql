DROP TABLE IF EXISTS `code_scanning_org_configurations`;
CREATE TABLE `code_scanning_org_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint NOT NULL,
  `codeql_packs` text COLLATE utf8mb4_unicode_520_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_code_scanning_org_configurations_on_organization_id` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `cve_epss`;
CREATE TABLE `cve_epss` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cve_id` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `percentage` decimal(10,9) NOT NULL,
  `percentile` decimal(10,9) NOT NULL,
  `calculation_date` date NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_cve_epss_on_cve_id` (`cve_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `cwe_references`;
CREATE TABLE `cwe_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_type` varchar(40) NOT NULL,
  `source_id` bigint unsigned NOT NULL,
  `cwe_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_source_and_cwe` (`source_type`,`source_id`,`cwe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `cwes`;
CREATE TABLE `cwes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cwe_id` varchar(9) NOT NULL,
  `name` varbinary(1024) NOT NULL,
  `description` mediumblob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_cwes_on_cwe_id` (`cwe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `private_registry_configurations`;
CREATE TABLE `private_registry_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_type` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `registry_type` tinyint unsigned NOT NULL,
  `url` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `secret_name` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_private_registry_configurations_on_owner_id_and_type` (`owner_id`,`owner_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `reachability_analyses`;
CREATE TABLE `reachability_analyses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `workflow_run_id` bigint unsigned DEFAULT NULL,
  `sha` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` tinyint unsigned DEFAULT '0',
  `missing_data` tinyint(1) NOT NULL DEFAULT '0',
  `enqueued_at` datetime(6) DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `last_status_update_at` datetime(6) DEFAULT NULL,
  `dependabot_notified_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_reachability_analyses_on_repository_id_sha` (`repository_id`,`sha`),
  KEY `index_reachability_analyses_on_repository_id_state` (`repository_id`,`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `reachability_analysis_status_updates`;
CREATE TABLE `reachability_analysis_status_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reachability_analysis_id` bigint unsigned NOT NULL,
  `status` tinyint unsigned DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_on_reachability_analysis_id_d0cb9bc15f` (`reachability_analysis_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_dependency_updates`;
CREATE TABLE `repository_dependency_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `repository_vulnerability_alert_id` bigint unsigned DEFAULT NULL,
  `state` int NOT NULL DEFAULT '0',
  `reason` int NOT NULL DEFAULT '0',
  `trigger_type` int NOT NULL DEFAULT '0',
  `manifest_path` varbinary(1024) NOT NULL,
  `package_name` varchar(255) NOT NULL,
  `body` mediumblob,
  `error_body` mediumblob,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `error_title` varbinary(1024) DEFAULT NULL,
  `dry_run` tinyint(1) NOT NULL DEFAULT '0',
  `error_type` varchar(60) DEFAULT NULL,
  `retry` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_pull_request_dependency_updates_on_repo_dep_and_state` (`repository_id`,`manifest_path`,`package_name`,`state`),
  KEY `index_repository_dependency_updates_on_pull_request_id` (`pull_request_id`),
  KEY `index_repository_dependency_updates_on_rva_id` (`repository_vulnerability_alert_id`),
  KEY `index_repository_dependency_updates_on_state_and_created_at` (`state`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_security_center_configs`;
CREATE TABLE `repository_security_center_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `visibility` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  `ghas_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `last_push` datetime(6) DEFAULT NULL,
  `owner_id` bigint unsigned NOT NULL DEFAULT '0',
  `owner_type` enum('USER','ORGANIZATION') NOT NULL DEFAULT 'ORGANIZATION',
  `business_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_security_center_configs_on_repository_id` (`repository_id`),
  KEY `index_repo_and_last_push` (`repository_id`,`last_push`),
  KEY `index_repository_security_center_configs_owner_id_name` (`owner_id`,`name`,`repository_id`),
  KEY `index_repository_security_center_configs_owner_id_visibility` (`owner_id`,`visibility`,`repository_id`),
  KEY `index_on_owner_id_and_archived_and_repository_id` (`owner_id`,`archived`,`repository_id`),
  KEY `index_repository_security_center_configs_on_owner_repo` (`owner_id`,`repository_id`),
  KEY `index_repo_security_center_configs_owner_id_last_push_repo_id` (`owner_id`,`last_push`,`repository_id`),
  KEY `idx_repo_security_center_configs_business_id_owner_id_then_type` (`business_id`,`archived`,`owner_id`,`owner_type`,`repository_id`),
  KEY `idx_repo_security_center_configs_business_id_owner_type_then_id` (`business_id`,`archived`,`owner_type`,`owner_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_security_center_statuses`;
CREATE TABLE `repository_security_center_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `feature_type` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `scanning_status` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `scanning_count` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `scanned_at` datetime(6) DEFAULT NULL,
  `owner_id` bigint unsigned NOT NULL DEFAULT '0',
  `business_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_repo_and_feature` (`repository_id`,`feature_type`),
  KEY `index_on_owner_id_feature_type_repository_id` (`owner_id`,`feature_type`,`repository_id`),
  KEY `index_owner_id_feature_scanning_status_repo_id` (`owner_id`,`feature_type`,`scanning_status`,`repository_id`),
  KEY `index_owner_id_repo_id_feature_type_scanning_status` (`owner_id`,`repository_id`,`feature_type`,`scanning_status`),
  KEY `index_owner_id_feature_scanning_status_scanning_count_repo_id` (`owner_id`,`feature_type`,`scanning_status`,`scanning_count`,`repository_id`),
  KEY `index_business_id_feature_scanning_status_scanning_count_repo_id` (`business_id`,`feature_type`,`scanning_status`,`scanning_count`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_security_configurations`;
CREATE TABLE `repository_security_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `security_configuration_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `state` int unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `organization_id` bigint unsigned NOT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_520_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_security_configurations_repository_id` (`repository_id`),
  KEY `index_repository_security_configs_security_config_id_and_state` (`security_configuration_id`,`state`),
  KEY `index_repository_security_configs_on_organization_id_and_state` (`organization_id`,`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_vulnerability_alert_configs`;
CREATE TABLE `repository_vulnerability_alert_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `auto_dismiss_ruleset` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_vulnerability_alert_configs_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_vulnerability_alert_events`;
CREATE TABLE `repository_vulnerability_alert_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_vulnerability_alert_id` bigint unsigned DEFAULT NULL,
  `event` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `reason` varchar(40) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `push_id` bigint unsigned DEFAULT NULL,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_comment` varchar(280) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `rule_name` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `rule_conditions` json DEFAULT NULL,
  `rule_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_rva_events_on_alert_and_event` (`repository_vulnerability_alert_id`,`event`),
  KEY `index_rva_events_on_pull_and_event_and_alert` (`pull_request_id`,`event`,`repository_vulnerability_alert_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_vulnerability_alert_sequences`;
CREATE TABLE `repository_vulnerability_alert_sequences` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `number` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_vulnerability_alert_sequences_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_vulnerability_alerts`;
CREATE TABLE `repository_vulnerability_alerts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vulnerability_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `vulnerable_version_range_id` bigint unsigned NOT NULL,
  `vulnerable_manifest_path` varbinary(1024) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `vulnerable_requirements` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `state` tinyint unsigned NOT NULL DEFAULT '0',
  `number` int unsigned DEFAULT NULL,
  `vulnerability_alerting_event_id` bigint unsigned DEFAULT NULL,
  `create_push_id` bigint unsigned DEFAULT NULL,
  `create_pull_request_id` bigint unsigned DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `last_state_change_at` datetime(6) NOT NULL,
  `last_state_change_reason` varchar(40) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `last_state_change_actor_id` bigint unsigned DEFAULT NULL,
  `last_state_change_push_id` bigint unsigned DEFAULT NULL,
  `last_state_change_pull_request_id` bigint unsigned DEFAULT NULL,
  `dependency_scope` varchar(22) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `last_state_change_comment` varchar(280) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `state_auto_changeable` tinyint(1) NOT NULL DEFAULT '1',
  `vulnerable_function_reference_count` int unsigned DEFAULT '0',
  `last_state_change_rule_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_vulnerability_alerts_unique` (`vulnerability_id`,`vulnerable_version_range_id`,`vulnerable_manifest_path`,`repository_id`),
  UNIQUE KEY `index_rvas_on_repository_id_and_number` (`repository_id`,`number`),
  KEY `index_repository_vulnerability_alerts_on_repository_id_and_state` (`repository_id`,`state`),
  KEY `index_rvas_on_active_and_repo` (`active`,`repository_id`),
  KEY `index_rvas_on_vuln_and_active` (`vulnerability_id`,`active`),
  KEY `index_rvas_on_range_and_active` (`vulnerable_version_range_id`,`active`),
  KEY `index_rvas_on_version_range_and_repo_id` (`vulnerable_version_range_id`,`repository_id`),
  KEY `index_rvas_on_last_state_change_rule_id` (`last_state_change_rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_vulnerability_exposure_updates`;
CREATE TABLE `repository_vulnerability_exposure_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `commit_oid` char(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_rveu_on_repo_and_commit` (`repository_id`,`commit_oid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_vulnerable_function_references`;
CREATE TABLE `repository_vulnerable_function_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `repository_vulnerability_exposure_update_id` bigint unsigned NOT NULL,
  `vulnerable_version_range_id` bigint unsigned NOT NULL,
  `repository_vulnerability_alert_id` bigint unsigned NOT NULL,
  `function_name` varbinary(1024) NOT NULL,
  `commit_oid` char(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `filename` varbinary(1024) NOT NULL,
  `start_line` int unsigned NOT NULL,
  `start_column` int unsigned NOT NULL,
  `end_line` int unsigned NOT NULL,
  `end_column` int unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_rvfr_on_repo` (`repository_id`),
  KEY `index_rvfr_on_update_and_file` (`repository_vulnerability_exposure_update_id`,`filename`),
  KEY `index_rvfr_on_update_and_alert_and_file` (`repository_vulnerability_exposure_update_id`,`repository_vulnerability_alert_id`,`filename`),
  KEY `index_rvfr_on_range_and_repo` (`vulnerable_version_range_id`,`repository_id`),
  KEY `index_rvfr_on_rva_id` (`repository_vulnerability_alert_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `scoped_vulnerabilities`;
CREATE TABLE `scoped_vulnerabilities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status` varchar(12) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `severity` varchar(12) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `classification` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `description` mediumblob,
  `published_at` datetime DEFAULT NULL,
  `withdrawn_at` datetime DEFAULT NULL,
  `simulation` tinyint(1) NOT NULL DEFAULT '0',
  `ghsa_id` varchar(19) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `cve_id` varchar(20) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `white_source_id` varchar(20) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `summary` varbinary(1024) DEFAULT NULL,
  `npm_id` bigint unsigned DEFAULT NULL,
  `cvss_v3` varbinary(255) DEFAULT NULL,
  `source_code_location` varbinary(1024) DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `nvd_published_at` datetime(6) DEFAULT NULL,
  `scope` varchar(20) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `security_advisory_id` bigint unsigned NOT NULL DEFAULT '0',
  `advisory_repository_id` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `cvss_v4` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_scoped_vulnerabilities_on_ghsa_id` (`ghsa_id`),
  KEY `index_scoped_vulnerabilities_on_published_at` (`published_at`),
  KEY `index_scoped_vulnerabilities_on_updated_at` (`updated_at`),
  KEY `index_scoped_vulnerabilities_on_cve_id` (`cve_id`),
  KEY `index_scoped_vulnerabilities_on_security_advisory_id` (`security_advisory_id`),
  KEY `idx_on_scope_advisory_repository_id_d56cbde294` (`scope`,`advisory_repository_id`),
  KEY `index_scoped_vulns_on_status_and_simulation_and_updated_at` (`status`,`simulation`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `security_campaign_alerts`;
CREATE TABLE `security_campaign_alerts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `security_campaign_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `logical_alert_number` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sc_alerts_on_sc_id_and_repo_id_and_logical_alert_number` (`security_campaign_id`,`repository_id`,`logical_alert_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `security_campaign_repositories`;
CREATE TABLE `security_campaign_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `security_campaign_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sc_repos_on_sc_id_and_repo_id` (`security_campaign_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `security_campaigns`;
CREATE TABLE `security_campaigns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `ends_at` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `number` int NOT NULL,
  `manager_id` bigint unsigned DEFAULT NULL,
  `closed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_security_campaigns_on_organization_id_and_number` (`organization_id`,`number`),
  KEY `index_security_campaigns_on_closed_at` (`closed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `security_center_alert_severities`;
CREATE TABLE `security_center_alert_severities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `feature_type` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `severity` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `alert_count` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_repo_feature_severity_alert_count` (`repository_id`,`feature_type`,`severity`,`alert_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `security_configuration_defaults`;
CREATE TABLE `security_configuration_defaults` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `security_configuration_id` bigint unsigned NOT NULL,
  `default_for_new_public_repos` tinyint(1) NOT NULL DEFAULT '0',
  `default_for_new_private_repos` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_security_config_defaults_target_and_security_config_id` (`target_id`,`target_type`,`security_configuration_id`),
  UNIQUE KEY `index_security_config_defaults_for_new_public_repos` (`target_id`,`target_type`,`default_for_new_public_repos`),
  UNIQUE KEY `index_security_config_defaults_for_new_private_repos` (`target_id`,`target_type`,`default_for_new_private_repos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `security_configuration_policies`;
CREATE TABLE `security_configuration_policies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `security_configuration_id` bigint unsigned NOT NULL,
  `enforcement` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_security_config_policies_config_id_and_target_unique` (`security_configuration_id`,`target_id`,`target_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `security_configurations`;
CREATE TABLE `security_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `enable_ghas` tinyint(1) NOT NULL,
  `private_vulnerability_reporting` int unsigned NOT NULL,
  `dependency_graph` int unsigned NOT NULL,
  `dependabot_alerts` int unsigned NOT NULL,
  `dependabot_security_updates` int unsigned NOT NULL,
  `code_scanning` int unsigned NOT NULL,
  `secret_scanning` int unsigned NOT NULL,
  `secret_scanning_push_protection` int unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `secret_scanning_validity_checks` int unsigned DEFAULT NULL,
  `secret_scanning_non_provider_patterns` int unsigned DEFAULT NULL,
  `dependency_graph_autosubmit_action` int unsigned NOT NULL,
  `dependency_graph_autosubmit_action_options` json DEFAULT NULL,
  `secret_scanning_delegated_bypass` int unsigned DEFAULT NULL,
  `secret_scanning_push_protection_custom_message` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_security_configurations_target_id_and_target_type` (`target_id`,`target_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `security_products_enablement_key_values`;
CREATE TABLE `security_products_enablement_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_security_products_enablement_key_values_on_key` (`key`),
  KEY `index_security_products_enablement_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `team_group_mappings`;
CREATE TABLE `team_group_mappings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `team_id` int NOT NULL,
  `group_id` varchar(40) NOT NULL,
  `group_name` varbinary(400) NOT NULL,
  `group_description` varbinary(2048) DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `synced_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_team_group_mappings_on_team_id_and_group_id` (`team_id`,`group_id`),
  KEY `index_team_group_mappings_on_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `team_sync_business_tenants`;
CREATE TABLE `team_sync_business_tenants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `business_id` bigint unsigned NOT NULL,
  `provider_type` int NOT NULL,
  `provider_id` varchar(100) NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `setup_url_template` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `url` text,
  `encrypted_ssws_token` varbinary(2048) DEFAULT NULL,
  `forbid_organization_invites` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_team_sync_business_tenants_on_business_id` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `team_sync_tenants`;
CREATE TABLE `team_sync_tenants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned NOT NULL,
  `provider_type` int NOT NULL,
  `provider_id` varchar(100) NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `url` text,
  `encrypted_ssws_token` varbinary(2048) DEFAULT NULL,
  `forbid_organization_invites` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_team_sync_tenants_on_organization_id` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `vulnerabilities`;
CREATE TABLE `vulnerabilities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status` varchar(12) NOT NULL,
  `severity` varchar(12) DEFAULT NULL,
  `classification` varchar(255) DEFAULT NULL,
  `description` mediumblob,
  `published_at` datetime DEFAULT NULL,
  `withdrawn_at` datetime DEFAULT NULL,
  `simulation` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ghsa_id` varchar(19) NOT NULL,
  `cve_id` varchar(20) DEFAULT NULL,
  `white_source_id` varchar(20) DEFAULT NULL,
  `summary` varbinary(1024) DEFAULT NULL,
  `npm_id` bigint unsigned DEFAULT NULL,
  `cvss_v3` varbinary(255) DEFAULT NULL,
  `source_code_location` varbinary(1024) DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `nvd_published_at` datetime(6) DEFAULT NULL,
  `cvss_v4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_vulnerabilities_on_ghsa_id` (`ghsa_id`),
  UNIQUE KEY `index_vulnerabilities_on_npm_id` (`npm_id`),
  KEY `index_vulnerabilities_on_severity` (`severity`),
  KEY `index_vulnerabilities_on_published_at` (`published_at`),
  KEY `index_vulnerabilities_on_updated_at` (`updated_at`),
  KEY `index_vulnerabilities_on_simulation` (`simulation`),
  KEY `index_vulnerabilities_on_cve_id` (`cve_id`),
  KEY `index_vulnerabilities_on_white_source_id` (`white_source_id`),
  KEY `index_on_status_and_simulation_and_updated_at` (`status`,`simulation`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `vulnerability_alert_rule_overrides`;
CREATE TABLE `vulnerability_alert_rule_overrides` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `rule_id` bigint unsigned NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `enforcement` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_vulnerability_alert_rule_overrides_on_target_and_rule` (`target_id`,`target_type`,`rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `vulnerability_alert_rules`;
CREATE TABLE `vulnerability_alert_rules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `conditions` json NOT NULL,
  `enablement_behavior` enum('disabled_by_default','enabled_by_default','force_enabled','enabled_by_default_for_public','force_disabled') COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `actions` json NOT NULL,
  `state` tinyint unsigned NOT NULL DEFAULT '0',
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_vulnerability_alert_rules_on_target_and_state_and_name` (`target_id`,`target_type`,`state`,`name`,`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `vulnerability_alerting_event_subscriptions`;
CREATE TABLE `vulnerability_alerting_event_subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vulnerability_alerting_event_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `repository_vulnerability_alert_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_and_repo_vuln_alert` (`user_id`,`repository_vulnerability_alert_id`),
  KEY `index_vae_user_and_repo_vuln_alert` (`vulnerability_alerting_event_id`,`user_id`,`repository_vulnerability_alert_id`),
  KEY `index_vulnerability_alerting_event_subscriptions_on_rva_id` (`repository_vulnerability_alert_id`),
  KEY `index_vae_subscriptions_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `vulnerability_alerting_events`;
CREATE TABLE `vulnerability_alerting_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vulnerability_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `push_id` bigint unsigned DEFAULT NULL,
  `reason` int NOT NULL DEFAULT '0',
  `actor_id` bigint unsigned DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL,
  `alert_count` int NOT NULL DEFAULT '0',
  `notification_count` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_vulnerability_alerting_events_on_vulnerability_id` (`vulnerability_id`),
  KEY `index_vulnerability_alerting_events_on_reason_and_created_at` (`reason`,`created_at`),
  KEY `index_vaes_on_repository_and_processed` (`repository_id`,`processed_at`),
  KEY `index_vaes_on_push` (`push_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `vulnerability_references`;
CREATE TABLE `vulnerability_references` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vulnerability_id` int NOT NULL,
  `url` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_vulnerability_references_on_vulnerability_id` (`vulnerability_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `vulnerable_version_range_alerting_processes`;
CREATE TABLE `vulnerable_version_range_alerting_processes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vulnerability_alerting_event_id` bigint unsigned NOT NULL,
  `vulnerable_version_range_id` bigint unsigned NOT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_vae_id_and_vvr_id` (`vulnerability_alerting_event_id`,`vulnerable_version_range_id`),
  KEY `index_vae_id_and_processed_at` (`vulnerability_alerting_event_id`,`processed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `vulnerable_version_ranges`;
CREATE TABLE `vulnerable_version_ranges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vulnerability_id` bigint unsigned DEFAULT NULL,
  `affects` varchar(255) COLLATE utf8mb3_general_ci NOT NULL,
  `fixed_in` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `requirements` text COLLATE utf8mb3_general_ci NOT NULL,
  `ecosystem` varchar(20) DEFAULT NULL,
  `affected_functions` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `affected_functions_json` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_vulnerable_version_ranges_on_ecosystem` (`ecosystem`),
  KEY `index_vulnerable_version_ranges_on_vulnerability_id` (`vulnerability_id`),
  KEY `index_vulnerable_version_ranges_on_affects_and_ecosystem` (`affects`,`ecosystem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
