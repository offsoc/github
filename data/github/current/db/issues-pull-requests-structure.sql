DROP TABLE IF EXISTS `archived_assignments`;
CREATE TABLE `archived_assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `assignee_id` bigint unsigned NOT NULL,
  `assignee_type` varchar(255) DEFAULT NULL,
  `issue_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_archived_assignments_on_issue_id_and_assignee_id` (`issue_id`,`assignee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_assignments_id_ks_idx`;
CREATE TABLE `archived_assignments_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_commit_comments`;
CREATE TABLE `archived_commit_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `body` mediumblob,
  `commit_id` varchar(40) NOT NULL,
  `path` varbinary(1024) DEFAULT NULL,
  `repository_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `line` int DEFAULT NULL,
  `position` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `formatter` varchar(30) DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `comment_hidden_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_archived_commit_comments_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_commit_comments_id_ks_idx`;
CREATE TABLE `archived_commit_comments_id_ks_idx` (
  `id` int NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_deployment_statuses`;
CREATE TABLE `archived_deployment_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `state` varchar(25) NOT NULL DEFAULT 'unknown',
  `description` text,
  `target_url` varbinary(1024) DEFAULT NULL,
  `deployment_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `environment_url` text,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `environment` varchar(255) DEFAULT NULL,
  `environment_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_deployment_statuses_on_deployment_id` (`deployment_id`),
  KEY `index_archived_deployment_statuses_on_environment_id` (`environment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_deployment_statuses_id_ks_idx`;
CREATE TABLE `archived_deployment_statuses_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_deployments`;
CREATE TABLE `archived_deployments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `description` blob,
  `payload` mediumblob,
  `sha` varchar(40) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `ref` varchar(255) DEFAULT NULL,
  `environment` varchar(255) DEFAULT 'production',
  `task` varchar(128) DEFAULT 'deploy',
  `transient_environment` tinyint(1) NOT NULL DEFAULT '0',
  `production_environment` tinyint(1) NOT NULL DEFAULT '0',
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `latest_deployment_status_id` bigint unsigned DEFAULT NULL,
  `latest_environment` varchar(255) DEFAULT NULL,
  `latest_status_state` varchar(25) DEFAULT NULL,
  `check_run_id` bigint DEFAULT NULL,
  `environment_id` bigint unsigned DEFAULT NULL,
  `latest_environment_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_deployments_on_repository_id_and_created_at` (`repository_id`,`created_at`),
  KEY `index_deployments_on_sha` (`sha`),
  KEY `index_archived_deployments_on_environment_id` (`environment_id`),
  KEY `index_archived_deployments_on_latest_environment_id` (`latest_environment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_deployments_id_ks_idx`;
CREATE TABLE `archived_deployments_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_issue_comments`;
CREATE TABLE `archived_issue_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `comment_hidden_by` int DEFAULT NULL,
  `compressed_body` mediumblob,
  PRIMARY KEY (`id`),
  KEY `index_issue_comments_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_issue_comments_id_ks_idx`;
CREATE TABLE `archived_issue_comments_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_issue_event_details`;
CREATE TABLE `archived_issue_event_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `issue_event_id` bigint unsigned NOT NULL,
  `label_id` bigint DEFAULT NULL,
  `label_name` varbinary(1024) DEFAULT NULL,
  `label_color` varchar(6) DEFAULT NULL,
  `label_text_color` varchar(6) DEFAULT NULL,
  `milestone_title` varbinary(1024) DEFAULT NULL,
  `subject_id` bigint unsigned DEFAULT NULL,
  `subject_type` varchar(20) DEFAULT NULL,
  `title_was` varbinary(1024) DEFAULT NULL,
  `title_is` varbinary(1024) DEFAULT NULL,
  `deployment_id` bigint unsigned DEFAULT NULL,
  `ref` varchar(255) DEFAULT NULL,
  `before_commit_oid` char(40) DEFAULT NULL,
  `after_commit_oid` char(40) DEFAULT NULL,
  `pull_request_review_state_was` int DEFAULT NULL,
  `message` mediumblob,
  `pull_request_review_id` bigint unsigned DEFAULT NULL,
  `column_name` varbinary(1024) DEFAULT NULL,
  `previous_column_name` varbinary(1024) DEFAULT NULL,
  `card_id` bigint unsigned DEFAULT NULL,
  `review_request_id` bigint unsigned DEFAULT NULL,
  `performed_by_project_workflow_action_id` bigint unsigned DEFAULT NULL,
  `lock_reason` varchar(30) DEFAULT NULL,
  `milestone_id` bigint unsigned DEFAULT NULL,
  `deployment_status_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `block_duration_days` int DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `state_reason` tinyint unsigned DEFAULT NULL,
  `project_id` bigint unsigned DEFAULT NULL,
  `project_previous_status` text,
  `project_status` text,
  PRIMARY KEY (`id`),
  KEY `index_archived_issue_event_details_on_issue_event_id` (`issue_event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_issue_event_details_id_ks_idx`;
CREATE TABLE `archived_issue_event_details_id_ks_idx` (
  `id` bigint NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_issue_events`;
CREATE TABLE `archived_issue_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned DEFAULT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `event` enum('abandoned_review','added_to_merge_queue','added_to_project','assigned','auto_merge_disabled','auto_merge_enabled','auto_rebase_enabled','auto_squash_enabled','automatic_base_change_failed','automatic_base_change_succeeded','base_ref_changed','base_ref_deleted','base_ref_force_pushed','closed','comment_deleted','connected','convert_to_draft','converted_note_to_issue','converted_to_discussion','demilestoned','deployed','deployment_environment_changed','disconnected','head_ref_cleaned','head_ref_deleted','head_ref_force_pushed','head_ref_restored','labeled','locked','marked_as_duplicate','mentioned','merged','milestoned','moved_columns_in_project','pinned','ready_for_review','referenced','removed_from_merge_queue','removed_from_project','renamed','reopened','reverted','review_abandoned','review_dismissed','review_request_removed','review_requested','review_unrequested','signoff','signoff_canceled','slash_command_executed','subscribed','transferred','unassigned','unlabeled','unlocked','unmarked_as_duplicate','unpinned','unsubscribed','user_blocked','converted_from_draft','added_to_project_v2','removed_from_project_v2','project_v2_item_status_changed') COLLATE utf8mb3_general_ci NOT NULL,
  `commit_id` varchar(40) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `commit_repository_id` bigint unsigned DEFAULT NULL,
  `referencing_issue_id` bigint unsigned DEFAULT NULL,
  `raw_data` blob,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `source_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_issue_events_event_source_id` (`event`,`source_id`),
  KEY `index_issue_events_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_issue_events_id_ks_idx`;
CREATE TABLE `archived_issue_events_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_issues`;
CREATE TABLE `archived_issues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `votes` int DEFAULT '0',
  `issue_comments_count` int DEFAULT '0',
  `number` int DEFAULT '0',
  `position` float DEFAULT '1',
  `title` varbinary(1024) DEFAULT NULL,
  `state` enum('closed','open') COLLATE utf8mb3_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `milestone_id` bigint unsigned DEFAULT NULL,
  `assignee_id` bigint unsigned DEFAULT NULL,
  `contributed_at_timestamp` bigint DEFAULT NULL,
  `contributed_at_offset` mediumint DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `has_pull_request` tinyint(1) GENERATED ALWAYS AS ((`pull_request_id` is not null)) VIRTUAL NOT NULL,
  `locked_at` datetime(6) DEFAULT NULL,
  `compressed_body` mediumblob,
  `state_reason` tinyint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_archived_issues_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_issues_id_ks_idx`;
CREATE TABLE `archived_issues_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_labels`;
CREATE TABLE `archived_labels` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varbinary(1024) NOT NULL,
  `color` varchar(10) DEFAULT NULL,
  `repository_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `lowercase_name` varbinary(1024) DEFAULT NULL,
  `description` varbinary(400) DEFAULT NULL,
  `label_name` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_labels_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_labels_id_ks_idx`;
CREATE TABLE `archived_labels_id_ks_idx` (
  `id` bigint NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_milestones`;
CREATE TABLE `archived_milestones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` mediumblob,
  `description` mediumblob,
  `due_on` datetime DEFAULT NULL,
  `created_by_id` int unsigned NOT NULL,
  `repository_id` int unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `state` varchar(30) DEFAULT NULL,
  `number` int unsigned DEFAULT '0',
  `open_issue_count` int unsigned DEFAULT '0',
  `closed_issue_count` int unsigned DEFAULT '0',
  `closed_at` timestamp NULL DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_milestones_on_due_on` (`due_on`),
  KEY `index_milestones_on_created_at` (`created_at`),
  KEY `index_milestones_on_created_by_id` (`created_by_id`),
  KEY `index_milestones_on_state` (`state`),
  KEY `index_milestones_on_number` (`number`),
  KEY `index_milestones_on_open_issue_count` (`open_issue_count`),
  KEY `index_milestones_on_closed_issue_count` (`closed_issue_count`),
  KEY `index_milestones_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_milestones_id_ks_idx`;
CREATE TABLE `archived_milestones_id_ks_idx` (
  `id` int unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_review_comments`;
CREATE TABLE `archived_pull_request_review_comments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `repository_id` int NOT NULL,
  `body` mediumblob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `state` int NOT NULL DEFAULT '0',
  `pull_request_review_id` int DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `reply_to_id` int DEFAULT NULL,
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `comment_hidden_by` int DEFAULT NULL,
  `pull_request_review_thread_id` int DEFAULT NULL,
  `has_body` tinyint(1) GENERATED ALWAYS AS (if(((`body` is not null) and (`body` > _utf8mb4'')),true,false)) VIRTUAL NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_archived_pull_request_review_comments_on_repository_id` (`repository_id`),
  KEY `index_archived_pull_request_review_comments_on_pull_request_id` (`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_review_comments_id_ks_idx`;
CREATE TABLE `archived_pull_request_review_comments_id_ks_idx` (
  `id` int unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_review_points`;
CREATE TABLE `archived_pull_request_review_points` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint NOT NULL,
  `pull_request_id` bigint NOT NULL,
  `pull_request_update_id` bigint NOT NULL,
  `number` int NOT NULL,
  `commits_count` int DEFAULT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_archived_pull_request_review_points_on_repository_id` (`repository_id`),
  KEY `index_archived_pull_request_review_points_on_pull_request_id` (`pull_request_id`),
  KEY `index_archived_pull_request_review_points_on_update_id` (`pull_request_update_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_review_points_id_ks_idx`;
CREATE TABLE `archived_pull_request_review_points_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_review_threads`;
CREATE TABLE `archived_pull_request_review_threads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pull_request_id` int DEFAULT NULL,
  `pull_request_review_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `resolver_id` int DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `path` varbinary(1024) DEFAULT NULL,
  `commit_id` char(40) DEFAULT NULL,
  `compressed_diff_hunk` mediumblob,
  `position` int unsigned DEFAULT NULL,
  `original_commit_id` char(40) DEFAULT NULL,
  `original_position` int unsigned DEFAULT NULL,
  `original_base_commit_id` char(40) DEFAULT NULL,
  `original_start_commit_id` char(40) DEFAULT NULL,
  `original_end_commit_id` char(40) DEFAULT NULL,
  `blob_position` int unsigned DEFAULT NULL,
  `blob_path` varbinary(1024) DEFAULT NULL,
  `blob_commit_oid` char(40) DEFAULT NULL,
  `left_blob` tinyint(1) NOT NULL DEFAULT '0',
  `outdated` tinyint(1) NOT NULL DEFAULT '0',
  `start_position_offset` int unsigned DEFAULT NULL,
  `repository_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_archived_pull_request_review_threads_on_pull_request_id` (`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_review_threads_id_ks_idx`;
CREATE TABLE `archived_pull_request_review_threads_id_ks_idx` (
  `id` int NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_reviews`;
CREATE TABLE `archived_pull_request_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `head_sha` char(40) NOT NULL,
  `body` mediumblob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `has_body` tinyint(1) GENERATED ALWAYS AS (if(((`body` is not null) and (`body` > _utf8mb4'')),true,false)) VIRTUAL NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `variant_type` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_archived_pull_request_reviews_on_pull_request_id` (`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_reviews_id_ks_idx`;
CREATE TABLE `archived_pull_request_reviews_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_reviews_review_requests`;
CREATE TABLE `archived_pull_request_reviews_review_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_review_id` bigint unsigned NOT NULL,
  `review_request_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_archived_pr_review_rev_reqs_on_request_id_and_pr_review_id` (`review_request_id`,`pull_request_review_id`),
  KEY `index_archived_pr_review_rev_reqs_on_pr_review_id_and_request_id` (`pull_request_review_id`,`review_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_reviews_review_requests_id_ks_idx`;
CREATE TABLE `archived_pull_request_reviews_review_requests_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_updates`;
CREATE TABLE `archived_pull_request_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint NOT NULL,
  `pull_request_id` bigint NOT NULL,
  `number` int NOT NULL,
  `base_oid` varchar(64) NOT NULL,
  `head_oid` varchar(64) NOT NULL,
  `merge_base_oid` varchar(64) DEFAULT NULL,
  `base_ref` varbinary(1024) NOT NULL,
  `commits_count` int NOT NULL,
  `reason` tinyint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `push_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `ready` tinyint(1) NOT NULL DEFAULT '0',
  `base_branch_head_oid` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_archived_pull_request_updates_on_repository_id` (`repository_id`),
  KEY `index_archived_pull_request_updates_on_pull_request_id` (`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_request_updates_id_ks_idx`;
CREATE TABLE `archived_pull_request_updates_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_requests`;
CREATE TABLE `archived_pull_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `base_sha` char(40) DEFAULT NULL,
  `head_sha` char(40) DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `base_repository_id` bigint unsigned DEFAULT NULL,
  `head_repository_id` bigint unsigned DEFAULT NULL,
  `base_ref` varbinary(1024) DEFAULT NULL,
  `head_ref` varbinary(1024) DEFAULT NULL,
  `merged_at` datetime DEFAULT NULL,
  `base_user_id` bigint unsigned DEFAULT NULL,
  `head_user_id` bigint unsigned DEFAULT NULL,
  `mergeable` tinyint unsigned DEFAULT NULL,
  `merge_commit_sha` char(40) DEFAULT NULL,
  `contributed_at_timestamp` bigint DEFAULT NULL,
  `contributed_at_offset` mediumint DEFAULT NULL,
  `fork_collab_state` int NOT NULL DEFAULT '0',
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `base_sha_on_merge` char(40) DEFAULT NULL,
  `work_in_progress` tinyint(1) NOT NULL DEFAULT '0',
  `reviewable_state` tinyint unsigned NOT NULL DEFAULT '0',
  `reviews_with_body_count` smallint unsigned DEFAULT NULL,
  `review_comments_with_body_count` smallint unsigned DEFAULT NULL,
  `state` enum('closed','open') COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pull_requests_on_repository_id_and_user_id` (`repository_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_pull_requests_id_ks_idx`;
CREATE TABLE `archived_pull_requests_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_review_request_reasons`;
CREATE TABLE `archived_review_request_reasons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_request_id` bigint unsigned NOT NULL,
  `codeowners_tree_oid` varchar(40) DEFAULT NULL,
  `codeowners_path` varchar(255) DEFAULT NULL,
  `codeowners_line` int DEFAULT NULL,
  `codeowners_pattern` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_archived_review_request_reasons_on_review_request_id` (`review_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_review_request_reasons_id_ks_idx`;
CREATE TABLE `archived_review_request_reasons_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_review_requests`;
CREATE TABLE `archived_review_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reviewer_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `reviewer_type` varchar(64) NOT NULL,
  `dismissed_at` datetime DEFAULT NULL,
  `deferred` tinyint(1) NOT NULL DEFAULT '0',
  `assigned_from_review_request_id` bigint unsigned DEFAULT NULL,
  `dismissed_via_assignment` tinyint(1) NOT NULL DEFAULT '0',
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_archived_review_requests_on_pull_request_id` (`pull_request_id`),
  KEY `index_archived_review_requests_on_pull_request_id_and_deferred` (`pull_request_id`,`deferred`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `archived_review_requests_id_ks_idx`;
CREATE TABLE `archived_review_requests_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `assignee_id` bigint unsigned NOT NULL,
  `assignee_type` varchar(255) DEFAULT NULL,
  `issue_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_assignments_on_issue_id_and_assignee_id` (`issue_id`,`assignee_id`),
  KEY `index_assignments_on_assignee_and_issue_id` (`assignee_id`,`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `assignments_id_ks_idx`;
CREATE TABLE `assignments_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `auto_merge_requests`;
CREATE TABLE `auto_merge_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `merge_method` int NOT NULL DEFAULT '0',
  `commit_title` varbinary(320) DEFAULT NULL,
  `commit_email_address_id` bigint unsigned DEFAULT NULL,
  `commit_message` blob,
  `merge_error` varchar(255) DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `actor_ip_address` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_auto_merge_requests_on_pull_request_id` (`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `auto_merge_requests_id_ks_idx`;
CREATE TABLE `auto_merge_requests_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `code_scanning_review_comments`;
CREATE TABLE `code_scanning_review_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `pull_request_review_comment_id` bigint unsigned NOT NULL,
  `alert_number` bigint unsigned NOT NULL,
  `fixed` tinyint(1) NOT NULL DEFAULT '0',
  `warning_level` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `tool_name` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `alert_title` varbinary(1024) DEFAULT NULL,
  `alert_message` blob NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_csrc_on_pull_request_review_comment_id` (`pull_request_review_comment_id`),
  KEY `index_csrc_repo_pr_review_comment` (`repository_id`,`pull_request_id`,`pull_request_review_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `code_scanning_review_comments_id_ks_idx`;
CREATE TABLE `code_scanning_review_comments_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `commit_comment_edits`;
CREATE TABLE `commit_comment_edits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `commit_comment_id` bigint unsigned NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` bigint unsigned DEFAULT NULL,
  `diff` mediumblob,
  `user_content_edit_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_commit_comment_edits_on_user_content_edit_id` (`user_content_edit_id`),
  KEY `index_commit_comment_edits_on_commit_comment_id` (`commit_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `commit_comment_edits_id_ks_idx`;
CREATE TABLE `commit_comment_edits_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `commit_comment_edits_on_user_content_edit_id_ks_idx`;
CREATE TABLE `commit_comment_edits_on_user_content_edit_id_ks_idx` (
  `user_content_edit_id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`user_content_edit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `commit_comment_reactions`;
CREATE TABLE `commit_comment_reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `commit_comment_id` bigint unsigned NOT NULL,
  `content` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_commit_comment_reactions_identity` (`user_id`,`commit_comment_id`,`content`),
  KEY `index_on_comment_id_content_created_at` (`commit_comment_id`,`content`,`created_at`),
  KEY `index_on_user_hidden_user_id` (`user_hidden`,`user_id`),
  KEY `index_on_comment_id_user_hidden_created_at` (`commit_comment_id`,`user_hidden`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `commit_comment_reactions_id_ks_idx`;
CREATE TABLE `commit_comment_reactions_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `commit_comments`;
CREATE TABLE `commit_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `body` mediumblob,
  `commit_id` varchar(40) NOT NULL,
  `path` varbinary(1024) DEFAULT NULL,
  `repository_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `line` int DEFAULT NULL,
  `position` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `formatter` varchar(30) DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `comment_hidden_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_commit_comments_on_repository_id_and_user_id` (`repository_id`,`user_id`),
  KEY `index_commit_comments_on_user_hidden_and_user_id` (`user_hidden`,`user_id`),
  KEY `index_commit_comments_on_repo_commit_ids_and_user_hidden` (`repository_id`,`commit_id`,`user_hidden`),
  KEY `index_commit_comments_on_repo_id_and_user_hidden_and_user_id` (`repository_id`,`user_hidden`,`user_id`),
  KEY `index_commit_comments_on_commit_id` (`commit_id`),
  KEY `index_commit_comments_on_user_id_and_created_at` (`user_id`,`created_at`),
  KEY `index_commit_comments_on_user_id_and_updated_at` (`user_id`,`updated_at`),
  KEY `index_commit_comments_on_user_id_and_repository_id` (`user_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `commit_comments_id_ks_idx`;
CREATE TABLE `commit_comments_id_ks_idx` (
  `id` int NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `commit_mentions`;
CREATE TABLE `commit_mentions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` int unsigned DEFAULT NULL,
  `commit_id` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_commit_mentions_on_commit_id_and_repository_id` (`commit_id`,`repository_id`),
  KEY `index_commit_mentions_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `commit_mentions_id_ks_idx`;
CREATE TABLE `commit_mentions_id_ks_idx` (
  `id` int unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `copilot_code_review_orchestrations`;
CREATE TABLE `copilot_code_review_orchestrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `type` varchar(59) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `step_name` varchar(70) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `data` text COLLATE utf8mb4_unicode_520_ci,
  `attempts` int NOT NULL DEFAULT '0',
  `parent_id` bigint unsigned DEFAULT NULL,
  `error_message` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `copilot_code_review_orchestrations_id_ks_idx`;
CREATE TABLE `copilot_code_review_orchestrations_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `cross_references`;
CREATE TABLE `cross_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_id` bigint unsigned NOT NULL,
  `source_type` varchar(255) NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `target_type` varchar(255) NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `referenced_at` datetime DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `source_repository_id` bigint unsigned DEFAULT NULL,
  `target_repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_references_natural_key_unique` (`source_id`,`source_type`,`target_id`,`target_type`),
  KEY `index_cross_references_on_user_hidden_and_actor_id` (`user_hidden`,`actor_id`),
  KEY `index_cross_references_on_actor_id` (`actor_id`),
  KEY `index_target_and_source_type_id_actor_id_user_hidden_created_at` (`target_type`,`target_id`,`source_type`,`source_id`,`actor_id`,`user_hidden`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `cross_references_id_ks_idx`;
CREATE TABLE `cross_references_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `deployment_statuses`;
CREATE TABLE `deployment_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `state` varchar(25) NOT NULL DEFAULT 'unknown',
  `description` text,
  `target_url` varbinary(1024) DEFAULT NULL,
  `deployment_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `environment_url` text,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `environment` varchar(255) DEFAULT NULL,
  `environment_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_deployment_statuses_on_deployment_id` (`deployment_id`),
  KEY `index_deployment_statuses_on_deployment_id_and_environment` (`deployment_id`,`environment`),
  KEY `index_deployment_statuses_on_environment_id` (`environment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `deployment_statuses_id_ks_idx`;
CREATE TABLE `deployment_statuses_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `deployments`;
CREATE TABLE `deployments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `description` blob,
  `payload` mediumblob,
  `sha` varchar(40) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `creator_id` bigint unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `ref` varbinary(1024) DEFAULT NULL,
  `environment` varchar(255) DEFAULT 'production',
  `task` varchar(128) DEFAULT 'deploy',
  `transient_environment` tinyint(1) NOT NULL DEFAULT '0',
  `production_environment` tinyint(1) NOT NULL DEFAULT '0',
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `latest_deployment_status_id` bigint unsigned DEFAULT NULL,
  `latest_environment` varchar(255) DEFAULT NULL,
  `latest_status_state` varchar(25) DEFAULT NULL,
  `check_run_id` bigint DEFAULT NULL,
  `environment_id` bigint unsigned DEFAULT NULL,
  `latest_environment_id` bigint unsigned DEFAULT NULL,
  `tree_oid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_deployments_on_repository_environment_prod_and_transient` (`repository_id`,`environment`,`production_environment`,`transient_environment`),
  KEY `index_deployments_on_repository_latest_env_created_at` (`repository_id`,`latest_environment`,`created_at`),
  KEY `index_deployments_on_sha_repository_latest_env_created_at` (`repository_id`,`sha`,`latest_environment`,`created_at`),
  KEY `index_deployments_on_repository_latest_status_state` (`repository_id`,`latest_environment`,`latest_status_state`),
  KEY `index_deployments_on_check_run_id` (`check_run_id`),
  KEY `index_deployments_on_repo_id_created_and_latest_environment` (`repository_id`,`created_at`,`latest_environment`),
  KEY `index_deployments_on_repository_id_and_tree_oid` (`repository_id`,`tree_oid`),
  KEY `index_deployments_on_repository_id_latest_status_and_created` (`repository_id`,`latest_status_state`,`created_at`),
  KEY `index_deployments_on_repository_id_ref_and_created` (`repository_id`,`ref`,`created_at`),
  KEY `index_deployments_on_repository_id_creator_id_and_created` (`repository_id`,`creator_id`,`created_at`),
  KEY `index_deployments_on_repository_id_environment_and_created` (`repository_id`,`environment`,`created_at`),
  KEY `index_deployments_on_repository_id_latest_status_transient` (`repository_id`,`latest_environment`,`latest_status_state`,`transient_environment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `deployments_id_ks_idx`;
CREATE TABLE `deployments_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `duplicate_issues`;
CREATE TABLE `duplicate_issues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `canonical_issue_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `duplicate` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_dupe_issues_on_issue_id_canonical_issue_id` (`issue_id`,`canonical_issue_id`),
  KEY `idx_dupe_issues_on_canonical_issue_id_issue_id_duplicate` (`canonical_issue_id`,`issue_id`,`duplicate`),
  KEY `index_duplicate_issues_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `duplicate_issues_id_ks_idx`;
CREATE TABLE `duplicate_issues_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `ipr_key_values`;
CREATE TABLE `ipr_key_values` (
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `value` blob NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`repository_id`,`key`),
  KEY `index_ipr_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_alert_links`;
CREATE TABLE `issue_alert_links` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `alert_number` int unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `alert_repository_id` bigint unsigned NOT NULL,
  `alert_type` int unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_alert_links_alert_repo_type_number_issue` (`alert_repository_id`,`alert_type`,`alert_number`,`issue_id`),
  KEY `index_issue_alert_links_on_issue_id` (`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_alert_links_id_ks_idx`;
CREATE TABLE `issue_alert_links_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_blob_references`;
CREATE TABLE `issue_blob_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `blob_oid` varchar(40) NOT NULL,
  `commit_oid` varchar(40) NOT NULL,
  `issue_id` bigint unsigned NOT NULL,
  `filepath` varchar(255) NOT NULL,
  `range_start` int NOT NULL,
  `range_end` int NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_blob_references_on_all_columns` (`issue_id`,`blob_oid`,`commit_oid`,`filepath`,`range_start`,`range_end`),
  KEY `index_issue_blob_references_on_issue_id` (`issue_id`),
  KEY `index_issue_blob_references_on_blob_oid` (`blob_oid`),
  KEY `index_issue_blob_references_on_commit_oid` (`commit_oid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_blob_references_id_ks_idx`;
CREATE TABLE `issue_blob_references_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_comment_edits`;
CREATE TABLE `issue_comment_edits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_comment_id` bigint unsigned NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` bigint unsigned DEFAULT NULL,
  `user_content_edit_id` bigint unsigned DEFAULT NULL,
  `compressed_diff` mediumblob,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_comment_edits_on_user_content_edit_id` (`user_content_edit_id`),
  KEY `index_issue_comment_edits_on_issue_comment_id` (`issue_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_comment_edits_id_ks_idx`;
CREATE TABLE `issue_comment_edits_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_comment_edits_on_user_content_edit_id_ks_idx`;
CREATE TABLE `issue_comment_edits_on_user_content_edit_id_ks_idx` (
  `user_content_edit_id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`user_content_edit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_comment_meta_data_blobs`;
CREATE TABLE `issue_comment_meta_data_blobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint NOT NULL,
  `issue_comment_id` bigint NOT NULL,
  `submitter_type` varchar(128) NOT NULL,
  `submitter_id` varchar(128) NOT NULL,
  `data` blob NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_comment_meta_data_blobs_on_submitter_and_comment` (`submitter_id`,`submitter_type`,`issue_comment_id`),
  KEY `index_issue_comment_meta_data_blobs_on_repository_id` (`repository_id`),
  KEY `index_issue_comment_meta_data_blobs_on_issue_comment_id` (`issue_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_comment_meta_data_blobs_id_ks_idx`;
CREATE TABLE `issue_comment_meta_data_blobs_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_comment_orchestrations`;
CREATE TABLE `issue_comment_orchestrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned DEFAULT NULL,
  `issue_comment_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `type` varchar(47) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `step_name` varchar(70) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `data` text COLLATE utf8mb4_unicode_520_ci,
  `attempts` int NOT NULL DEFAULT '0',
  `parent_id` bigint unsigned DEFAULT NULL,
  `error_message` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_state_updated_at` (`state`,`updated_at`),
  KEY `index_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_comment_orchestrations_id_ks_idx`;
CREATE TABLE `issue_comment_orchestrations_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_comment_reactions`;
CREATE TABLE `issue_comment_reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_comment_id` bigint unsigned NOT NULL,
  `content` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_comment_reactions_identity` (`user_id`,`issue_comment_id`,`content`),
  KEY `index_on_comment_id_content_created_at` (`issue_comment_id`,`content`,`created_at`),
  KEY `index_on_user_hidden_user_id` (`user_hidden`,`user_id`),
  KEY `index_on_comment_id_user_hidden_created_at` (`issue_comment_id`,`user_hidden`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_comment_reactions_id_ks_idx`;
CREATE TABLE `issue_comment_reactions_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_comments`;
CREATE TABLE `issue_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `comment_hidden_by` int DEFAULT NULL,
  `compressed_body` mediumblob,
  PRIMARY KEY (`id`),
  KEY `index_issue_comments_on_repository_id_and_created_at` (`repository_id`,`created_at`),
  KEY `index_issue_comments_on_repository_id_and_issue_id_and_user_id` (`repository_id`,`issue_id`,`user_id`),
  KEY `index_issue_comments_on_user_hidden_and_user_id` (`user_hidden`,`user_id`),
  KEY `index_issue_comments_on_repo_user_id_user_hidden_and_issue_id` (`repository_id`,`user_id`,`user_hidden`,`issue_id`),
  KEY `index_issue_comments_on_user_id_and_created_at` (`user_id`,`created_at`),
  KEY `index_issue_comments_on_user_id_and_updated_at` (`user_id`,`updated_at`),
  KEY `index_issue_comments_on_user_id_repo_id_user_hidden_updated_at` (`user_id`,`repository_id`,`user_hidden`,`updated_at`),
  KEY `index_issue_comments_on_issue_id_and_user_hidden_user_id` (`issue_id`,`user_hidden`,`user_id`),
  KEY `index_on_issue_id_and_user_id_user_hidden_created_at` (`issue_id`,`user_id`,`user_hidden`,`created_at`),
  KEY `index_issue_comments_on_repo_updated_id_user_hidden_user_issue` (`repository_id`,`updated_at`,`id`,`user_hidden`,`user_id`,`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_comments_id_ks_idx`;
CREATE TABLE `issue_comments_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_edits`;
CREATE TABLE `issue_edits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` bigint unsigned DEFAULT NULL,
  `user_content_edit_id` bigint unsigned DEFAULT NULL,
  `compressed_diff` mediumblob,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_issue_edits_on_issue_id` (`issue_id`),
  KEY `index_issue_edits_on_user_content_edit_id` (`user_content_edit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_edits_id_ks_idx`;
CREATE TABLE `issue_edits_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_edits_on_user_content_edit_id_ks_idx`;
CREATE TABLE `issue_edits_on_user_content_edit_id_ks_idx` (
  `user_content_edit_id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`user_content_edit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_event_authors`;
CREATE TABLE `issue_event_authors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `author_id` bigint unsigned NOT NULL,
  `issue_event_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_issue_event_authors_on_author_id` (`author_id`),
  KEY `index_issue_event_authors_on_issue_event_id` (`issue_event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_event_authors_id_ks_idx`;
CREATE TABLE `issue_event_authors_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_event_details`;
CREATE TABLE `issue_event_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `issue_event_id` bigint unsigned NOT NULL,
  `label_id` bigint DEFAULT NULL,
  `label_name` varbinary(1024) DEFAULT NULL,
  `label_color` varchar(6) DEFAULT NULL,
  `label_text_color` varchar(6) DEFAULT NULL,
  `milestone_title` varbinary(1024) DEFAULT NULL,
  `subject_id` bigint unsigned DEFAULT NULL,
  `subject_type` varchar(20) DEFAULT NULL,
  `title_was` varbinary(1024) DEFAULT NULL,
  `title_is` varbinary(1024) DEFAULT NULL,
  `deployment_id` bigint unsigned DEFAULT NULL,
  `ref` varchar(255) DEFAULT NULL,
  `before_commit_oid` char(40) DEFAULT NULL,
  `after_commit_oid` char(40) DEFAULT NULL,
  `pull_request_review_state_was` int DEFAULT NULL,
  `message` mediumblob,
  `pull_request_review_id` bigint unsigned DEFAULT NULL,
  `column_name` varbinary(1024) DEFAULT NULL,
  `previous_column_name` varbinary(1024) DEFAULT NULL,
  `card_id` bigint unsigned DEFAULT NULL,
  `review_request_id` bigint unsigned DEFAULT NULL,
  `performed_by_project_workflow_action_id` bigint unsigned DEFAULT NULL,
  `lock_reason` varchar(30) DEFAULT NULL,
  `milestone_id` bigint unsigned DEFAULT NULL,
  `deployment_status_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `block_duration_days` int DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `state_reason` tinyint unsigned DEFAULT NULL,
  `project_id` bigint unsigned DEFAULT NULL,
  `project_previous_status` text,
  `project_status` text,
  PRIMARY KEY (`id`),
  KEY `index_issue_event_details_on_issue_event_id_and_subject_type` (`issue_event_id`,`subject_type`),
  KEY `index_issue_event_details_on_subject_id_and_subject_type` (`subject_id`,`subject_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_event_details_id_ks_idx`;
CREATE TABLE `issue_event_details_id_ks_idx` (
  `id` bigint NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_events`;
CREATE TABLE `issue_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned DEFAULT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `event` enum('abandoned_review','added_to_merge_queue','added_to_project','assigned','auto_merge_disabled','auto_merge_enabled','auto_rebase_enabled','auto_squash_enabled','automatic_base_change_failed','automatic_base_change_succeeded','base_ref_changed','base_ref_deleted','base_ref_force_pushed','closed','comment_deleted','connected','convert_to_draft','converted_note_to_issue','converted_to_discussion','demilestoned','deployed','deployment_environment_changed','disconnected','head_ref_cleaned','head_ref_deleted','head_ref_force_pushed','head_ref_restored','labeled','locked','marked_as_duplicate','mentioned','merged','milestoned','moved_columns_in_project','pinned','ready_for_review','referenced','removed_from_merge_queue','removed_from_project','renamed','reopened','reverted','review_abandoned','review_dismissed','review_request_removed','review_requested','review_unrequested','signoff','signoff_canceled','slash_command_executed','subscribed','transferred','unassigned','unlabeled','unlocked','unmarked_as_duplicate','unpinned','unsubscribed','user_blocked','converted_from_draft','added_to_project_v2','removed_from_project_v2','project_v2_item_status_changed') COLLATE utf8mb3_general_ci NOT NULL,
  `commit_id` varchar(40) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `commit_repository_id` bigint unsigned DEFAULT NULL,
  `referencing_issue_id` bigint unsigned DEFAULT NULL,
  `raw_data` blob,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `source_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_events_on_issue_id_and_event_and_commit_id` (`issue_id`,`event`,`commit_id`),
  UNIQUE KEY `index_issue_events_on_issue_id_and_ref_issue_id` (`issue_id`,`event`,`referencing_issue_id`),
  UNIQUE KEY `idx_issue_events_event_source_id` (`event`,`source_id`),
  KEY `index_issue_events_on_repository_id_event` (`repository_id`,`event`),
  KEY `index_issue_events_on_repo_id_issue_id_and_event` (`repository_id`,`issue_id`,`event`),
  KEY `index_issue_events_on_issue_id_and_commit_id` (`issue_id`,`commit_id`),
  KEY `index_issue_events_on_actor_id_and_event_and_created_at` (`actor_id`,`event`,`created_at`),
  KEY `index_issue_events_on_repository_id_and_created_at` (`repository_id`,`created_at`),
  KEY `index_issue_events_on_issue_id_and_event_and_created_at` (`issue_id`,`event`,`created_at`),
  KEY `index_issue_events_on_issue_id_event_ref_id_commit_rep_id_act_id` (`issue_id`,`event`,`referencing_issue_id`,`commit_repository_id`,`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_events_id_ks_idx`;
CREATE TABLE `issue_events_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_imports`;
CREATE TABLE `issue_imports` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` int unsigned DEFAULT NULL,
  `importer_id` int unsigned DEFAULT NULL,
  `raw_data` blob,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_issue_imports_on_repository_id_and_created_at` (`repository_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_imports_id_ks_idx`;
CREATE TABLE `issue_imports_id_ks_idx` (
  `id` int unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_links`;
CREATE TABLE `issue_links` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_issue_id` bigint unsigned NOT NULL,
  `target_issue_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `link_type` int NOT NULL,
  `source_repository_id` bigint unsigned NOT NULL,
  `target_repository_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_links_source_target_type` (`source_issue_id`,`target_issue_id`,`link_type`),
  KEY `index_issue_links_source_target_type_and_created_at` (`source_issue_id`,`target_issue_id`,`link_type`,`created_at`),
  KEY `target_issue_id_and_link_type_and_created_at_and_source_issue_id` (`target_issue_id`,`link_type`,`created_at`,`source_issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_links_id_ks_idx`;
CREATE TABLE `issue_links_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_orchestrations`;
CREATE TABLE `issue_orchestrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `type` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `step_name` varchar(70) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `data` text COLLATE utf8mb4_unicode_520_ci,
  `attempts` int NOT NULL DEFAULT '0',
  `parent_id` bigint unsigned DEFAULT NULL,
  `error_message` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_issue_orchestrations_on_repository_id_issue_id_type_state` (`repository_id`,`issue_id`,`type`,`state`),
  KEY `index_state_updated_at` (`state`,`updated_at`),
  KEY `index_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_orchestrations_id_ks_idx`;
CREATE TABLE `issue_orchestrations_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_priorities`;
CREATE TABLE `issue_priorities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `milestone_id` bigint unsigned NOT NULL,
  `priority` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_priorities_on_issue_id_and_milestone_id` (`issue_id`,`milestone_id`),
  UNIQUE KEY `index_issue_priorities_on_milestone_id_and_priority` (`milestone_id`,`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_priorities_id_ks_idx`;
CREATE TABLE `issue_priorities_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_reactions`;
CREATE TABLE `issue_reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `content` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_reactions_identity` (`user_id`,`issue_id`,`content`),
  KEY `index_on_issue_id_content_created_at` (`issue_id`,`content`,`created_at`),
  KEY `index_on_user_hidden_user_id` (`user_hidden`,`user_id`),
  KEY `index_on_issue_id_user_hidden_created_at` (`issue_id`,`user_hidden`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_reactions_id_ks_idx`;
CREATE TABLE `issue_reactions_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_types`;
CREATE TABLE `issue_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `issue_type` tinyint unsigned NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `private` tinyint(1) NOT NULL DEFAULT '0',
  `name` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `color` tinyint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_types_on_name_and_owner_id` (`name`,`owner_id`),
  KEY `index_issue_types_owner` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issue_types_id_ks_idx`;
CREATE TABLE `issue_types_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `issues`;
CREATE TABLE `issues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `issue_comments_count` int DEFAULT '0',
  `number` int DEFAULT '0',
  `position` float DEFAULT '1',
  `title` varbinary(1024) DEFAULT NULL,
  `state` enum('closed','open') COLLATE utf8mb3_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `milestone_id` bigint unsigned DEFAULT NULL,
  `assignee_id` bigint unsigned DEFAULT NULL,
  `contributed_at_timestamp` bigint DEFAULT NULL,
  `contributed_at_offset` mediumint DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `has_pull_request` tinyint(1) GENERATED ALWAYS AS ((`pull_request_id` is not null)) VIRTUAL NOT NULL,
  `locked_at` datetime(6) DEFAULT NULL,
  `compressed_body` mediumblob,
  `state_reason` tinyint unsigned DEFAULT NULL,
  `issue_type_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issues_on_pull_request_id_unique` (`pull_request_id`),
  KEY `index_issues_on_milestone_id` (`milestone_id`),
  KEY `index_issues_on_user_id_and_state_and_pull_request_id` (`user_id`,`state`,`pull_request_id`),
  KEY `index_issues_on_repository_id_and_number` (`repository_id`,`number`),
  KEY `index_issues_on_user_id_and_user_hidden` (`user_id`,`user_hidden`),
  KEY `index_issues_on_repository_id_and_user_id` (`repository_id`,`user_id`),
  KEY `index_issues_on_repository_id_and_state_and_user_hidden` (`repository_id`,`state`,`user_hidden`),
  KEY `repository_id_and_state_and_pull_request_id_and_user` (`repository_id`,`state`,`pull_request_id`,`user_hidden`,`user_id`),
  KEY `index_issues_on_repository_id_and_pull_request_id_and_created_at` (`repository_id`,`pull_request_id`,`created_at`),
  KEY `index_issues_on_repository_id_and_pull_request_id_and_closed_at` (`repository_id`,`pull_request_id`,`closed_at`),
  KEY `index_issues_on_user_id_and_repository_id` (`user_id`,`repository_id`),
  KEY `index_issues_on_repository_id_and_user_hidden_and_user_id` (`repository_id`,`user_hidden`,`user_id`),
  KEY `repository_id_and_updated_at_and_state_and_pr_id_and_user` (`repository_id`,`updated_at`,`state`,`pull_request_id`,`user_hidden`,`user_id`),
  KEY `repository_id_and_created_at_and_state_and_pr_id_and_user` (`repository_id`,`created_at`,`state`,`pull_request_id`,`user_hidden`,`user_id`,`updated_at`),
  KEY `index_issues_on_user_id_and_created_at_and_pull_request_id` (`user_id`,`created_at`,`pull_request_id`),
  KEY `issues_on_repository_id_state_created_at_id_user_hidden_user_id` (`repository_id`,`state`,`created_at`,`id`,`user_hidden`,`user_id`,`pull_request_id`,`updated_at`),
  KEY `issues_on_repository_id_state_updated_at_id_user_hidden_user_id` (`repository_id`,`state`,`updated_at`,`id`,`user_hidden`,`user_id`,`pull_request_id`,`created_at`),
  KEY `index_issues_on_issue_type_id` (`issue_type_id`),
  KEY `repo_id_and_state_and_has_pr_and_created_at_and_user_and_pr_id` (`repository_id`,`state`,`has_pull_request`,`created_at`,`id`,`user_hidden`,`user_id`,`pull_request_id`),
  KEY `index_issues_repo_updated_at_id_pr_state_user_hidden_user` (`repository_id`,`updated_at`,`id`,`has_pull_request`,`state`,`user_hidden`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issues_id_ks_idx`;
CREATE TABLE `issues_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issues_labels`;
CREATE TABLE `issues_labels` (
  `issue_id` bigint unsigned DEFAULT NULL,
  `label_id` bigint DEFAULT NULL,
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issues_labels_on_issue_id_and_label_id` (`issue_id`,`label_id`),
  KEY `index_issues_labels_on_label_id_and_issue_id` (`label_id`,`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issues_labels_id_ks_idx`;
CREATE TABLE `issues_labels_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `labels`;
CREATE TABLE `labels` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varbinary(1024) NOT NULL,
  `color` varchar(10) DEFAULT NULL,
  `repository_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `lowercase_name` varbinary(1024) DEFAULT NULL,
  `description` varbinary(400) DEFAULT NULL,
  `label_name` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_labels_on_repository_id_and_label_name` (`repository_id`,`label_name`),
  KEY `index_labels_on_name` (`name`),
  KEY `index_labels_on_repository_id_and_name` (`repository_id`,`name`),
  KEY `index_labels_on_repository_id_and_lowercase_name` (`repository_id`,`lowercase_name`(15)),
  KEY `index_labels_on_label_name` (`label_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `labels_id_ks_idx`;
CREATE TABLE `labels_id_ks_idx` (
  `id` bigint NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `last_seen_pull_request_revisions`;
CREATE TABLE `last_seen_pull_request_revisions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `last_revision` varbinary(20) NOT NULL,
  `hidden` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_last_seen_pr_on_pr_id_and_user_id_and_updated_at` (`pull_request_id`,`user_id`,`updated_at`),
  KEY `index_last_seen_pr_on_user_id_and_updated_at` (`user_id`,`updated_at`),
  KEY `index_last_seen_pull_request_revisions_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `last_seen_pull_request_revisions_id_ks_idx`;
CREATE TABLE `last_seen_pull_request_revisions_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `merge_commit_requests`;
CREATE TABLE `merge_commit_requests` (
  `repository_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `processing` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'the state of the request to create a merge commit',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`repository_id`,`pull_request_id`,`created_at`),
  UNIQUE KEY `index_repo_id_processing_pull_id_on_merge_commit_requests` (`repository_id`,`processing`,`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `milestones`;
CREATE TABLE `milestones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` mediumblob,
  `description` mediumblob,
  `due_on` datetime DEFAULT NULL,
  `created_by_id` int unsigned NOT NULL,
  `repository_id` int unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `state` varchar(30) DEFAULT NULL,
  `number` int unsigned DEFAULT '0',
  `open_issue_count` int unsigned DEFAULT '0',
  `closed_issue_count` int unsigned DEFAULT '0',
  `closed_at` timestamp NULL DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_milestones_on_created_by_id` (`created_by_id`),
  KEY `index_milestones_on_number` (`number`),
  KEY `index_milestones_on_repository_id` (`repository_id`),
  KEY `index_milestones_on_user_hidden_and_created_by_id` (`user_hidden`,`created_by_id`),
  KEY `index_milestones_on_repository_id_and_updated_at` (`repository_id`,`updated_at`),
  KEY `index_milestones_on_repository_id_and_state_and_updated_at` (`repository_id`,`state`,`updated_at`),
  KEY `index_milestones_on_repository_id_and_due_on` (`repository_id`,`due_on`),
  KEY `index_milestones_on_repository_id_and_state_and_due_on` (`repository_id`,`state`,`due_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `milestones_id_ks_idx`;
CREATE TABLE `milestones_id_ks_idx` (
  `id` int unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_conflicts`;
CREATE TABLE `pull_request_conflicts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned NOT NULL,
  `base_sha` varchar(255) NOT NULL,
  `head_sha` varchar(255) NOT NULL,
  `info` blob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `conflict_type` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pull_conflicts_on_pull_id_and_type` (`pull_request_id`,`conflict_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_conflicts_id_ks_idx`;
CREATE TABLE `pull_request_conflicts_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_last_pushes`;
CREATE TABLE `pull_request_last_pushes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `push_id` bigint unsigned NOT NULL,
  `head_sha` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_repository_id_pull_request_id_5220804e2a` (`repository_id`,`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_last_pushes_id_ks_idx`;
CREATE TABLE `pull_request_last_pushes_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_orchestrations`;
CREATE TABLE `pull_request_orchestrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `type` varchar(46) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `step_name` varchar(70) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `data` text COLLATE utf8mb4_unicode_520_ci,
  `attempts` int NOT NULL DEFAULT '0',
  `parent_id` bigint unsigned DEFAULT NULL,
  `error_message` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pull_orchestrations_on_pull_id_repository_id_type_state` (`pull_request_id`,`repository_id`,`type`,`state`),
  KEY `index_pull_request_orchestrations_on_state_and_updated_at` (`state`,`updated_at`),
  KEY `index_pull_request_orchestrations_on_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_orchestrations_id_ks_idx`;
CREATE TABLE `pull_request_orchestrations_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_review_comment_edits`;
CREATE TABLE `pull_request_review_comment_edits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_review_comment_id` bigint unsigned NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` bigint unsigned DEFAULT NULL,
  `diff` mediumblob,
  `user_content_edit_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pull_request_review_comment_edits_on_user_content_edit_id` (`user_content_edit_id`),
  KEY `index_on_pull_request_review_comment_id` (`pull_request_review_comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_comment_edits_id_ks_idx`;
CREATE TABLE `pull_request_review_comment_edits_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_comment_edits_on_user_content_edit_id_ks_idx`;
CREATE TABLE `pull_request_review_comment_edits_on_user_content_edit_id_ks_idx` (
  `user_content_edit_id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`user_content_edit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_comment_orchestrations`;
CREATE TABLE `pull_request_review_comment_orchestrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `pull_request_review_comment_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `type` varchar(59) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `step_name` varchar(70) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `data` text COLLATE utf8mb4_unicode_520_ci,
  `attempts` int NOT NULL DEFAULT '0',
  `parent_id` bigint unsigned DEFAULT NULL,
  `error_message` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_review_comment_orchestrations_id_ks_idx`;
CREATE TABLE `pull_request_review_comment_orchestrations_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_review_comment_reactions`;
CREATE TABLE `pull_request_review_comment_reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_review_comment_id` bigint unsigned NOT NULL,
  `content` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pull_request_review_comment_reactions_identity` (`user_id`,`pull_request_review_comment_id`,`content`),
  KEY `index_on_comment_id_content_created_at` (`pull_request_review_comment_id`,`content`,`created_at`),
  KEY `index_on_user_hidden_user_id` (`user_hidden`,`user_id`),
  KEY `index_on_comment_id_user_hidden_created_at` (`pull_request_review_comment_id`,`user_hidden`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_review_comment_reactions_id_ks_idx`;
CREATE TABLE `pull_request_review_comment_reactions_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_comments`;
CREATE TABLE `pull_request_review_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `body` mediumblob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `pull_request_review_id` bigint unsigned DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `reply_to_id` bigint unsigned DEFAULT NULL,
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `comment_hidden_by` int DEFAULT NULL,
  `pull_request_review_thread_id` bigint unsigned DEFAULT NULL,
  `has_body` tinyint(1) GENERATED ALWAYS AS (if(((`body` is not null) and (`body` > _utf8mb4'')),true,false)) VIRTUAL NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pr_review_comments_on_pr_id_and_created_at` (`pull_request_id`,`created_at`),
  KEY `index_pull_request_review_comments_on_repo_id_updated_at` (`repository_id`,`updated_at`),
  KEY `index_pull_request_review_comments_on_repository_id_and_user_id` (`repository_id`,`user_id`),
  KEY `index_pr_review_comments_on_reply_to_id` (`reply_to_id`),
  KEY `index_pull_request_review_comments_on_user_id_and_user_hidden` (`user_id`,`user_hidden`),
  KEY `index_pull_request_review_comments_on_repo_id_state_and_user_id` (`repository_id`,`state`,`user_id`),
  KEY `index_pr_review_comments_on_pr_id_user_hidden_user_id_and_state` (`pull_request_id`,`user_hidden`,`user_id`,`state`),
  KEY `index_pr_review_comments_on_user_hidden_and_user_id` (`user_hidden`,`user_id`),
  KEY `index_pull_request_review_comments_on_repo_and_hidden_and_user` (`repository_id`,`user_hidden`,`user_id`),
  KEY `index_pull_request_review_comments_on_pr_review_thread_id` (`pull_request_review_thread_id`),
  KEY `index_pull_request_review_comments_on_user_id_and_created_at` (`user_id`,`created_at`),
  KEY `index_pull_request_review_comments_on_user_id_and_updated_at` (`user_id`,`updated_at`),
  KEY `pull_request_review_id_and_reply_to_id` (`pull_request_review_id`,`reply_to_id`),
  KEY `index_pr_review_comments_on_repo_state_updated_user_hidden_user` (`repository_id`,`state`,`updated_at`,`user_hidden`,`user_id`),
  KEY `index_pr_review_comments_on_repo_state_created_at` (`repository_id`,`state`,`created_at`),
  KEY `pr_review_comments_on_pull_request_id_and_state_and_has_body` (`pull_request_id`,`state`,`has_body`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_comments_id_ks_idx`;
CREATE TABLE `pull_request_review_comments_id_ks_idx` (
  `id` int unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_edits`;
CREATE TABLE `pull_request_review_edits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_review_id` bigint unsigned NOT NULL,
  `edited_at` datetime NOT NULL,
  `editor_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `performed_by_integration_id` bigint unsigned DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_id` bigint unsigned DEFAULT NULL,
  `diff` mediumblob,
  `user_content_edit_id` bigint unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pull_request_review_edits_on_user_content_edit_id` (`user_content_edit_id`),
  KEY `index_pull_request_review_edits_on_pull_request_review_id` (`pull_request_review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_edits_id_ks_idx`;
CREATE TABLE `pull_request_review_edits_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_edits_on_user_content_edit_id_ks_idx`;
CREATE TABLE `pull_request_review_edits_on_user_content_edit_id_ks_idx` (
  `user_content_edit_id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`user_content_edit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_points`;
CREATE TABLE `pull_request_review_points` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint NOT NULL,
  `pull_request_id` bigint NOT NULL,
  `pull_request_update_id` bigint NOT NULL,
  `number` int NOT NULL,
  `commits_count` int DEFAULT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pull_request_review_points_on_pull_and_update_and_number` (`pull_request_id`,`pull_request_update_id`,`number`),
  KEY `index_pull_request_review_points_on_repository_id` (`repository_id`),
  KEY `index_pull_request_review_points_on_pull_request_update_id` (`pull_request_update_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_points_id_ks_idx`;
CREATE TABLE `pull_request_review_points_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_reactions`;
CREATE TABLE `pull_request_review_reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_review_id` bigint unsigned NOT NULL,
  `content` varchar(30) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pull_request_review_reactions_identity` (`user_id`,`pull_request_review_id`,`content`),
  KEY `index_on_review_id_content_created_at` (`pull_request_review_id`,`content`,`created_at`),
  KEY `index_on_user_hidden_user_id` (`user_hidden`,`user_id`),
  KEY `index_on_review_id_user_hidden_created_at` (`pull_request_review_id`,`user_hidden`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_review_reactions_id_ks_idx`;
CREATE TABLE `pull_request_review_reactions_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_threads`;
CREATE TABLE `pull_request_review_threads` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned DEFAULT NULL,
  `pull_request_review_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `resolver_id` bigint unsigned DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `path` varbinary(1024) DEFAULT NULL,
  `commit_id` char(40) DEFAULT NULL,
  `compressed_diff_hunk` mediumblob,
  `position` int unsigned DEFAULT NULL,
  `original_commit_id` char(40) DEFAULT NULL,
  `original_position` int unsigned DEFAULT NULL,
  `original_base_commit_id` char(40) DEFAULT NULL,
  `original_start_commit_id` char(40) DEFAULT NULL,
  `original_end_commit_id` char(40) DEFAULT NULL,
  `blob_position` int unsigned DEFAULT NULL,
  `blob_path` varbinary(1024) DEFAULT NULL,
  `blob_commit_oid` char(40) DEFAULT NULL,
  `left_blob` tinyint(1) NOT NULL DEFAULT '0',
  `outdated` tinyint(1) NOT NULL DEFAULT '0',
  `start_position_offset` int unsigned DEFAULT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `subject_type` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_pull_request_review_threads_on_pr_id_and_pr_review_id` (`pull_request_id`,`pull_request_review_id`),
  KEY `index_pull_request_review_threads_on_pull_request_review_id` (`pull_request_review_id`),
  KEY `index_pr_review_threads_on_repo_id_and_path_and_created_at` (`repository_id`,`path`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_review_threads_id_ks_idx`;
CREATE TABLE `pull_request_review_threads_id_ks_idx` (
  `id` int NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_reviews`;
CREATE TABLE `pull_request_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '0',
  `head_sha` char(40) NOT NULL,
  `body` mediumblob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `comment_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `comment_hidden_reason` varbinary(1024) DEFAULT NULL,
  `comment_hidden_classifier` varchar(50) DEFAULT NULL,
  `has_body` tinyint(1) GENERATED ALWAYS AS (if(((`body` is not null) and (`body` > _utf8mb4'')),true,false)) VIRTUAL NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `variant_type` tinyint unsigned NOT NULL DEFAULT '0',
  `merge_base_sha` char(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pull_request_reviews_on_user_id_and_submitted_at` (`user_id`,`submitted_at`),
  KEY `index_reviews_pull_request_user_state` (`pull_request_id`,`user_hidden`,`user_id`,`state`),
  KEY `index_pull_request_reviews_on_user_hidden_and_user_id` (`user_hidden`,`user_id`),
  KEY `index_pull_request_reviews_on_user_id_and_user_hidden` (`user_id`,`user_hidden`),
  KEY `index_pull_request_reviews_on_pull_request_id_and_created_at` (`pull_request_id`,`created_at`),
  KEY `index_pull_request_reviews_on_pull_request_id_and_submitted_at` (`pull_request_id`,`submitted_at`),
  KEY `pull_request_reviews_on_pull_request_id_and_state_and_has_body` (`pull_request_id`,`state`,`has_body`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_reviews_id_ks_idx`;
CREATE TABLE `pull_request_reviews_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_reviews_review_requests`;
CREATE TABLE `pull_request_reviews_review_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_review_id` bigint unsigned NOT NULL,
  `review_request_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pr_reviews_review_requests_on_request_id_and_pr_review_id` (`review_request_id`,`pull_request_review_id`),
  KEY `index_pr_reviews_review_requests_on_pr_review_id_and_request_id` (`pull_request_review_id`,`review_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_reviews_review_requests_id_ks_idx`;
CREATE TABLE `pull_request_reviews_review_requests_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_sources`;
CREATE TABLE `pull_request_sources` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `pull_request_id` bigint unsigned NOT NULL,
  `source` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pull_request_sources_on_pull_request_id` (`pull_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pull_request_sources_id_ks_idx`;
CREATE TABLE `pull_request_sources_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_updates`;
CREATE TABLE `pull_request_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint NOT NULL,
  `pull_request_id` bigint NOT NULL,
  `number` int NOT NULL,
  `base_oid` varchar(64) NOT NULL,
  `head_oid` varchar(64) NOT NULL,
  `merge_base_oid` varchar(64) DEFAULT NULL,
  `base_ref` varbinary(1024) NOT NULL,
  `commits_count` int NOT NULL,
  `reason` tinyint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `push_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `ready` tinyint(1) NOT NULL DEFAULT '0',
  `base_branch_head_oid` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_pull_request_updates_on_pull_and_number` (`pull_request_id`,`number`),
  KEY `index_pull_request_updates_on_repository_id` (`repository_id`),
  KEY `index_pull_request_updates_on_pull_request_id_and_ready` (`pull_request_id`,`ready`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_request_updates_id_ks_idx`;
CREATE TABLE `pull_request_updates_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_requests`;
CREATE TABLE `pull_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `base_sha` char(40) DEFAULT NULL,
  `head_sha` char(40) DEFAULT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `base_repository_id` bigint unsigned DEFAULT NULL,
  `head_repository_id` bigint unsigned DEFAULT NULL,
  `base_ref` varbinary(1024) DEFAULT NULL,
  `head_ref` varbinary(1024) DEFAULT NULL,
  `merged_at` datetime DEFAULT NULL,
  `base_user_id` bigint unsigned DEFAULT NULL,
  `head_user_id` bigint unsigned DEFAULT NULL,
  `mergeable` tinyint unsigned DEFAULT NULL,
  `merge_commit_sha` char(40) DEFAULT NULL,
  `contributed_at_timestamp` bigint DEFAULT NULL,
  `contributed_at_offset` mediumint DEFAULT NULL,
  `fork_collab_state` int NOT NULL DEFAULT '0',
  `user_hidden` tinyint NOT NULL DEFAULT '0',
  `base_sha_on_merge` char(40) DEFAULT NULL,
  `work_in_progress` tinyint(1) NOT NULL DEFAULT '0',
  `reviewable_state` tinyint unsigned NOT NULL DEFAULT '0',
  `reviews_with_body_count` smallint unsigned DEFAULT NULL,
  `review_comments_with_body_count` smallint unsigned DEFAULT NULL,
  `state` enum('closed','open') COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pull_requests_on_base_repository_id_and_base_ref` (`base_repository_id`,`base_ref`(767)),
  KEY `index_pull_requests_on_base_repository_id_and_head_ref` (`base_repository_id`,`head_ref`(767)),
  KEY `index_pull_requests_on_repository_id_and_head_ref` (`repository_id`,`head_ref`(767)),
  KEY `index_pull_requests_on_repository_id_and_user_id_and_user_hidden` (`repository_id`,`user_id`,`user_hidden`),
  KEY `index_pull_requests_on_user_hidden_and_user_id` (`user_hidden`,`user_id`),
  KEY `index_pull_requests_on_repository_id_and_head_sha` (`repository_id`,`head_sha`),
  KEY `index_pull_requests_on_user_id_and_created_at` (`user_id`,`created_at`),
  KEY `index_pull_requests_on_user_id_and_repository_id` (`user_id`,`repository_id`),
  KEY `index_pull_requests_on_repository_id_and_updated_at` (`repository_id`,`updated_at`),
  KEY `index_pull_requests_on_repository_id_and_created_at` (`repository_id`,`created_at`),
  KEY `head_repository_id_and_head_ref_and_head_sha_and_repository_id` (`head_repository_id`,`head_ref`,`head_sha`,`repository_id`),
  KEY `index_pull_requests_on_repository_id_and_merged_at` (`repository_id`,`merged_at`),
  KEY `index_prs_on_repo_id_user_id_user_hidden_merged_at_created_at` (`repository_id`,`user_id`,`user_hidden`,`merged_at`,`created_at`),
  KEY `index_pull_requests_on_repository_id_and_work_in_progress` (`repository_id`,`work_in_progress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `pull_requests_id_ks_idx`;
CREATE TABLE `pull_requests_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_issue_types`;
CREATE TABLE `repository_issue_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `issue_type_id` bigint unsigned NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_issue_types_on_repository_id_and_issue_type_id` (`repository_id`,`issue_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_issue_types_id_ks_idx`;
CREATE TABLE `repository_issue_types_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_milestones_sequences`;
CREATE TABLE `repository_milestones_sequences` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint NOT NULL,
  `number` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_milestones_sequences_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `repository_milestones_sequences_id_ks_idx`;
CREATE TABLE `repository_milestones_sequences_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `review_request_reasons`;
CREATE TABLE `review_request_reasons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_request_id` bigint unsigned NOT NULL,
  `codeowners_tree_oid` varchar(40) DEFAULT NULL,
  `codeowners_path` varchar(255) DEFAULT NULL,
  `codeowners_line` int DEFAULT NULL,
  `codeowners_pattern` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_review_request_reasons_on_review_request_id` (`review_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `review_request_reasons_id_ks_idx`;
CREATE TABLE `review_request_reasons_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `review_requests`;
CREATE TABLE `review_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reviewer_id` bigint unsigned NOT NULL,
  `pull_request_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `reviewer_type` varchar(64) NOT NULL DEFAULT 'User',
  `dismissed_at` datetime DEFAULT NULL,
  `deferred` tinyint(1) NOT NULL DEFAULT '0',
  `assigned_from_review_request_id` bigint unsigned DEFAULT NULL,
  `dismissed_via_assignment` tinyint(1) NOT NULL DEFAULT '0',
  `repository_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_review_requests_on_reviewer_id_and_reviewer_type` (`reviewer_id`,`reviewer_type`),
  KEY `index_review_requests_on_pr_id_and_reviewer_type_and_reviewer_id` (`pull_request_id`,`reviewer_type`,`reviewer_id`),
  KEY `index_review_requests_on_pull_request_id_and_dismissed_at` (`pull_request_id`,`dismissed_at`),
  KEY `index_review_requests_on_pull_request_id_and_deferred` (`pull_request_id`,`deferred`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `review_requests_id_ks_idx`;
CREATE TABLE `review_requests_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sub_issue_lists`;
CREATE TABLE `sub_issue_lists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `total` int NOT NULL,
  `completed` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `height` tinyint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sub_issue_lists_on_issue_id` (`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sub_issue_lists_id_ks_idx`;
CREATE TABLE `sub_issue_lists_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sub_issues`;
CREATE TABLE `sub_issues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_issue_id` bigint unsigned NOT NULL,
  `source_repository_id` bigint unsigned NOT NULL,
  `target_issue_id` bigint unsigned NOT NULL,
  `priority` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `user_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sub_issues_on_source_issue_id_and_priority` (`source_issue_id`,`priority`),
  UNIQUE KEY `index_sub_issues_on_source_issue_id_and_target_issue_id` (`source_issue_id`,`target_issue_id`),
  KEY `index_sub_issues_on_source_repository_id_and_source_issue_id` (`source_repository_id`,`source_issue_id`),
  KEY `index_sub_issues_on_target_issue_id` (`target_issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sub_issues_id_ks_idx`;
CREATE TABLE `sub_issues_id_ks_idx` (
  `id` bigint unsigned NOT NULL,
  `keyspace_id` varbinary(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
