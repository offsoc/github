DROP TABLE IF EXISTS `actions_cache_usages_id_seq`;
CREATE TABLE `actions_cache_usages_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `actions_key_values_id_seq`;
CREATE TABLE `actions_key_values_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_assignments_id_seq`;
CREATE TABLE `archived_assignments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_commit_comments_id_seq`;
CREATE TABLE `archived_commit_comments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_deployment_statuses_id_seq`;
CREATE TABLE `archived_deployment_statuses_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_deployments_id_seq`;
CREATE TABLE `archived_deployments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_issue_comments_id_seq`;
CREATE TABLE `archived_issue_comments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_issue_event_details_id_seq`;
CREATE TABLE `archived_issue_event_details_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_issue_events_id_seq`;
CREATE TABLE `archived_issue_events_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_issues_id_seq`;
CREATE TABLE `archived_issues_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_labels_id_seq`;
CREATE TABLE `archived_labels_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_milestones_id_seq`;
CREATE TABLE `archived_milestones_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_pull_request_review_comments_id_seq`;
CREATE TABLE `archived_pull_request_review_comments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_pull_request_review_points_id_seq`;
CREATE TABLE `archived_pull_request_review_points_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_pull_request_review_threads_id_seq`;
CREATE TABLE `archived_pull_request_review_threads_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_pull_request_reviews_id_seq`;
CREATE TABLE `archived_pull_request_reviews_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_pull_request_reviews_review_requests_id_seq`;
CREATE TABLE `archived_pull_request_reviews_review_requests_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_pull_request_updates_id_seq`;
CREATE TABLE `archived_pull_request_updates_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_pull_requests_id_seq`;
CREATE TABLE `archived_pull_requests_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_review_request_reasons_id_seq`;
CREATE TABLE `archived_review_request_reasons_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `archived_review_requests_id_seq`;
CREATE TABLE `archived_review_requests_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `artifacts_id_seq`;
CREATE TABLE `artifacts_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `assignments_id_seq`;
CREATE TABLE `assignments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `auto_merge_requests_id_seq`;
CREATE TABLE `auto_merge_requests_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `check_annotations_id_seq`;
CREATE TABLE `check_annotations_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `check_runs_id_seq`;
CREATE TABLE `check_runs_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `check_steps_id_seq`;
CREATE TABLE `check_steps_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `check_suites_id_seq`;
CREATE TABLE `check_suites_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `code_scanning_alert_links_id_seq`;
CREATE TABLE `code_scanning_alert_links_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `code_scanning_alerts_id_seq`;
CREATE TABLE `code_scanning_alerts_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `code_scanning_check_suites_id_seq`;
CREATE TABLE `code_scanning_check_suites_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `code_scanning_review_comments_id_seq`;
CREATE TABLE `code_scanning_review_comments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `commit_comment_edits_id_seq`;
CREATE TABLE `commit_comment_edits_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `commit_comment_reactions_id_seq`;
CREATE TABLE `commit_comment_reactions_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `commit_comments_id_seq`;
CREATE TABLE `commit_comments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `commit_mentions_id_seq`;
CREATE TABLE `commit_mentions_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `commit_rollups_id_seq`;
CREATE TABLE `commit_rollups_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `copilot_code_review_orchestrations_id_seq`;
CREATE TABLE `copilot_code_review_orchestrations_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `cross_references_id_seq`;
CREATE TABLE `cross_references_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `deployment_statuses_id_seq`;
CREATE TABLE `deployment_statuses_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `deployments_id_seq`;
CREATE TABLE `deployments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `duplicate_issues_id_seq`;
CREATE TABLE `duplicate_issues_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_alert_links_id_seq`;
CREATE TABLE `issue_alert_links_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_blob_references_id_seq`;
CREATE TABLE `issue_blob_references_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_comment_edits_id_seq`;
CREATE TABLE `issue_comment_edits_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_comment_meta_data_blobs_id_seq`;
CREATE TABLE `issue_comment_meta_data_blobs_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_comment_orchestrations_id_seq`;
CREATE TABLE `issue_comment_orchestrations_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_comment_reactions_id_seq`;
CREATE TABLE `issue_comment_reactions_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_comments_id_seq`;
CREATE TABLE `issue_comments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_edits_id_seq`;
CREATE TABLE `issue_edits_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_event_authors_id_seq`;
CREATE TABLE `issue_event_authors_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_event_details_id_seq`;
CREATE TABLE `issue_event_details_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_events_id_seq`;
CREATE TABLE `issue_events_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_imports_id_seq`;
CREATE TABLE `issue_imports_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_links_id_seq`;
CREATE TABLE `issue_links_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_orchestrations_id_seq`;
CREATE TABLE `issue_orchestrations_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_priorities_id_seq`;
CREATE TABLE `issue_priorities_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_reactions_id_seq`;
CREATE TABLE `issue_reactions_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issue_types_id_seq`;
CREATE TABLE `issue_types_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issues_id_seq`;
CREATE TABLE `issues_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `issues_labels_id_seq`;
CREATE TABLE `issues_labels_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `labels_id_seq`;
CREATE TABLE `labels_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `last_seen_pull_request_revisions_id_seq`;
CREATE TABLE `last_seen_pull_request_revisions_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `milestones_id_seq`;
CREATE TABLE `milestones_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `notification_deliveries_seq`;
CREATE TABLE `notification_deliveries_seq` (
  `id` bigint NOT NULL,
  `next_id` bigint DEFAULT NULL,
  `cache` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `notification_entries_seq`;
CREATE TABLE `notification_entries_seq` (
  `id` bigint NOT NULL,
  `next_id` bigint DEFAULT NULL,
  `cache` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pinned_workflows_id_seq`;
CREATE TABLE `pinned_workflows_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_conflicts_id_seq`;
CREATE TABLE `pull_request_conflicts_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_last_pushes_id_seq`;
CREATE TABLE `pull_request_last_pushes_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_orchestrations_id_seq`;
CREATE TABLE `pull_request_orchestrations_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_review_comment_edits_id_seq`;
CREATE TABLE `pull_request_review_comment_edits_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_review_comment_orchestrations_id_seq`;
CREATE TABLE `pull_request_review_comment_orchestrations_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_review_comment_reactions_id_seq`;
CREATE TABLE `pull_request_review_comment_reactions_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_review_comments_id_seq`;
CREATE TABLE `pull_request_review_comments_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_review_edits_id_seq`;
CREATE TABLE `pull_request_review_edits_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_review_points_id_seq`;
CREATE TABLE `pull_request_review_points_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_review_reactions_id_seq`;
CREATE TABLE `pull_request_review_reactions_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_review_threads_id_seq`;
CREATE TABLE `pull_request_review_threads_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_reviews_id_seq`;
CREATE TABLE `pull_request_reviews_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_reviews_review_requests_id_seq`;
CREATE TABLE `pull_request_reviews_review_requests_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_sources_id_seq`;
CREATE TABLE `pull_request_sources_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_request_updates_id_seq`;
CREATE TABLE `pull_request_updates_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pull_requests_id_seq`;
CREATE TABLE `pull_requests_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `pushes_id_seq`;
CREATE TABLE `pushes_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `repository_issue_types_id_seq`;
CREATE TABLE `repository_issue_types_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `repository_milestones_sequences_id_seq`;
CREATE TABLE `repository_milestones_sequences_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `review_request_reasons_id_seq`;
CREATE TABLE `review_request_reasons_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `review_requests_id_seq`;
CREATE TABLE `review_requests_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `saved_notification_entries_seq`;
CREATE TABLE `saved_notification_entries_seq` (
  `id` bigint NOT NULL,
  `next_id` bigint DEFAULT NULL,
  `cache` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `statuses_id_seq`;
CREATE TABLE `statuses_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `sub_issue_lists_id_seq`;
CREATE TABLE `sub_issue_lists_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `sub_issues_id_seq`;
CREATE TABLE `sub_issues_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `workflow_job_runs_id_seq`;
CREATE TABLE `workflow_job_runs_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `workflow_run_executions_id_seq`;
CREATE TABLE `workflow_run_executions_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `workflow_runs_id_seq`;
CREATE TABLE `workflow_runs_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
DROP TABLE IF EXISTS `workflows_id_seq`;
CREATE TABLE `workflows_id_seq` (
  `id` bigint unsigned NOT NULL,
  `next_id` bigint unsigned DEFAULT NULL,
  `cache` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='vitess_sequence';
