DROP TABLE IF EXISTS `branch_actor_allowances`;
CREATE TABLE `branch_actor_allowances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `protected_branch_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `actor_type` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `policy` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_branch_actor_allowances_policy_actor` (`protected_branch_id`,`policy`,`actor_id`,`actor_type`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `classroom_repositories`;
CREATE TABLE `classroom_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `team_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `classroom_id` bigint unsigned DEFAULT NULL,
  `assignment_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_classroom_repositories_on_repository_id` (`repository_id`),
  KEY `index_classroom_repositories_on_team_id` (`team_id`),
  KEY `index_classroom_repositories_on_user_id` (`user_id`),
  KEY `index_classroom_repositories_on_classroom_id` (`classroom_id`),
  KEY `index_classroom_repositories_on_assignment_id` (`assignment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `community_profiles`;
CREATE TABLE `community_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `has_code_of_conduct` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` int NOT NULL,
  `has_contributing` tinyint(1) DEFAULT NULL,
  `has_license` tinyint(1) DEFAULT NULL,
  `has_readme` tinyint(1) DEFAULT NULL,
  `has_outside_contributors` tinyint(1) DEFAULT NULL,
  `detected_code_of_conduct` varchar(255) DEFAULT NULL,
  `help_wanted_issues_count` int NOT NULL DEFAULT '0',
  `good_first_issue_issues_count` int NOT NULL DEFAULT '0',
  `has_docs` tinyint(1) NOT NULL DEFAULT '0',
  `has_description` tinyint(1) NOT NULL DEFAULT '0',
  `has_issue_opened_by_non_collaborator` tinyint(1) NOT NULL DEFAULT '0',
  `has_pr_or_issue_template` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_community_profiles_on_repository_id` (`repository_id`),
  KEY `index_community_profiles_on_has_code_of_conduct` (`has_code_of_conduct`),
  KEY `index_community_profiles_on_detected_code_of_conduct` (`detected_code_of_conduct`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `custom_property_definitions`;
CREATE TABLE `custom_property_definitions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `property_name` varchar(75) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `allowed_values` json DEFAULT NULL,
  `value_type` tinyint unsigned NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `values_editable_by` tinyint unsigned NOT NULL DEFAULT '0',
  `config` json DEFAULT NULL,
  `source_type` tinyint unsigned NOT NULL DEFAULT '0',
  `source_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_custom_property_definitions_on_source_id_type_and_prop_name` (`source_id`,`source_type`,`property_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `custom_property_usages`;
CREATE TABLE `custom_property_usages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `definition_id` bigint unsigned NOT NULL,
  `consumer_id` varchar(150) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `consumer_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `property_value` varchar(75) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_custom_property_usages_on_definition_id` (`definition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `custom_property_values`;
CREATE TABLE `custom_property_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target_id` bigint unsigned NOT NULL,
  `target_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `definition_id` bigint unsigned NOT NULL,
  `value` varchar(75) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_custom_property_value_on_target_and_definition` (`target_id`,`definition_id`,`target_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `demo_repositories`;
CREATE TABLE `demo_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `organization_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_demo_repositories_on_organization_id` (`organization_id`),
  UNIQUE KEY `index_demo_repositories_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `environments`;
CREATE TABLE `environments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `gates_admin_enforced` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_environments_on_repository_id_and_name` (`repository_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `exemption_requests`;
CREATE TABLE `exemption_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `number` bigint unsigned DEFAULT NULL,
  `request_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `resource_owner_id` bigint unsigned DEFAULT NULL,
  `resource_owner_type` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `requester_id` bigint unsigned NOT NULL,
  `requester_comment` varchar(2048) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `resource_identifier` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `status` tinyint unsigned NOT NULL DEFAULT '0',
  `expires_at` datetime(6) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_exemption_requests_resource_owner` (`resource_owner_id`,`resource_owner_type`,`expires_at`),
  KEY `index_exemption_requests_resource_identifier` (`request_type`,`resource_identifier`,`expires_at`),
  KEY `index_exemption_requests_repository` (`repository_id`,`expires_at`),
  KEY `index_exemption_requests_repository_number` (`repository_id`,`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `exemption_responses`;
CREATE TABLE `exemption_responses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `exemption_request_id` bigint unsigned DEFAULT NULL,
  `reviewer_id` bigint unsigned NOT NULL,
  `status` tinyint unsigned NOT NULL DEFAULT '0',
  `message` varchar(2048) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_exemption_responses_exemption_request` (`exemption_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `gate_approval_logs`;
CREATE TABLE `gate_approval_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `check_suite_id` bigint NOT NULL,
  `user_id` int NOT NULL COMMENT 'the actual user that approved the gate request',
  `state` int NOT NULL COMMENT 'whether if it was approved, denied or dismissed',
  `comment` varbinary(1024) NOT NULL COMMENT 'approval comment',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_gate_approval_logs_on_check_suite_id` (`check_suite_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gate_approvals`;
CREATE TABLE `gate_approvals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `gate_request_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `approver_type` varchar(4) NOT NULL COMMENT 'the type of approver (user or team)',
  `approver_id` bigint unsigned NOT NULL COMMENT 'the id of the approver (user_id or team_id)',
  `state` int NOT NULL COMMENT 'whether if it was approved, denied or dismissed',
  `user_id` bigint unsigned NOT NULL COMMENT 'the actual user that approved the gate request',
  `gate_approval_log_id` bigint unsigned DEFAULT NULL,
  `environment_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_gate_approvals_on_gate_approval_log_id` (`gate_approval_log_id`),
  KEY `index_gate_approvals_on_gate_request_id_and_user_id` (`gate_request_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gate_approvers`;
CREATE TABLE `gate_approvers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gate_id` int NOT NULL,
  `repository_id` int NOT NULL,
  `approver_type` varchar(4) NOT NULL COMMENT 'the type of approver (user or team)',
  `approver_id` int NOT NULL COMMENT 'the id of the approver (user_id or team_id)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_gate_approvals_on_approver_and_type_and_gate` (`approver_id`,`approver_type`,`gate_id`),
  KEY `index_gate_approvers_on_gate_id` (`gate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gate_branch_policies`;
CREATE TABLE `gate_branch_policies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `gate_id` bigint NOT NULL,
  `repository_id` bigint NOT NULL,
  `name` varbinary(1024) NOT NULL COMMENT 'branch which can include wildcards',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_gate_branch_policies_on_gate_id_name` (`gate_id`,`name`),
  KEY `index_gate_branch_policies_on_gate_id` (`gate_id`),
  KEY `index_gate_branch_policies_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gate_requests`;
CREATE TABLE `gate_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gate_id` int NOT NULL,
  `state` int NOT NULL DEFAULT '0' COMMENT 'whether the gate is open or closed. Defaults to closed',
  `check_run_id` bigint NOT NULL,
  `token` text NOT NULL COMMENT 'token to pass to actions service',
  `data` blob COMMENT 'potentially store additional info about the gate request depending on the gate type',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_gate_requests_on_gate_id_and_check_run_id` (`gate_id`,`check_run_id`),
  KEY `index_gate_requests_on_gate_id` (`gate_id`),
  KEY `index_gate_requests_on_check_run_id` (`check_run_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gates`;
CREATE TABLE `gates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `environment_id` bigint unsigned NOT NULL,
  `name` varbinary(1024) DEFAULT NULL COMMENT 'name of the gate, that can contain emojis',
  `body` blob NOT NULL COMMENT 'data that changes depending on the gate type',
  `type` int NOT NULL COMMENT 'the gate type (e.g. manual / timeout)',
  `timeout` int NOT NULL COMMENT 'timeout in minutes',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `min_approvals` int NOT NULL DEFAULT '0' COMMENT 'minimum number of approvals to open the gate',
  `integration_id` bigint unsigned DEFAULT NULL,
  `integration_installation_id` bigint unsigned DEFAULT NULL,
  `prevent_self_review` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_gates_on_environment_id` (`environment_id`),
  KEY `index_gates_on_integration_installation_id` (`integration_installation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `import_item_errors`;
CREATE TABLE `import_item_errors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `import_item_id` int NOT NULL,
  `payload_location` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `resource` varchar(255) DEFAULT NULL,
  `field` varchar(255) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_import_item_errors_on_import_item_id` (`import_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `import_items`;
CREATE TABLE `import_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `status` varchar(30) NOT NULL,
  `model_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `json_data` mediumblob,
  `model_type` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_import_items_on_repository_id_and_updated_at` (`repository_id`,`updated_at`),
  KEY `index_import_items_on_repository_id_and_status` (`repository_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `integration_allowed_packages`;
CREATE TABLE `integration_allowed_packages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `integration_id` bigint unsigned NOT NULL,
  `repository_id` bigint NOT NULL,
  `access_type` int unsigned NOT NULL,
  `package_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_integration_allowed_packages_on_repository_id` (`repository_id`),
  KEY `index_integration_allowed_packages_on_package_and_integration_id` (`package_id`,`integration_id`),
  KEY `index_integration_allowed_packages_on_app_repo_and_access_type` (`integration_id`,`repository_id`,`access_type`),
  KEY `index_integration_allowed_packages_on_app_repo_and_updated_at` (`integration_id`,`repository_id`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `internal_repositories`;
CREATE TABLE `internal_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `business_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_internal_repositories_on_repository_id_and_business_id` (`repository_id`,`business_id`),
  KEY `index_internal_repositories_on_business_id_and_repository_id` (`business_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned DEFAULT NULL,
  `language_name_id` bigint unsigned DEFAULT NULL,
  `size` bigint DEFAULT NULL,
  `total_size` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `public` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `index_languages_on_size` (`size`),
  KEY `index_languages_on_repository_id_language_name_id_and_size` (`repository_id`,`language_name_id`,`size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `marketplace_categories_repository_actions`;
CREATE TABLE `marketplace_categories_repository_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `marketplace_category_id` int NOT NULL,
  `repository_action_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_marketplace_categories_repository_actions_on_ids` (`marketplace_category_id`,`repository_action_id`),
  KEY `index_marketplace_categories_repository_actions_on_action_id` (`repository_action_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `mirrors`;
CREATE TABLE `mirrors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `repository_id` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_mirrors_on_repository_id` (`repository_id`),
  KEY `index_mirrors_on_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `network_privileges`;
CREATE TABLE `network_privileges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `noindex` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `require_login` tinyint(1) NOT NULL DEFAULT '0',
  `collaborators_only` tinyint(1) NOT NULL DEFAULT '0',
  `hide_from_discovery` tinyint(1) NOT NULL DEFAULT '0',
  `require_opt_in` tinyint(1) NOT NULL DEFAULT '0',
  `show_content_warning` tinyint(1) NOT NULL DEFAULT '0',
  `content_warning_category` text,
  `content_warning_sub_category` text,
  `content_warning_custom_sub_category` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_network_privileges_on_repository_id` (`repository_id`),
  UNIQUE KEY `index_repository_and_hide_from_discovery` (`repository_id`,`hide_from_discovery`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `org_owned_private_networks_with_forks`;
CREATE TABLE `org_owned_private_networks_with_forks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `network_id` bigint unsigned NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repos_oopnwf_on_network_id` (`network_id`),
  KEY `index_repos_oopnwf_on_owner_id_and_network_id` (`owner_id`,`network_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `package_download_activities`;
CREATE TABLE `package_download_activities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `package_id` bigint unsigned NOT NULL,
  `package_version_id` bigint unsigned NOT NULL,
  `package_download_count` int DEFAULT '0',
  `started_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_package_download_activities_on_pkg_version_and_started_at` (`package_version_id`,`started_at`),
  KEY `index_package_download_activities_on_started_at` (`started_at`),
  KEY `index_package_download_activities_on_pkg_id_and_started_at` (`package_id`,`started_at`),
  KEY `index_pkg_download_activities_on_pkg_id_ver_id_download_count` (`package_id`,`package_version_id`,`package_download_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `package_files`;
CREATE TABLE `package_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `package_version_id` bigint unsigned NOT NULL,
  `filename` varchar(255) NOT NULL DEFAULT '',
  `sha1` varchar(40) DEFAULT NULL,
  `md5` varchar(32) DEFAULT NULL,
  `storage_blob_id` bigint unsigned DEFAULT NULL,
  `uploader_id` bigint unsigned DEFAULT NULL,
  `guid` varchar(36) DEFAULT NULL,
  `oid` varchar(64) DEFAULT NULL,
  `size` int NOT NULL,
  `state` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `sha256` varchar(64) DEFAULT NULL,
  `sri_512` varchar(100) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `migration_state` enum('unmigrated','complete','pending','error','retriable_error') NOT NULL DEFAULT 'unmigrated',
  `object_migration_state` enum('unmigrated','complete') NOT NULL DEFAULT 'unmigrated',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_package_files_on_package_version_id_and_filename` (`package_version_id`,`filename`),
  UNIQUE KEY `index_package_files_on_guid` (`guid`),
  KEY `index_package_files_on_sha256` (`sha256`),
  KEY `index_package_files_on_package_version_id_and_migration_state` (`package_version_id`,`migration_state`),
  KEY `index_package_files_on_object_migration_state` (`object_migration_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `package_storage_utilizations`;
CREATE TABLE `package_storage_utilizations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `gb_used` float DEFAULT '0',
  `emitted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_package_storage_utilizations_on_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `package_version_package_files`;
CREATE TABLE `package_version_package_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_version_id` int NOT NULL,
  `package_file_id` int NOT NULL,
  `package_file_order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_package_version_package_files_on_version_id_and_file_id` (`package_version_id`,`package_file_id`),
  KEY `index_package_version_package_files_on_file_id` (`package_file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `package_versions`;
CREATE TABLE `package_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registry_package_id` int NOT NULL,
  `release_id` int DEFAULT NULL,
  `platform` varchar(255) NOT NULL DEFAULT '',
  `version` varchar(255) NOT NULL,
  `commit_oid` varchar(40) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `sha256` varchar(64) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `manifest` mediumblob,
  `author_id` int DEFAULT NULL,
  `pre_release` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `published_via_actions` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_by_id` int DEFAULT NULL,
  `files_count` int NOT NULL DEFAULT '0',
  `migration_last_update` datetime DEFAULT NULL,
  `migration_state` enum('unmigrated','complete','pending','error','retriable_error') COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'unmigrated',
  `original_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_registry_package_versions_on_package_id_and_version` (`registry_package_id`,`version`,`platform`),
  KEY `index_package_versions_on_release_id` (`release_id`),
  KEY `index_package_versions_on_author_id` (`author_id`),
  KEY `index_package_versions_on_package_pre_release_and_version` (`registry_package_id`,`pre_release`,`version`),
  KEY `index_package_versions_on_package_deleted_at` (`deleted_at`),
  KEY `index_package_versions_on_package_migration_state_and_version` (`registry_package_id`,`migration_state`,`version`),
  KEY `index_package_versions_on_package_id_deleted_at_and_such` (`registry_package_id`,`deleted_at`,`version`,`platform`,`original_name`,`migration_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `packages_migration`;
CREATE TABLE `packages_migration` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL COMMENT 'owner who triggered the migration',
  `state` tinyint NOT NULL DEFAULT '0',
  `total_org_count` int NOT NULL,
  `success_org_count` int NOT NULL DEFAULT '0',
  `failed_org_count` int NOT NULL DEFAULT '0',
  `total_pkg_count` int NOT NULL,
  `success_pkg_count` int NOT NULL DEFAULT '0',
  `failed_pkg_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `packages_migration_status_index` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `page_builds`;
CREATE TABLE `page_builds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_id` bigint unsigned DEFAULT NULL,
  `page_deployment_id` bigint unsigned DEFAULT NULL,
  `pages_deployment_id` bigint unsigned DEFAULT NULL,
  `raw_data` blob,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `pusher_id` bigint unsigned DEFAULT NULL,
  `commit` char(40) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `error` text,
  `backtrace` text,
  `duration` bigint unsigned DEFAULT NULL,
  `workflow_run_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_page_builds_on_updated_at` (`updated_at`),
  KEY `index_page_builds_on_page_id_and_updated_at` (`page_id`,`updated_at`),
  KEY `index_page_builds_on_pages_deployment_id_and_updated_at` (`pages_deployment_id`,`updated_at`),
  KEY `index_page_builds_on_page_deployment_id_and_updated_at` (`page_deployment_id`,`updated_at`),
  KEY `index_page_builds_on_page_id_and_commit` (`page_id`,`commit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `page_certificates`;
CREATE TABLE `page_certificates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) NOT NULL,
  `state` int DEFAULT NULL,
  `state_detail` text,
  `expires_at` datetime DEFAULT NULL,
  `challenge_path` text,
  `challenge_response` text,
  `earthsmoke_key_version_id` bigint unsigned DEFAULT NULL,
  `fastly_privkey_id` text,
  `authorization_url` text,
  `certificate_url` text,
  `fastly_certificate_id` varchar(255) DEFAULT NULL,
  `order_url` text,
  `alt_domain` varchar(255) DEFAULT NULL,
  `alt_challenge_path` text,
  `alt_challenge_response` text,
  `alt_authorization_url` text,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_page_certificates_on_domain` (`domain`),
  UNIQUE KEY `index_page_certificates_on_alt_domain` (`alt_domain`),
  KEY `index_page_certificates_on_state_and_expires_at` (`state`,`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `page_deployments`;
CREATE TABLE `page_deployments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_id` bigint unsigned NOT NULL,
  `ref_name` varbinary(1024) NOT NULL,
  `revision` varchar(40) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `token` varchar(25) DEFAULT NULL,
  `final_deployment_status` smallint DEFAULT NULL,
  `check_run_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_page_deployments_on_page_id_and_ref_name` (`page_id`,`ref_name`(767)),
  UNIQUE KEY `index_page_deployments_on_page_id_and_token` (`page_id`,`token`),
  KEY `index_page_deployments_on_page_id_and_revision` (`page_id`,`revision`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `page_updates`;
CREATE TABLE `page_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_id` bigint unsigned NOT NULL,
  `event` tinyint unsigned NOT NULL COMMENT 'the type of event (update, destroy)',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_page_updates_on_page_id` (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `repository_id` bigint DEFAULT NULL,
  `cname` varchar(255) DEFAULT NULL,
  `four_oh_four` tinyint(1) DEFAULT '0',
  `status` varchar(20) DEFAULT NULL,
  `has_public_search` tinyint(1) DEFAULT '0',
  `built_revision` varchar(40) DEFAULT NULL,
  `https_redirect` tinyint(1) NOT NULL DEFAULT '0',
  `hsts_max_age` int DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `source_ref_name` varbinary(1024) DEFAULT NULL,
  `source_subdir` varbinary(1024) DEFAULT NULL,
  `hsts_include_sub_domains` tinyint(1) NOT NULL DEFAULT '0',
  `hsts_preload` tinyint(1) NOT NULL DEFAULT '0',
  `public` tinyint(1) NOT NULL DEFAULT '1',
  `subdomain` varchar(130) DEFAULT NULL,
  `parent_domain` varchar(255) DEFAULT NULL COMMENT 'subdomains track the name of their parent domain',
  `www_parent_domain` varchar(255) DEFAULT NULL,
  `build_type` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'default value (0) builds with Jekyll. Other values defined by application.',
  `custom_subdomain` varchar(96) DEFAULT NULL COMMENT 'custom_subdomain is 63 characters + _{tenant shortcode}',
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_cname` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pages_on_repository_id` (`repository_id`),
  UNIQUE KEY `index_pages_on_unique_cname` (`cname`),
  UNIQUE KEY `index_pages_on_subdomain` (`subdomain`),
  UNIQUE KEY `index_pages_on_unique_custom_subdomain` (`custom_subdomain`),
  KEY `index_pages_on_parent_domain` (`parent_domain`),
  KEY `index_pages_on_www_parent_domain` (`www_parent_domain`),
  KEY `index_pages_on_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pages_fileservers`;
CREATE TABLE `pages_fileservers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `host` varchar(255) NOT NULL,
  `online` tinyint(1) NOT NULL,
  `embargoed` tinyint(1) NOT NULL,
  `evacuating` tinyint(1) NOT NULL DEFAULT '0',
  `disk_free` bigint unsigned NOT NULL DEFAULT '0',
  `disk_used` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `non_voting` tinyint(1) NOT NULL DEFAULT '0',
  `datacenter` varchar(20) DEFAULT NULL,
  `rack` varchar(20) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `inodes_free` bigint unsigned NOT NULL DEFAULT '0',
  `inodes_used` bigint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pages_fileservers_on_host` (`host`),
  KEY `index_pages_fileservers_by_location` (`datacenter`,`rack`),
  KEY `index_pages_fileservers_on_evacuating` (`evacuating`),
  KEY `index_pages_fileservers_on_online_and_embargoed_and_host` (`online`,`embargoed`,`host`),
  KEY `index_pages_fileservers_on_voting_and_online_and_embarg_and_host` (`non_voting`,`online`,`embargoed`,`host`),
  KEY `index_pages_fileservers_on_voting_and_online_and_embarg_and_df` (`non_voting`,`online`,`embargoed`,`disk_free`),
  KEY `index_pages_fileservers_on_voting_online_embargo_df_inodes` (`non_voting`,`online`,`embargoed`,`disk_free`,`inodes_free`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pages_migrations`;
CREATE TABLE `pages_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_id` bigint unsigned NOT NULL,
  `page_deployment_id` bigint unsigned NOT NULL,
  `manifest` json DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'Current state of migration. See enum in PageMigration model',
  PRIMARY KEY (`id`),
  KEY `index_page_id_page_deployment_id` (`page_id`,`page_deployment_id`),
  KEY `index_status_updated_at_pages_migrations` (`status`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pages_partitions`;
CREATE TABLE `pages_partitions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `host` varchar(255) NOT NULL,
  `partition` varchar(1) NOT NULL,
  `disk_free` bigint NOT NULL,
  `disk_used` bigint NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pages_partitions_on_host_and_partition` (`host`,`partition`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pages_protected_domains`;
CREATE TABLE `pages_protected_domains` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `owner_type` enum('User','Organization','Enterprise') COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` tinyint unsigned NOT NULL DEFAULT '0',
  `challenge` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `unverified_at` datetime(6) DEFAULT NULL COMMENT 'datetime when the domain transitions to the unverified state',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `parent_domain` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL COMMENT 'subdomains track the name of their parent domain',
  `last_verified_at` datetime(6) DEFAULT NULL COMMENT 'datetime when verification was previously performed',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pages_protected_domains_on_name_owner_type_owner_id` (`name`,`owner_type`,`owner_id`),
  KEY `index_pages_protected_domains_on_state_and_unverified_at` (`state`,`unverified_at`),
  KEY `index_pages_protected_domains_on_parent_domain` (`parent_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pages_replicas`;
CREATE TABLE `pages_replicas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_id` bigint unsigned NOT NULL,
  `host` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `pages_deployment_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pages_replicas_on_host` (`host`),
  KEY `index_pages_replicas_on_pages_deployment_id_and_host` (`pages_deployment_id`,`host`),
  KEY `index_pages_replicas_on_page_id_and_host` (`page_id`,`host`),
  KEY `index_pages_replicas_on_page_id_and_pages_deployment_id_and_host` (`page_id`,`pages_deployment_id`,`host`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pages_routes`;
CREATE TABLE `pages_routes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `host` varchar(255) NOT NULL,
  `https_behavior` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pages_routes_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pinned_environments`;
CREATE TABLE `pinned_environments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `environment_id` bigint unsigned NOT NULL,
  `position` int unsigned NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pinned_environments_on_repository_id_and_environment_id` (`repository_id`,`environment_id`),
  KEY `index_pinned_environments_on_repository_id_and_position` (`repository_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `preferred_files`;
CREATE TABLE `preferred_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `filetype` int NOT NULL DEFAULT '0',
  `path` varbinary(1024) NOT NULL,
  `commit_oid` varchar(40) NOT NULL,
  `has_content` tinyint(1) NOT NULL DEFAULT '0',
  `committed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_preferred_files_on_repository_id_and_filetype` (`repository_id`,`filetype`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `protected_branches`;
CREATE TABLE `protected_branches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `name` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `required_status_checks_enforcement_level` int NOT NULL DEFAULT '0',
  `block_force_pushes_enforcement_level` int NOT NULL DEFAULT '2',
  `block_deletions_enforcement_level` int NOT NULL DEFAULT '2',
  `strict_required_status_checks_policy` tinyint(1) NOT NULL DEFAULT '1',
  `authorized_actors_only` tinyint(1) NOT NULL DEFAULT '0',
  `pull_request_reviews_enforcement_level` int NOT NULL DEFAULT '0',
  `authorized_dismissal_actors_only` tinyint(1) NOT NULL DEFAULT '0',
  `admin_enforced` tinyint(1) NOT NULL DEFAULT '0',
  `dismiss_stale_reviews_on_push` tinyint(1) NOT NULL DEFAULT '0',
  `require_code_owner_review` tinyint(1) NOT NULL DEFAULT '0',
  `signature_requirement_enforcement_level` int NOT NULL DEFAULT '0',
  `required_approving_review_count` tinyint NOT NULL DEFAULT '1',
  `linear_history_requirement_enforcement_level` int NOT NULL DEFAULT '0',
  `allow_force_pushes_enforcement_level` int NOT NULL DEFAULT '0',
  `allow_deletions_enforcement_level` int NOT NULL DEFAULT '0',
  `merge_queue_enforcement_level` int NOT NULL DEFAULT '0',
  `required_deployments_enforcement_level` int NOT NULL DEFAULT '0',
  `ignore_approvals_from_contributors` tinyint(1) NOT NULL DEFAULT '0',
  `required_review_thread_resolution_enforcement_level` int NOT NULL DEFAULT '0',
  `create_protected` tinyint(1) NOT NULL DEFAULT '0',
  `require_last_push_approval` tinyint(1) NOT NULL DEFAULT '0',
  `lock_branch_enforcement_level` int NOT NULL DEFAULT '0',
  `lock_allows_fetch_and_merge` tinyint(1) NOT NULL DEFAULT '0',
  `migration_stage` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_protected_branches_on_repository_id_and_name` (`repository_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `reactions`;
CREATE TABLE `reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(30) NOT NULL,
  `user_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `subject_type` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reactions_identity` (`user_id`,`subject_id`,`subject_type`,`content`),
  KEY `index_reactions_on_subject_content_created_at` (`subject_id`,`subject_type`,`content`,`created_at`),
  KEY `index_reactions_on_user_hidden_and_user_id` (`user_hidden`,`user_id`),
  KEY `subject_id_and_subject_type_and_user_hidden_and_created_at` (`subject_id`,`subject_type`,`user_hidden`,`created_at`),
  KEY `index_reactions_on_subject_user_hidden_content_created_at` (`subject_id`,`subject_type`,`user_hidden`,`content`,`created_at`,`id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `ref_pushes`;
CREATE TABLE `ref_pushes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `pusher_id` bigint unsigned NOT NULL,
  `ref` varbinary(1024) NOT NULL,
  `after` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `pushed_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_ref_pushes_on_repository_id_and_pusher_id_and_ref` (`repository_id`,`pusher_id`,`ref`),
  UNIQUE KEY `index_ref_pushes_on_repository_id_and_ref_and_pusher_id` (`repository_id`,`ref`,`pusher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `registry_owner_migration`;
CREATE TABLE `registry_owner_migration` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `state` tinyint NOT NULL COMMENT 'Migration state for the owner',
  `created_at` datetime(6) NOT NULL COMMENT 'Date and time when the migration was created',
  `updated_at` datetime(6) NOT NULL COMMENT 'Date and time when the migration was last updated',
  `owner_id` bigint NOT NULL,
  `package_type` int NOT NULL DEFAULT '3',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_registry_owner_migration_on_owner_id_package_type` (`owner_id`,`package_type`),
  KEY `idx__registry_owner_migration_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `registry_package_dependencies`;
CREATE TABLE `registry_package_dependencies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registry_package_version_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `dependency_type` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_registry_package_dependencies_on_package_version_id` (`registry_package_version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `registry_package_files`;
CREATE TABLE `registry_package_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registry_package_id` int NOT NULL,
  `release_id` int DEFAULT NULL,
  `platform` varchar(255) NOT NULL DEFAULT '',
  `sha1` varchar(40) DEFAULT NULL,
  `version` varchar(255) NOT NULL,
  `commit_oid` varchar(40) DEFAULT NULL,
  `storage_blob_id` int DEFAULT NULL,
  `uploader_id` int DEFAULT NULL,
  `guid` varchar(36) DEFAULT NULL,
  `oid` varchar(64) DEFAULT NULL,
  `size` int NOT NULL,
  `state` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `filename` varchar(255) NOT NULL DEFAULT '',
  `md5` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reg_package_files_on_reg_pkg_id_and_ver_and_plat_and_fname` (`registry_package_id`,`version`,`platform`,`filename`),
  KEY `index_registry_package_files_on_release_id` (`release_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `registry_package_metadata`;
CREATE TABLE `registry_package_metadata` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_version_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` blob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_registry_package_metadata_on_package_version_id_and_name` (`package_version_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `registry_package_tags`;
CREATE TABLE `registry_package_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registry_package_id` int NOT NULL,
  `registry_package_version_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_registry_package_tags_on_registry_package_id_and_name` (`registry_package_id`,`name`),
  KEY `index_registry_package_tags_on_name` (`name`),
  KEY `index_registry_package_tags_on_registry_package_version_id` (`registry_package_version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `registry_packages`;
CREATE TABLE `registry_packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `owner_id` int NOT NULL,
  `repository_id` int NOT NULL,
  `package_type` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `registry_package_type` varchar(40) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_registry_package_on_repo_and_name_and_type` (`repository_id`,`name`,`package_type`),
  UNIQUE KEY `index_registry_packages_on_owner_id_name_package_type` (`owner_id`,`name`,`package_type`),
  UNIQUE KEY `index_registry_packages_on_repository_id_and_slug` (`repository_id`,`slug`),
  UNIQUE KEY `index_packages_on_repo_id_and_name_and_registry_package_type` (`repository_id`,`name`,`registry_package_type`),
  UNIQUE KEY `index_registry_packages_on_owner_id_name_registry_package_type` (`owner_id`,`name`,`registry_package_type`),
  KEY `owner_id_and_package_type_and_registry_p_type_and_deleted_at` (`owner_id`,`package_type`,`registry_package_type`,`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `release_mentions`;
CREATE TABLE `release_mentions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `release_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_release_mentions_on_user_id` (`user_id`),
  KEY `index_release_mentions_on_release_id_user_id` (`release_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `releases`;
CREATE TABLE `releases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varbinary(1024) DEFAULT NULL,
  `tag_name` varbinary(1024) NOT NULL,
  `body` mediumtext COLLATE utf8mb4_unicode_520_ci,
  `author_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `state` int DEFAULT '0',
  `pending_tag` varbinary(1024) DEFAULT NULL,
  `prerelease` tinyint(1) NOT NULL DEFAULT '0',
  `target_commitish` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `formatter` varchar(20) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `by_published` (`repository_id`,`published_at`),
  KEY `by_repo_and_tag` (`repository_id`,`tag_name`(50)),
  KEY `by_repo_and_state_and_prerelease_and_created_at_and_updated_at` (`repository_id`,`state`,`prerelease`,`created_at`,`updated_at`),
  KEY `index_releases_on_author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repositories`;
CREATE TABLE `repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `sandbox` tinyint(1) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `public` tinyint(1) DEFAULT '1',
  `description` mediumblob,
  `homepage` varchar(255) DEFAULT NULL,
  `source_id` bigint unsigned DEFAULT NULL,
  `public_push` tinyint(1) DEFAULT NULL,
  `disk_usage` int DEFAULT '0',
  `locked` tinyint(1) DEFAULT '0',
  `pushed_at` datetime DEFAULT NULL,
  `watcher_count` int DEFAULT '0',
  `public_fork_count` int NOT NULL DEFAULT '1',
  `primary_language_name_id` bigint unsigned DEFAULT NULL,
  `has_issues` tinyint(1) DEFAULT '1',
  `has_wiki` tinyint(1) DEFAULT '1',
  `has_downloads` tinyint(1) DEFAULT '1',
  `raw_data` blob,
  `organization_id` bigint unsigned DEFAULT NULL,
  `disabled_at` datetime DEFAULT NULL,
  `disabled_by` int DEFAULT NULL,
  `disabling_reason` varchar(30) DEFAULT NULL,
  `health_status` varchar(30) DEFAULT NULL,
  `pushed_at_usec` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `reflog_sync_enabled` tinyint(1) DEFAULT '0',
  `made_public_at` datetime DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `maintained` tinyint(1) NOT NULL DEFAULT '1',
  `template` tinyint(1) NOT NULL DEFAULT '0',
  `owner_login` varchar(40) DEFAULT NULL,
  `world_writable_wiki` tinyint(1) NOT NULL DEFAULT '0',
  `refset_updated_at` datetime(6) DEFAULT NULL COMMENT 'The last time a ref was created or deleted on this repository',
  `disabling_detail` varchar(255) DEFAULT NULL,
  `archived_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repositories_on_owner_id_and_name_and_active` (`owner_id`,`name`,`active`),
  KEY `index_repositories_on_public_and_watcher_count` (`public`,`watcher_count`),
  KEY `index_repositories_on_created_at` (`created_at`),
  KEY `index_repositories_on_disabled_at` (`disabled_at`),
  KEY `index_repositories_on_owner_id_and_pushed_at` (`owner_id`,`pushed_at`),
  KEY `index_repositories_on_owner_id_and_made_public_at` (`owner_id`,`made_public_at`),
  KEY `index_repositories_on_user_hidden_and_owner_id` (`user_hidden`,`owner_id`),
  KEY `index_repositories_on_watcher_count_and_created_at_and_pushed_at` (`watcher_count`,`created_at`,`pushed_at`),
  KEY `index_repositories_on_active_and_updated_at` (`active`,`updated_at`),
  KEY `index_repositories_on_owner_and_parent_and_public_and_source_id` (`owner_id`,`parent_id`,`public`,`source_id`),
  KEY `index_on_public_and_primary_language_name_id_and_parent_id` (`public`,`primary_language_name_id`,`parent_id`),
  KEY `index_repositories_on_template_and_active_and_owner_id` (`template`,`active`,`owner_id`),
  KEY `index_repositories_on_owner_login_and_name_and_active` (`owner_login`,`name`,`active`),
  KEY `owner_and_org_and_name_and_active_and_public_and_disabled_at` (`owner_id`,`organization_id`,`name`,`active`,`public`,`disabled_at`),
  KEY `index_repositories_on_owner_id_and_updated_at` (`owner_id`,`updated_at`),
  KEY `index_repos_on_owner_id_public_active_primary_lang_name_id` (`owner_id`,`public`,`active`,`primary_language_name_id`),
  KEY `index_repos_on_organization_id_active_public_and_parent_id` (`organization_id`,`active`,`public`,`parent_id`),
  KEY `index_repositories_on_source_id_and_owner_id_and_active` (`source_id`,`owner_id`,`active`),
  KEY `index_repositories_on_source_id_organization_id_and_parent_id` (`source_id`,`organization_id`,`parent_id`),
  KEY `index_repositories_on_parent_id_and_active` (`parent_id`,`active`),
  KEY `index_repositories_on_owner_id_and_active_and_locked` (`owner_id`,`active`,`locked`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_action_releases`;
CREATE TABLE `repository_action_releases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_action_id` int NOT NULL,
  `release_id` int NOT NULL,
  `published_on_marketplace` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_action_releases_on_release_and_action_id` (`release_id`,`repository_action_id`),
  KEY `index_repository_action_releases_on_repository_action_id` (`repository_action_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_actions`;
CREATE TABLE `repository_actions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(255) NOT NULL,
  `name` varbinary(1024) NOT NULL,
  `description` mediumblob,
  `icon_name` varchar(20) DEFAULT NULL,
  `color` varchar(6) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `rank_multiplier` float NOT NULL DEFAULT '1',
  `state` int NOT NULL DEFAULT '0',
  `slug` varchar(255) DEFAULT NULL,
  `security_email` varchar(255) DEFAULT NULL,
  `latest_release_tag` varbinary(1024) DEFAULT NULL,
  `dependents_count` bigint DEFAULT NULL,
  `action_package_listed` tinyint(1) NOT NULL DEFAULT '0',
  `partnership_managed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_actions_on_repository_id_and_path` (`repository_id`,`path`),
  UNIQUE KEY `index_repository_actions_on_slug` (`slug`),
  KEY `index_repository_actions_on_repository_id_and_featured` (`repository_id`,`featured`),
  KEY `index_repository_actions_on_rank_multiplier` (`rank_multiplier`),
  KEY `index_repository_actions_on_state_and_slug` (`state`,`slug`),
  KEY `index_repository_actions_on_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_advisory_comment_edits`;
CREATE TABLE `repository_advisory_comment_edits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_advisory_comment_id` int NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int DEFAULT NULL,
  `diff` mediumblob,
  `user_content_edit_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_advisory_comment_edits_on_user_content_edit_id` (`user_content_edit_id`),
  KEY `index_on_pull_request_review_comment_id` (`repository_advisory_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_advisory_edits`;
CREATE TABLE `repository_advisory_edits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_advisory_id` int NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` int DEFAULT NULL,
  `diff` mediumblob,
  `user_content_edit_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_advisory_edits_on_user_content_edit_id` (`user_content_edit_id`),
  KEY `index_repository_advisory_edits_on_repository_advisory_id` (`repository_advisory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_auth_versions`;
CREATE TABLE `repository_auth_versions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `version` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_auth_versions_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_branch_renames`;
CREATE TABLE `repository_branch_renames` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `user_id` int NOT NULL,
  `default_branch` tinyint(1) NOT NULL,
  `old_sha` varchar(40) DEFAULT NULL,
  `old_name` varbinary(1024) NOT NULL,
  `new_name` varbinary(1024) NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `error_reason` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_branch_renames_on_user_id` (`user_id`),
  KEY `index_repository_branch_renames_on_repo_old_name_state` (`repository_id`,`old_name`,`state`),
  KEY `index_repository_branch_renames_on_repo_new_name_state_update` (`repository_id`,`new_name`,`state`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_group_maps`;
CREATE TABLE `repository_group_maps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_group_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_group_maps_group_id_repository_id` (`repository_group_id`,`repository_id`),
  UNIQUE KEY `index_repository_group_maps_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_group_settings`;
CREATE TABLE `repository_group_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_group_id` bigint unsigned NOT NULL,
  `type` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` json NOT NULL,
  `orchestration_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_group_settings_group_id_type` (`repository_group_id`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_groups`;
CREATE TABLE `repository_groups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `owner_type` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `group_path` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_groups_owner_and_group_path` (`owner_id`,`owner_type`,`group_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_invitations`;
CREATE TABLE `repository_invitations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `inviter_id` bigint unsigned NOT NULL,
  `invitee_id` bigint unsigned DEFAULT NULL,
  `permissions` tinyint DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `hashed_token` varbinary(44) DEFAULT NULL,
  `role_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_invitations_on_repository_id_and_invitee_id` (`repository_id`,`invitee_id`),
  UNIQUE KEY `index_repository_invitations_on_hashed_token` (`hashed_token`),
  UNIQUE KEY `index_repository_invitations_on_repository_id_and_email` (`repository_id`,`email`),
  KEY `index_repository_invitations_on_invitee_id` (`invitee_id`),
  KEY `index_repository_invitations_on_created_at` (`created_at`),
  KEY `index_repository_invitations_on_role_id` (`role_id`),
  KEY `index_repository_invitations_on_email` (`email`),
  KEY `index_repository_invitations_on_inviter_id` (`inviter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_latest_releases`;
CREATE TABLE `repository_latest_releases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `release_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_latest_releases_on_release_id` (`release_id`),
  UNIQUE KEY `index_repository_latest_releases_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_licenses`;
CREATE TABLE `repository_licenses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned DEFAULT NULL,
  `license_id` bigint unsigned DEFAULT NULL,
  `filepath` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_licenses_on_filepath_and_repository_id` (`filepath`,`repository_id`),
  KEY `index_repository_licenses_on_license_id` (`license_id`),
  KEY `index_repository_licenses_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_networks`;
CREATE TABLE `repository_networks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `root_id` int NOT NULL,
  `owner_id` int DEFAULT NULL,
  `repository_count` int DEFAULT NULL,
  `disk_usage` int DEFAULT NULL,
  `accessed_at` datetime DEFAULT NULL,
  `maintenance_status` varchar(255) NOT NULL,
  `last_maintenance_at` datetime NOT NULL,
  `pushed_at` datetime DEFAULT NULL,
  `pushed_count` int NOT NULL,
  `pushed_count_since_maintenance` int NOT NULL,
  `disabled_at` datetime DEFAULT NULL,
  `disabled_by` int DEFAULT NULL,
  `disabling_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `moving` tinyint(1) NOT NULL DEFAULT '0',
  `unpacked_size_in_mb` int DEFAULT NULL,
  `last_maintenance_attempted_at` datetime DEFAULT NULL,
  `cache_version_number` int NOT NULL DEFAULT '0',
  `maintenance_retries` int DEFAULT '0',
  `maintenance_count_since_full` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_repository_networks_on_root_id` (`root_id`),
  KEY `index_repository_networks_on_owner_id` (`owner_id`),
  KEY `index_repository_networks_on_created_at` (`created_at`),
  KEY `index_repository_networks_on_pushed_at` (`pushed_at`),
  KEY `index_repository_networks_on_accessed_at` (`accessed_at`),
  KEY `index_repository_networks_on_maintenance_status` (`maintenance_status`,`pushed_count_since_maintenance`,`unpacked_size_in_mb`,`last_maintenance_at`),
  KEY `index_repository_networks_on_maint_status_and_unpacked_size` (`maintenance_status`,`unpacked_size_in_mb`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_orchestrations`;
CREATE TABLE `repository_orchestrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `step_name` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `data` text COLLATE utf8mb4_unicode_520_ci,
  `attempts` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `error_message` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_type` (`type`,`state`),
  KEY `index_state_updated_at` (`state`,`updated_at`),
  KEY `index_repository_id` (`repository_id`,`state`,`type`),
  KEY `index_updated_at_state` (`updated_at`,`state`),
  KEY `index_parent_id_state` (`parent_id`,`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_redirects`;
CREATE TABLE `repository_redirects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `repository_name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_redirects_on_repository_id` (`repository_id`),
  KEY `index_repository_redirects_on_repository_name_and_created_at` (`repository_name`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_rule_conditions`;
CREATE TABLE `repository_rule_conditions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parameters` json NOT NULL,
  `target` tinyint unsigned NOT NULL,
  `condition_type` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `repository_ruleset_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_rule_conditions_on_repository_ruleset_id` (`repository_ruleset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_rule_configurations`;
CREATE TABLE `repository_rule_configurations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parameters` json DEFAULT NULL,
  `rule_type` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by_id` bigint unsigned DEFAULT NULL,
  `updated_by_id` bigint unsigned DEFAULT NULL,
  `repository_ruleset_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_rule_configurations_ruleset_id` (`repository_ruleset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_rule_runs`;
CREATE TABLE `repository_rule_runs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_rule_suite_id` bigint unsigned NOT NULL,
  `rule_type` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `rule_provider` varchar(100) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `result` tinyint unsigned NOT NULL DEFAULT '0',
  `repository_rule_configuration_id` bigint unsigned DEFAULT NULL,
  `message` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `violations` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `evaluation_metadata` json DEFAULT NULL,
  `rule_provider_id` bigint unsigned DEFAULT NULL,
  `rule_history_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_rule_runs_rule_config_id_created_at` (`repository_rule_configuration_id`,`created_at`),
  KEY `index_rule_runs_on_rule_suite_and_provider` (`repository_rule_suite_id`,`rule_provider_id`,`rule_provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_rule_suite_source_results`;
CREATE TABLE `repository_rule_suite_source_results` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_rule_suite_id` bigint unsigned NOT NULL,
  `source_id` bigint unsigned DEFAULT NULL,
  `source_type` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `result` tinyint unsigned NOT NULL DEFAULT '0',
  `evaluate_result` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_rule_suite_source_results_rule_suite_source` (`repository_rule_suite_id`,`source_id`,`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_rule_suites`;
CREATE TABLE `repository_rule_suites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `ref_name` varbinary(1024) NOT NULL,
  `before_oid` varchar(40) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `after_oid` varchar(40) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `policy_oid` varchar(40) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `actor_type` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `result` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `evaluation_metadata` json DEFAULT NULL,
  `owner_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_rule_suites_ref_update` (`repository_id`,`ref_name`,`before_oid`,`after_oid`,`policy_oid`),
  KEY `index_repository_rule_suites_created_at` (`repository_id`,`created_at`),
  KEY `index_repository_rule_suites_on_created_at` (`created_at`),
  KEY `index_repository_rule_suites_owner_id_created_at` (`owner_id`,`created_at`),
  KEY `index_repository_rule_suites_owner_actor` (`owner_id`,`actor_id`,`actor_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_ruleset_bypass_actors`;
CREATE TABLE `repository_ruleset_bypass_actors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_ruleset_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `actor_type` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `bypass_mode` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_ruleset_actor` (`repository_ruleset_id`,`actor_id`,`actor_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_ruleset_histories`;
CREATE TABLE `repository_ruleset_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_ruleset_id` bigint unsigned NOT NULL,
  `state` json NOT NULL,
  `updated_by_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_ruleset_history_on_ruleset_id_and_created_at` (`repository_ruleset_id`,`created_at`),
  KEY `index_repository_ruleset_histories_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_rulesets`;
CREATE TABLE `repository_rulesets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `source_id` bigint unsigned NOT NULL,
  `source_type` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `enforcement` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `bypass_prohibited` tinyint unsigned NOT NULL DEFAULT '0',
  `target` tinyint unsigned NOT NULL DEFAULT '0',
  `deploy_key_bypass` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_rulesets_on_source_id_and_source_type_and_name` (`source_id`,`source_type`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_sequences`;
CREATE TABLE `repository_sequences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `number` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_sequences_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_sponsorables`;
CREATE TABLE `repository_sponsorables` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `sponsorable_id` bigint unsigned NOT NULL,
  `source` tinyint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_sponsorables_on_repo_id_source_sponsorable_id` (`repository_id`,`source`,`sponsorable_id`),
  KEY `index_repository_sponsorables_on_sponsorable_id_repository_id` (`sponsorable_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_stack_releases`;
CREATE TABLE `repository_stack_releases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_stack_id` bigint unsigned NOT NULL,
  `release_id` bigint unsigned NOT NULL,
  `published_on_marketplace` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_stack_releases_on_repository_stack_id` (`repository_stack_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_stacks`;
CREATE TABLE `repository_stacks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` mediumblob,
  `icon_name` varchar(20) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `color` varchar(6) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `state` tinyint NOT NULL DEFAULT '0',
  `security_email` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_stacks_on_slug` (`slug`),
  KEY `index_repository_stacks_on_repository_id` (`repository_id`),
  KEY `index_repository_stacks_on_featured` (`featured`),
  KEY `index_repository_stacks_on_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_tag_protection_states`;
CREATE TABLE `repository_tag_protection_states` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `pattern` varbinary(1024) NOT NULL DEFAULT '*',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repo_tag_protection_states_on_repo_id_and_pattern` (`repository_id`,`pattern`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_tech_project_stacks`;
CREATE TABLE `repository_tech_project_stacks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_tech_project_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `stack_name_id` bigint unsigned NOT NULL,
  `settings` json DEFAULT NULL,
  `size` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `repository_tech_project_id_and_repository_id_and_stack_name_id` (`repository_tech_project_id`,`repository_id`,`stack_name_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_tech_projects`;
CREATE TABLE `repository_tech_projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `path` varbinary(1024) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_tech_projects_on_repository_id_and_path` (`repository_id`,`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_topics`;
CREATE TABLE `repository_topics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `topic_id` bigint unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_topics_on_repository_id_and_topic_id` (`repository_id`,`topic_id`),
  KEY `index_repository_topics_on_topic_id_and_state_and_repository_id` (`topic_id`,`state`,`repository_id`),
  KEY `index_repository_topics_on_repository_id_and_state_and_topic_id` (`repository_id`,`state`,`topic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_transfers`;
CREATE TABLE `repository_transfers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `requester_id` bigint unsigned NOT NULL,
  `responder_id` bigint unsigned DEFAULT NULL,
  `state` int NOT NULL DEFAULT '0',
  `target_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `new_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_transfers_on_repository_id_and_target_id` (`repository_id`,`target_id`),
  KEY `index_repository_transfers_on_requester_id` (`requester_id`),
  KEY `index_repository_transfers_on_responder_id` (`responder_id`),
  KEY `index_repository_transfers_on_state` (`state`),
  KEY `index_repository_transfers_on_target_id` (`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_unlocks`;
CREATE TABLE `repository_unlocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unlocked_by_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `reason` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `revoked_by_id` bigint unsigned DEFAULT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `staff_access_grant_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_unlocks_on_repository_id` (`repository_id`),
  KEY `index_repository_unlocks_on_staff_access_grant_id` (`staff_access_grant_id`),
  KEY `index_repository_unlocks_on_revoked_by_id_and_expires_at` (`revoked_by_id`,`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_wikis`;
CREATE TABLE `repository_wikis` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` int unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `pushed_at` datetime DEFAULT NULL,
  `maintenance_status` varchar(255) DEFAULT NULL,
  `last_maintenance_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `pushed_count` int NOT NULL DEFAULT '0',
  `pushed_count_since_maintenance` int NOT NULL DEFAULT '0',
  `last_maintenance_attempted_at` datetime DEFAULT NULL,
  `cache_version_number` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_wikis_on_repository_id` (`repository_id`),
  KEY `index_repository_wikis_on_maintenance_status` (`maintenance_status`,`pushed_count_since_maintenance`,`last_maintenance_at`),
  KEY `index_repository_wikis_on_last_maintenance_at` (`last_maintenance_at`),
  KEY `index_repository_wikis_on_pushed_at` (`pushed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `required_deployments`;
CREATE TABLE `required_deployments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `protected_branch_id` bigint unsigned NOT NULL,
  `environment` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `environment_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_required_deployments_on_protected_branch_and_environment` (`protected_branch_id`,`environment`),
  KEY `index_required_deployments_on_environment_id` (`environment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `required_status_checks`;
CREATE TABLE `required_status_checks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `protected_branch_id` bigint unsigned NOT NULL,
  `context` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `integration_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_required_status_checks_on_id_and_context` (`protected_branch_id`,`context`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `review_dismissal_allowances`;
CREATE TABLE `review_dismissal_allowances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `protected_branch_id` int NOT NULL,
  `actor_id` int NOT NULL,
  `actor_type` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_review_dismissal_allowances_on_branch_and_actor` (`protected_branch_id`,`actor_id`,`actor_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `tabs`;
CREATE TABLE `tabs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `anchor` varchar(255) DEFAULT NULL,
  `url` text COLLATE utf8mb3_general_ci,
  `repository_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `upload_manifests`;
CREATE TABLE `upload_manifests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `uploader_id` int NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `message` blob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `branch` varbinary(1024) DEFAULT NULL,
  `commit_oid` varchar(40) DEFAULT NULL,
  `directory` varbinary(1024) DEFAULT NULL,
  `base_branch` varbinary(1024) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
