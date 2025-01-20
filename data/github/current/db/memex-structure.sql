DROP TABLE IF EXISTS `draft_issues`;
CREATE TABLE `draft_issues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varbinary(1024) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `memex_project_item_id` bigint unsigned NOT NULL,
  `body` mediumblob,
  PRIMARY KEY (`id`),
  KEY `index_draft_issues_on_memex_project_item_id` (`memex_project_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_next_assignments`;
CREATE TABLE `issue_next_assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `target_type` enum('DraftIssue') COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `assignee_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_issue_next_assignments_on_target` (`target_type`,`target_id`),
  KEY `index_issue_next_assignments_on_assignee_and_target` (`assignee_id`,`target_type`,`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_key_values`;
CREATE TABLE `memex_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_key_values_on_key` (`key`),
  KEY `index_memex_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_project_charts`;
CREATE TABLE `memex_project_charts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `memex_project_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `number` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `configuration` json NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_project_charts_on_memex_project_id_and_number` (`memex_project_id`,`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_project_column_values`;
CREATE TABLE `memex_project_column_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `memex_project_column_id` bigint unsigned NOT NULL,
  `memex_project_item_id` bigint unsigned NOT NULL,
  `value` mediumblob,
  `creator_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `json_value` json DEFAULT NULL,
  `memex_project_column_data_type` tinyint DEFAULT NULL,
  `json_value_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_project_column_values_on_column_and_item` (`memex_project_column_id`,`memex_project_item_id`),
  KEY `index_memex_project_column_values_on_memex_project_item_id` (`memex_project_item_id`),
  KEY `index_mpcv_on_data_type_and_json_value_id` (`memex_project_column_data_type`,`json_value_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `memex_project_columns`;
CREATE TABLE `memex_project_columns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `memex_project_id` bigint unsigned NOT NULL,
  `name` varbinary(255) NOT NULL,
  `name_slug` varbinary(255) NOT NULL,
  `user_defined` tinyint(1) NOT NULL,
  `position` smallint NOT NULL,
  `visible` tinyint(1) NOT NULL,
  `data_type` tinyint NOT NULL,
  `settings` json DEFAULT NULL,
  `creator_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_project_columns_on_memex_project_id_and_position` (`memex_project_id`,`position`),
  UNIQUE KEY `index_memex_project_columns_on_project_and_name_slug` (`memex_project_id`,`name_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `memex_project_elasticsearch_consistency`;
CREATE TABLE `memex_project_elasticsearch_consistency` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `memex_project_id` bigint unsigned NOT NULL,
  `consistency` decimal(5,2) NOT NULL,
  `evaluated_at` datetime(6) DEFAULT NULL,
  `repair_started_at` datetime(6) DEFAULT NULL,
  `repair_finished_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_memex_project_id_c835b7f4ac` (`memex_project_id`),
  KEY `index_memex_project_elasticsearch_consistency_on_consistency` (`consistency`),
  KEY `idx_on_repair_started_at_9c291471b0` (`repair_started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_project_items`;
CREATE TABLE `memex_project_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `memex_project_id` bigint unsigned NOT NULL,
  `content_type` varchar(20) DEFAULT NULL,
  `content_id` bigint unsigned DEFAULT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `priority` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `archived_at` datetime(6) DEFAULT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `issue_id` bigint unsigned DEFAULT NULL,
  `archiver_id` bigint unsigned DEFAULT NULL,
  `issue_created_at` datetime DEFAULT NULL,
  `issue_closed_at` datetime DEFAULT NULL,
  `state` enum('closed','open') COLLATE utf8mb3_general_ci DEFAULT NULL,
  `state_reason` tinyint unsigned DEFAULT NULL,
  `priority_numerator` int DEFAULT NULL,
  `priority_denominator` int DEFAULT NULL,
  `virtual_priority` decimal(24,16) GENERATED ALWAYS AS ((cast(`priority_numerator` as decimal(24,16)) / `priority_denominator`)) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_project_items_on_memex_project_id_and_priority` (`memex_project_id`,`priority`),
  UNIQUE KEY `index_memex_items_on_repository_and_content_and_project` (`repository_id`,`content_type`,`content_id`,`memex_project_id`),
  UNIQUE KEY `index_memex_project_items_on_issue_id_and_memex_project_id` (`issue_id`,`memex_project_id`),
  UNIQUE KEY `index_memex_items_on_project_and_content` (`memex_project_id`,`content_id`,`content_type`),
  UNIQUE KEY `index_memex_items_on_memex_project_id_and_virtual_priority` (`memex_project_id`,`virtual_priority`),
  KEY `memex_project_items_on_creator_id_and_project_id_and_updated_at` (`creator_id`,`memex_project_id`,`updated_at`),
  KEY `memex_project_items_on_project_id_and_archived_at_and_priority` (`memex_project_id`,`archived_at`,`priority`),
  KEY `index_memex_project_items_on_creator_id_and_user_hidden` (`creator_id`,`user_hidden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `memex_project_links`;
CREATE TABLE `memex_project_links` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_id` bigint unsigned NOT NULL,
  `source_type` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `memex_project_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `position` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_project_links_on_source_id_source_type_project_id` (`source_id`,`source_type`,`memex_project_id`),
  KEY `index_memex_project_links_on_memex_project_id` (`memex_project_id`),
  KEY `idx_on_source_id_source_type_position_8e450a20d6` (`source_id`,`source_type`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_project_statuses`;
CREATE TABLE `memex_project_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `creator_id` bigint unsigned NOT NULL,
  `memex_project_id` bigint unsigned NOT NULL,
  `body` text COLLATE utf8mb4_unicode_520_ci,
  `status_value` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `status_id` varchar(25) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_memex_project_id` (`memex_project_id`),
  KEY `index_user_hidden_and_creator_id` (`user_hidden`,`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_project_views`;
CREATE TABLE `memex_project_views` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `memex_project_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `number` bigint unsigned NOT NULL,
  `name` varbinary(255) NOT NULL,
  `visible_fields` json NOT NULL,
  `group_by` json NOT NULL,
  `sort_by` json NOT NULL,
  `filter` varchar(256) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `layout` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `priority` bigint unsigned DEFAULT NULL,
  `vertical_group_by` json DEFAULT NULL,
  `aggregation_settings` json DEFAULT NULL,
  `layout_settings` json DEFAULT NULL,
  `slice_by` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_project_views_on_memex_project_id_and_number` (`memex_project_id`,`number`),
  UNIQUE KEY `index_memex_project_views_on_memex_project_id_and_priority` (`memex_project_id`,`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
DROP TABLE IF EXISTS `memex_project_visits`;
CREATE TABLE `memex_project_visits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `owner_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `viewer_id` bigint unsigned NOT NULL,
  `memex_project_id` bigint unsigned NOT NULL,
  `last_visited_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_project_visits_on_memex_project_id_and_viewer_id` (`memex_project_id`,`viewer_id`),
  KEY `index_memex_project_visits_on_viewer_id_and_owner_and_updated_at` (`viewer_id`,`owner_id`,`owner_type`,`last_visited_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_project_workflow_actions`;
CREATE TABLE `memex_project_workflow_actions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `action_type` tinyint NOT NULL,
  `arguments` json DEFAULT NULL,
  `creator_id` bigint unsigned DEFAULT NULL,
  `last_updater_id` bigint unsigned DEFAULT NULL,
  `memex_project_workflow_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `memex_project_column_id` bigint unsigned GENERATED ALWAYS AS (json_unquote(json_extract(`arguments`,_utf8mb4'$.fieldId'))) VIRTUAL,
  `option_id` varchar(8) COLLATE utf8mb4_unicode_520_ci GENERATED ALWAYS AS (json_unquote(json_extract(`arguments`,_utf8mb4'$.fieldOptionId'))) VIRTUAL,
  `repository_id` bigint GENERATED ALWAYS AS (json_unquote(json_extract(`arguments`,_utf8mb4'$.repositoryId'))) VIRTUAL,
  PRIMARY KEY (`id`),
  KEY `index_workflow_actions_on_workflow_id` (`memex_project_workflow_id`),
  KEY `index_mpwa_on_mpc_id_option_id_and_action_type` (`memex_project_column_id`,`option_id`,`action_type`),
  KEY `index_mpwa_on_repo_id_mpwa_type_and_mpw_id` (`repository_id`,`action_type`,`memex_project_workflow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_project_workflows`;
CREATE TABLE `memex_project_workflows` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `number` bigint unsigned NOT NULL,
  `trigger_type` tinyint NOT NULL,
  `content_types` json DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL,
  `creator_id` bigint unsigned DEFAULT NULL,
  `last_updater_id` bigint unsigned DEFAULT NULL,
  `memex_project_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_project_workflows_on_memex_project_id_and_number` (`memex_project_id`,`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_projects`;
CREATE TABLE `memex_projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_with_memex_template_id` bigint unsigned DEFAULT NULL,
  `owner_type` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `title` varbinary(1024) DEFAULT NULL,
  `description` mediumblob,
  `public` tinyint(1) NOT NULL DEFAULT '0',
  `closed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `number` bigint unsigned DEFAULT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `short_description` varchar(300) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by_id` bigint unsigned DEFAULT NULL,
  `last_visited_on` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_projects_on_number_and_owner_type_and_owner_id` (`number`,`owner_type`,`owner_id`),
  KEY `index_memex_projects_on_owner_closed_at_and_created_at` (`owner_id`,`owner_type`,`closed_at`,`created_at`),
  KEY `index_memex_projects_on_creator_id_and_user_hidden` (`creator_id`,`user_hidden`),
  KEY `index_memex_projects_on_owner_deleted_at_closed_at` (`owner_id`,`owner_type`,`deleted_at`,`closed_at`),
  KEY `index_memex_projects_on_created_with_memex_template_id` (`created_with_memex_template_id`),
  KEY `index_memex_projects_on_last_visited_on` (`last_visited_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_releases`;
CREATE TABLE `memex_releases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sha` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `branch` varbinary(1024) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `release_type` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_releases_on_sha` (`sha`),
  UNIQUE KEY `index_memex_releases_on_version` (`version`),
  KEY `index_memex_releases_on_branch` (`branch`),
  KEY `index_memex_releases_on_release_type` (`release_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `memex_templates`;
CREATE TABLE `memex_templates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `memex_project_id` bigint unsigned DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_memex_templates_on_memex_project_id` (`memex_project_id`),
  KEY `index_memex_templates_on_memex_project_id_and_active` (`memex_project_id`,`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `project_migrations`;
CREATE TABLE `project_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_project_id` bigint unsigned NOT NULL,
  `target_memex_project_id` bigint unsigned DEFAULT NULL,
  `status` tinyint unsigned NOT NULL DEFAULT '0',
  `requester_id` bigint unsigned NOT NULL,
  `last_retried_at` datetime(6) DEFAULT NULL,
  `last_migrated_project_item_id` bigint unsigned DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_project_migrations_on_source_id_and_target_id` (`source_project_id`,`target_memex_project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
