DROP TABLE IF EXISTS `actions_key_values`;
CREATE TABLE `actions_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `partition_key` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_actions_key_values_on_partition_key_and_key` (`partition_key`,`key`),
  KEY `index_actions_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `artifacts`;
CREATE TABLE `artifacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_url` text NOT NULL,
  `name` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `size` bigint NOT NULL DEFAULT '0',
  `check_suite_id` bigint unsigned NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `workflow_run_id` bigint unsigned DEFAULT NULL,
  `expiration_emitted` tinyint(1) NOT NULL DEFAULT '0',
  `check_run_id` bigint unsigned DEFAULT NULL,
  `upload_hash` varchar(75) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_artifacts_on_check_suite_id_and_repository_id` (`check_suite_id`,`repository_id`),
  KEY `index_artifacts_on_repository_id_and_name` (`repository_id`,`name`),
  KEY `index_artifacts_on_repository_id_and_workflow_run_id` (`repository_id`,`workflow_run_id`),
  KEY `index_artifacts_on_repository_id_and_id` (`repository_id`,`id` DESC),
  KEY `index_artifacts_on_expiration_emitted_and_expires_at` (`expiration_emitted`,`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `artifacts_id_keyspace_idx`;
CREATE TABLE `artifacts_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `check_annotations`;
CREATE TABLE `check_annotations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `filename` varbinary(1024) NOT NULL,
  `warning_level` varchar(255) DEFAULT NULL,
  `message` blob NOT NULL,
  `start_line` int NOT NULL,
  `end_line` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `raw_details` text,
  `title` varbinary(1024) DEFAULT NULL,
  `check_run_id` bigint unsigned DEFAULT NULL,
  `start_column` int DEFAULT NULL,
  `end_column` int DEFAULT NULL,
  `suggested_change` blob,
  `check_suite_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `step_number` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_check_annotations_on_filename` (`filename`),
  KEY `index_check_annotations_on_check_run_id_and_repository_id` (`check_run_id`,`repository_id`),
  KEY `index_check_annotations_on_check_suite_id_and_repository_id` (`check_suite_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `check_annotations_id_keyspace_idx`;
CREATE TABLE `check_annotations_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `check_runs`;
CREATE TABLE `check_runs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `creator_id` int DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `conclusion` int DEFAULT NULL,
  `details_url` text,
  `name` varbinary(1024) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `external_id` varchar(255) DEFAULT NULL,
  `title` varbinary(1024) DEFAULT NULL,
  `summary` blob,
  `images` text,
  `text` blob,
  `check_suite_id` bigint unsigned NOT NULL,
  `actions` mediumblob,
  `number` int DEFAULT NULL,
  `completed_log_url` varbinary(1024) DEFAULT NULL,
  `completed_log_lines` int DEFAULT NULL,
  `streaming_log_url` text,
  `display_name` varbinary(1024) DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `check_suite_id_and_created_at_and_repository_id` (`check_suite_id`,`created_at`,`repository_id`),
  KEY `check_suite_id_and_name_and_completed_at_and_repository_id` (`check_suite_id`,`name`,`completed_at`,`repository_id`),
  KEY `check_suite_id_completed_at_name_display_name_repository_id` (`check_suite_id`,`completed_at`,`name`,`display_name`,`repository_id`),
  KEY `check_suite_id_and_name_and_created_at_and_repository_id` (`check_suite_id`,`name`,`created_at`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `check_runs_id_keyspace_idx`;
CREATE TABLE `check_runs_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `check_steps`;
CREATE TABLE `check_steps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `check_run_id` bigint unsigned NOT NULL,
  `number` int NOT NULL,
  `conclusion` int DEFAULT NULL,
  `name` varbinary(1024) NOT NULL,
  `completed_log_url` text,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `external_id` varchar(255) DEFAULT NULL,
  `completed_log_lines` int DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_check_steps_on_check_run_id_and_number_and_repository_id` (`check_run_id`,`number`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `check_steps_id_keyspace_idx`;
CREATE TABLE `check_steps_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `check_suites`;
CREATE TABLE `check_suites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `push_id` bigint DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `github_app_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `conclusion` int DEFAULT NULL,
  `head_branch` varbinary(1024) DEFAULT NULL,
  `head_sha` varchar(64) NOT NULL,
  `rerequestable` tinyint(1) NOT NULL DEFAULT '1',
  `check_runs_rerunnable` tinyint(1) NOT NULL DEFAULT '1',
  `hidden` tinyint(1) NOT NULL DEFAULT '0',
  `completed_log_url` varbinary(1024) DEFAULT NULL,
  `name` varbinary(1024) DEFAULT NULL,
  `event` varchar(50) DEFAULT NULL,
  `explicit_completion` tinyint(1) NOT NULL DEFAULT '0',
  `head_repository_id` bigint unsigned DEFAULT NULL,
  `workflow_file_path` varbinary(1024) DEFAULT NULL,
  `external_id` varchar(64) DEFAULT NULL COMMENT 'Supplied by creator to allow external systems to work with check suites idempotently',
  `action` varbinary(400) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `uniqueness_key` varchar(64) DEFAULT NULL,
  `archived_at` datetime(6) DEFAULT NULL,
  `is_archived` tinyint GENERATED ALWAYS AS ((`archived_at` is not null)) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `by_external_id_per_app` (`repository_id`,`github_app_id`,`external_id`),
  UNIQUE KEY `by_repo_app_uniqueness_key` (`repository_id`,`github_app_id`,`uniqueness_key`),
  KEY `index_check_suites_on_push_id` (`push_id`),
  KEY `index_check_suites_on_head_sha_and_repository_id` (`head_sha`,`repository_id`),
  KEY `index_check_suites_on_repository_id_and_hidden` (`repository_id`,`hidden`),
  KEY `index_check_suites_on_name` (`name`),
  KEY `index_check_suites_on_github_app_id_repository_id` (`github_app_id`,`repository_id`),
  KEY `by_repo_app_and_creator` (`repository_id`,`github_app_id`,`creator_id`),
  KEY `by_repo_app_and_head_branch` (`repository_id`,`github_app_id`,`head_branch`),
  KEY `by_repo_app_and_event` (`repository_id`,`github_app_id`,`event`),
  KEY `by_repo_app_and_status` (`repository_id`,`github_app_id`,`status`),
  KEY `by_repo_app_and_conclusion` (`repository_id`,`github_app_id`,`conclusion`),
  KEY `by_repo_app_and_name` (`repository_id`,`github_app_id`,`name`),
  KEY `index_check_suites_on_created_at_and_conclusion` (`created_at`,`conclusion`),
  KEY `check_suites_on_github_app_id_conclusion_updated_at_repository` (`github_app_id`,`conclusion`,`updated_at`,`repository_id`),
  KEY `index_check_suites_on_archived_at` (`archived_at`),
  KEY `index_check_suites_on_repository_id_is_archived_updated_at` (`repository_id`,`is_archived`,`updated_at`),
  KEY `index_check_suites_on_is_archived_updated_at` (`is_archived`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `check_suites_id_keyspace_idx`;
CREATE TABLE `check_suites_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `code_scanning_alerts`;
CREATE TABLE `code_scanning_alerts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `check_annotation_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `alert_number` int NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `check_run_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_code_scanning_alerts_on_check_annotation_id` (`check_annotation_id`),
  KEY `index_code_scanning_alerts_on_repo_and_number_and_check_run` (`repository_id`,`alert_number`,`check_run_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `code_scanning_alerts_id_keyspace_idx`;
CREATE TABLE `code_scanning_alerts_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `code_scanning_check_suites`;
CREATE TABLE `code_scanning_check_suites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `check_suite_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `base_ref` varbinary(1024) NOT NULL,
  `base_sha` varchar(64) NOT NULL,
  `pull_request_ref` varbinary(1024) NOT NULL,
  `pull_request_sha` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_code_scanning_check_suites_on_check_suite_id` (`check_suite_id`),
  KEY `index_code_scanning_check_suites_on_repository_id_and_base_sha` (`repository_id`,`base_sha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `code_scanning_check_suites_id_keyspace_idx`;
CREATE TABLE `code_scanning_check_suites_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `commit_rollups`;
CREATE TABLE `commit_rollups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `sha` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_on_commit_rollups_repository_id_and_sha` (`repository_id`,`sha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `commit_rollups_id_keyspace_idx`;
CREATE TABLE `commit_rollups_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pinned_workflows`;
CREATE TABLE `pinned_workflows` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workflow_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `pinned_by_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pinned_workflows_on_repository_id_and_workflow_id` (`repository_id`,`workflow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pinned_workflows_id_keyspace_idx`;
CREATE TABLE `pinned_workflows_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `statuses`;
CREATE TABLE `statuses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `state` varchar(20) NOT NULL DEFAULT 'unknown',
  `description` varchar(255) DEFAULT NULL,
  `target_url` blob,
  `sha` char(40) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `context` varchar(255) NOT NULL DEFAULT 'default',
  `oauth_application_id` bigint unsigned DEFAULT NULL,
  `tree_oid` binary(20) DEFAULT NULL,
  `commit_oid` binary(20) DEFAULT NULL,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `archived_at` datetime(6) DEFAULT NULL,
  `is_archived` tinyint GENERATED ALWAYS AS ((`archived_at` is not null)) VIRTUAL,
  PRIMARY KEY (`id`),
  KEY `index_statuses_on_sha_and_context_and_repository_id` (`sha`,`context`,`repository_id`),
  KEY `index_statuses_on_commit_oid_and_repository_id_and_context` (`commit_oid`,`repository_id`,`context`),
  KEY `index_statuses_on_repository_id_and_created_at_and_context` (`repository_id`,`created_at`,`context`),
  KEY `index_statuses_on_repository_id_and_sha_and_context` (`repository_id`,`sha`,`context`),
  KEY `index_statuses_on_archived_at` (`archived_at`),
  KEY `index_statuses_on_repository_id_is_archived_updated_at` (`repository_id`,`is_archived`,`updated_at`),
  KEY `index_statuses_on_is_archived_updated_at` (`is_archived`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `statuses_id_keyspace_idx`;
CREATE TABLE `statuses_id_keyspace_idx` (
  `id` bigint NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `workflow_job_runs`;
CREATE TABLE `workflow_job_runs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workflow_run_id` bigint unsigned NOT NULL,
  `check_run_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `parent_job_id` varchar(512) DEFAULT NULL,
  `job_key` varchar(512) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `concurrency` json DEFAULT NULL,
  `label_data` json DEFAULT NULL,
  `runner_id` bigint unsigned DEFAULT NULL,
  `runner_name` varchar(64) DEFAULT NULL,
  `runner_group_id` bigint unsigned DEFAULT NULL,
  `runner_group_name` varchar(128) DEFAULT NULL,
  `workflow_run_execution_id` bigint unsigned DEFAULT NULL,
  `original_workflow_run_execution_id` bigint unsigned DEFAULT NULL,
  `summary_url` text COLLATE utf8mb4_unicode_520_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_workflow_job_runs_on_repository_id_and_check_run_id` (`repository_id`,`check_run_id`),
  KEY `idx_repo_id_workflow_run_id_workflow_run_execution_id_job_key` (`repository_id`,`workflow_run_id`,`workflow_run_execution_id`,`job_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `workflow_job_runs_id_keyspace_idx`;
CREATE TABLE `workflow_job_runs_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `workflow_run_executions`;
CREATE TABLE `workflow_run_executions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status` int NOT NULL DEFAULT '0',
  `conclusion` int DEFAULT NULL,
  `workflow_run_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `external_id` binary(16) DEFAULT NULL,
  `completed_log_url` varbinary(1024) DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `attempt` int NOT NULL DEFAULT '1',
  `started_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `execution_graph` mediumblob,
  `referenced_workflows` blob,
  `run_stamp_url` varbinary(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_workflow_run_executions_on_repo_id_wf_run_id_attempt` (`repository_id`,`workflow_run_id`,`attempt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `workflow_run_executions_id_keyspace_idx`;
CREATE TABLE `workflow_run_executions_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `workflow_runs`;
CREATE TABLE `workflow_runs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `workflow_id` bigint unsigned NOT NULL,
  `check_suite_id` bigint unsigned NOT NULL,
  `run_number` int NOT NULL DEFAULT '0',
  `trigger_id` bigint DEFAULT NULL,
  `trigger_type` varchar(30) DEFAULT NULL,
  `event` varchar(50) DEFAULT NULL,
  `action` varbinary(400) DEFAULT NULL,
  `name` varbinary(1024) DEFAULT NULL,
  `head_branch` varbinary(1024) DEFAULT NULL,
  `head_sha` varchar(64) DEFAULT NULL,
  `workflow_file_path` varbinary(1024) DEFAULT NULL,
  `completed_log_url` varbinary(1024) DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `execution_graph` mediumblob,
  `concurrency` json DEFAULT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `actor_id` bigint unsigned DEFAULT NULL,
  `latest_workflow_run_execution_id` bigint unsigned DEFAULT NULL,
  `explicit_name` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether the workflow run was explicitly named',
  `tree_id` varchar(64) DEFAULT NULL,
  `cloned_workflow_run_id` bigint unsigned DEFAULT NULL,
  `logs_deleted_at` datetime DEFAULT NULL,
  `workflow_file_checkout_sha` varchar(64) DEFAULT NULL COMMENT 'Checkout SHA of the workflow file for a required workflow run. For normal workflows, head_sha is the checkout sha of the file and this will be NULL',
  `imposer_repository_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'Id of the repository where the required workflow file resides. Will be 0 for non required workflows',
  `workflow_file_ref` varbinary(1024) DEFAULT NULL COMMENT 'The branch name as determined by the ref used to select the workflow. Needed for ruleset workflows',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_workflow_runs_on_check_suite_id` (`check_suite_id`),
  KEY `index_workflow_runs_on_workflow_and_check_suite_and_run_number` (`workflow_id`,`check_suite_id`,`run_number`),
  KEY `index_workflow_runs_on_workflow_id_repository_id_user_hidden` (`workflow_id`,`repository_id`,`user_hidden`),
  KEY `index_workflow_runs_on_actor_id_user_hidden` (`actor_id`,`user_hidden`),
  KEY `index_workflow_runs_on_repository_id_and_event` (`repository_id`,`event`),
  KEY `index_workflow_runs_on_repository_id_workflow_id_event_tree_id` (`repository_id`,`workflow_id`,`event`,`tree_id`),
  KEY `index_workflow_runs_on_repository_id_user_hidden_imposer_repo_id` (`repository_id`,`user_hidden`,`imposer_repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `workflow_runs_id_keyspace_idx`;
CREATE TABLE `workflow_runs_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `workflows`;
CREATE TABLE `workflows` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `name` varbinary(1024) NOT NULL,
  `path` varbinary(1024) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `disabled_at` datetime DEFAULT NULL,
  `enabled_at` datetime DEFAULT NULL,
  `present_in_default_branch` tinyint(1) NOT NULL DEFAULT '0',
  `imposer_repository_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'Id of the repository where the required workflow file resides',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_workflows_on_repository_id_path_and_imposer_repository_id` (`repository_id`,`path`,`imposer_repository_id`),
  KEY `index_workflows_on_repository_id_and_state` (`repository_id`,`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `workflows_id_keyspace_idx`;
CREATE TABLE `workflows_id_keyspace_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
