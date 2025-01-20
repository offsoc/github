DROP TABLE IF EXISTS `allowed_secrets`;
CREATE TABLE `allowed_secrets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `owner_scope_id` bigint unsigned NOT NULL,
  `created_by` bigint unsigned NOT NULL,
  `updated_by` bigint unsigned NOT NULL,
  `signature` varbinary(32) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `notes` varchar(2048) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_owner_scope_signature` (`owner_scope_id`,`signature`),
  KEY `idx_owner_scope_deleted_created` (`owner_scope_id`,`is_deleted`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `audit_token_scan_results`;
CREATE TABLE `audit_token_scan_results` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `token_scan_result_id` bigint unsigned NOT NULL COMMENT 'token_scan_results.id parent record to which this alert event belongs',
  `active_from` datetime(3) NOT NULL COMMENT 'token_scan_result.updated_at column value before it was moved to this audit table',
  `resolution` int DEFAULT NULL COMMENT 'audited; internal enum/iota within the token-scanning-service representing the resolution (e.g., revoked, false positive)',
  `resolver_id` bigint unsigned DEFAULT NULL COMMENT 'audited; if resolution is not null, this represents the github login ID that applied <resolutions>',
  `resolved_at` datetime(3) DEFAULT NULL COMMENT 'audited; if resolution is not null, the timestamp <resolution> was applied by <resolver_id>',
  `resolved` tinyint(1) NOT NULL COMMENT 'audited; boolean field based on the <resolution> field above; some non-null resolutions are considered false here (e.g., re-opened)',
  `first_location_id` bigint unsigned DEFAULT NULL COMMENT 'audited; the first location_id associated with this token scan result',
  `has_valid_locations` tinyint(1) NOT NULL COMMENT 'audited; boolean; this is a performnce-only column useful as an index, which is based on whether first_location_id > 0',
  `resolution_comment` varchar(280) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL COMMENT 'audited; user-provided comment explaining the resolution status, if any',
  `validity` tinyint DEFAULT NULL COMMENT 'internal enum/iota within the token-scanning-service representing validity',
  `publicly_leaked` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'whether this token has been leaked in a public repository',
  `internally_leaked` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'whether this token has been leaked in another repository within the same owner or enterprise',
  PRIMARY KEY (`id`),
  KEY `index_on_token_scan_result_id_and_active_from` (`token_scan_result_id`,`active_from`) COMMENT 'supports queries to get all resolutions for a token scan result and sorting by active_from'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='audit table for token_scan_results; audited columns are columns on token_scan_results that trigger inserts to this table when those columns are updated';
DROP TABLE IF EXISTS `dry_run_scan_results`;
CREATE TABLE `dry_run_scan_results` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `custom_pattern_id` bigint unsigned NOT NULL COMMENT 'id for custom pattern whose dry run results are being persisted',
  `repository_id` bigint unsigned NOT NULL COMMENT 'repository where the dry run scan was initiated',
  `scan_id` bigint unsigned NOT NULL COMMENT 'id for scan that that is associated with this dry run result',
  `token_signature` varbinary(32) NOT NULL COMMENT 'sha256 hash of the raw secret that was discovered stored as binary',
  `locations` blob NOT NULL COMMENT 'blob that holds a binary protobuf serialization of locations where the token was found in a scan. Limited to 5',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_dry_run_scan_results_on_pattern_repository_scan_signature` (`custom_pattern_id`,`repository_id`,`scan_id`,`token_signature`),
  KEY `index_dry_run_scan_results_on_pattern_created_at` (`custom_pattern_id`,`created_at`),
  KEY `index_dry_run_scan_results_on_created_at` (`created_at`),
  KEY `index_dry_run_scan_results_on_scan_id` (`scan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `owner_scopes`;
CREATE TABLE `owner_scopes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL COMMENT 'repository, organization or business id; disambiguated via owner_scope',
  `owner_scope` enum('REPO','ORG','BIZ','USER') COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'scope for owner_id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_owner_id_scope` (`owner_id`,`owner_scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pending_partner_token_notifications`;
CREATE TABLE `pending_partner_token_notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `blob_oid` varchar(40) NOT NULL,
  `commit_oid` varchar(40) NOT NULL,
  `start_line` int NOT NULL DEFAULT '0',
  `end_line` int NOT NULL DEFAULT '0',
  `start_column` int NOT NULL DEFAULT '0',
  `end_column` int NOT NULL DEFAULT '0',
  `path` varbinary(1024) NOT NULL,
  `token_type` varchar(64) NOT NULL,
  `requested_at` datetime(6) NOT NULL,
  `notification_state` tinyint NOT NULL DEFAULT '0',
  `retry_count` int NOT NULL DEFAULT '0',
  `repository_type` tinyint NOT NULL DEFAULT '0',
  `token_signature` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pending_partner_token_notifications_on_state_repo_id` (`notification_state`,`repository_id`),
  KEY `index_pending_partner_token_notifications_on_state_token_type` (`notification_state`,`token_type`),
  KEY `index_pending_partner_token_notifications_on_repo_type_blob` (`repository_id`,`token_type`,`blob_oid`),
  KEY `index_pptn_on_updated_at_notification_state_retry_count` (`updated_at`,`notification_state`,`retry_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `secret_scan_custom_patterns`;
CREATE TABLE `secret_scan_custom_patterns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `owner_id` bigint DEFAULT NULL,
  `repository_id` bigint DEFAULT NULL,
  `scope` int NOT NULL DEFAULT '0',
  `secret_type` varchar(512) NOT NULL,
  `slug` varchar(256) NOT NULL,
  `display_name` varchar(256) NOT NULL,
  `expression` varbinary(1024) NOT NULL,
  `post_processing_expressions` json DEFAULT NULL,
  `created_by_id` bigint unsigned DEFAULT NULL,
  `state` tinyint NOT NULL DEFAULT '0',
  `business_id` bigint unsigned DEFAULT NULL,
  `updated_by_id` bigint unsigned DEFAULT NULL,
  `origin_id` bigint unsigned DEFAULT NULL COMMENT 'the identifier to a custom pattern that this one is derived from',
  `owner_scope_id` bigint unsigned DEFAULT NULL COMMENT 'the identifier for the owner scope that maps to this custom pattern',
  `published_at` datetime(6) DEFAULT NULL COMMENT 'when the custom pattern was published and made available',
  `dry_run_repositories` varchar(255) DEFAULT NULL COMMENT 'the repositories to perform dry run on, if pattern is org/enterprise scoped',
  `scan_id` bigint unsigned DEFAULT NULL COMMENT 'the scan id that this custom pattern is associated with; mutually exclusive with job_group_id',
  `job_group_id` bigint unsigned DEFAULT NULL COMMENT 'the job group id that this custom pattern is associated with; mutually exclusive with scan_id',
  `row_version` char(27) DEFAULT NULL COMMENT 'the row version of the custom pattern; must match to update',
  `push_protection_enabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'boolean flag indicating if push protection is enabled for this custom pattern',
  `block_database` mediumblob COMMENT 'the marshaled and gzip''d hyperscan BlockDatabase',
  PRIMARY KEY (`id`),
  KEY `index_secret_scan_custom_patterns_on_owner_id` (`owner_id`),
  KEY `index_secret_scan_custom_patterns_on_repository_id` (`repository_id`),
  KEY `state_and_scope_and_repository_id_and_owner_id_and_secret_type` (`state`,`scope`,`repository_id`,`owner_id`,`secret_type`),
  KEY `index_secret_scan_custom_patterns_on_business_id` (`business_id`),
  KEY `index_secret_scan_custom_patterns_on_origin_id_published_at` (`origin_id`,`published_at`),
  KEY `index_secret_scan_custom_patterns_on_owner_scope_id` (`owner_scope_id`),
  KEY `index_state_repository_id_owner_scope_id_secret_type` (`state`,`repository_id`,`owner_scope_id`,`secret_type`),
  KEY `index_secret_scan_custom_patterns_on_scan_id` (`scan_id`) COMMENT 'supports reverse lookups by scan_id via the scans table',
  KEY `index_secret_scan_custom_patterns_on_job_group_id` (`job_group_id`) COMMENT 'supports reverse lookups by job_group_id via the job_groups table'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `secret_scan_incremental_statuses`;
CREATE TABLE `secret_scan_incremental_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` int NOT NULL,
  `before_oid` varchar(40) NOT NULL,
  `after_oid` varchar(40) NOT NULL,
  `ref_name` varbinary(1024) NOT NULL,
  `requested_at` datetime NOT NULL,
  `scanned_at` datetime DEFAULT NULL,
  `scan_state` int NOT NULL DEFAULT '0',
  `retry_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_incremental_status_on_repo_and_ref` (`repository_id`,`before_oid`,`after_oid`),
  KEY `index_secret_scan_incremental_statuses_on_requested_at` (`requested_at`),
  KEY `index_secret_scan_incremental_statuses_on_scan_state` (`scan_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `secret_scanning_bypass_reviewers`;
CREATE TABLE `secret_scanning_bypass_reviewers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_scope_id` bigint unsigned NOT NULL COMMENT 'What exactly is bypassed. Repo or org',
  `reviewer_id` bigint unsigned NOT NULL COMMENT 'The bypass reviewer ID',
  `reviewer_type` tinyint unsigned NOT NULL COMMENT 'The bypass reviewer type. See BypassReviewerType enum',
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_owner_scope_id_reviewer_id_reviewer_type_291fb3edb1` (`owner_scope_id`,`reviewer_id`,`reviewer_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_config_files`;
CREATE TABLE `secret_scanning_config_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `branch` varbinary(1024) NOT NULL,
  `blob_oid` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_secret_scanning_config_files_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_dry_run_results`;
CREATE TABLE `secret_scanning_dry_run_results` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `scan_id` bigint unsigned NOT NULL COMMENT 'id for the secret_scanning_secret_scans.id that that is associated with this dry run result',
  `token_signature` varbinary(32) NOT NULL COMMENT 'sha256 hash of the raw secret that was discovered stored as binary',
  `locations` blob NOT NULL COMMENT 'blob that holds a binary protobuf serialization of locations where the token was found in a scan. Limited to 5',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_idx_dry_runs_scan_id_token_signature` (`scan_id`,`token_signature`) COMMENT 'the natural key for this table - each token hash should only be allowed once per scan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_encrypted_secrets`;
CREATE TABLE `secret_scanning_encrypted_secrets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `token_scan_result_id` bigint unsigned NOT NULL COMMENT 'references token_scan_results.id',
  `encryption_key_hash_id` bigint unsigned NOT NULL COMMENT 'ID of the encryption key last used to encrypt this secret, references secret_scanning_encryption_key_hashes.id',
  `encrypted_secret` blob NOT NULL COMMENT 'AES-GCM-256 encrypted bytes for the detected secret, blob has max length of 64kb',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_encrypted_secrets_on_token_scan_result_id` (`token_scan_result_id`),
  KEY `index_encrypted_secrets_on_encryption_key_hash_id` (`encryption_key_hash_id`) COMMENT 'allows for efficient re-encryption when rotating keys'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_encryption_key_hashes`;
CREATE TABLE `secret_scanning_encryption_key_hashes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` varchar(256) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'SHA256 hash of an encryption key',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_encryption_key_hashes_on_hash` (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_incremental_scan_ref_updates`;
CREATE TABLE `secret_scanning_incremental_scan_ref_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `scan_id` bigint unsigned NOT NULL COMMENT 'the secret_scanning_scans.id that this scanned this update',
  `repository_id` bigint unsigned NOT NULL COMMENT 'repository ID that this scan was for - denormalized for performance',
  `ref` varbinary(1024) NOT NULL COMMENT 'the bytes of the ref name; for manual queries you will need to HEX/UNHEX this',
  `ref_xxhash` bigint unsigned NOT NULL COMMENT 'xxhash of the ref, provides a much more compact/efficient way to search/index a ref',
  `before_commit` varbinary(32) NOT NULL DEFAULT '' COMMENT 'sha1 or sha256 of the commit before the ref update; if len is 20, its sha1',
  `after_commit` varbinary(32) NOT NULL COMMENT 'sha1 or sha256 of the commit after the ref update; if len is 20, its sha1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_idx_incremental_scan_ref_updates` (`scan_id`,`ref_xxhash`,`before_commit`,`after_commit`) COMMENT 'natural key for this table is scan, ref (hash) before and after commits',
  KEY `idx_incremental_scan_ref_updates_repository_id_ref_xxhash` (`repository_id`,`ref_xxhash`,`before_commit`,`after_commit`) COMMENT 'useful for searching a repo & ref that have been scanned already'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_job_groups`;
CREATE TABLE `secret_scanning_job_groups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_scope_id` bigint unsigned NOT NULL COMMENT 'ownerscopes.id that this scan was job group was executed for',
  `type` tinyint unsigned NOT NULL COMMENT 'The type of job group, critical for reading the `data` field',
  `status` tinyint unsigned NOT NULL COMMENT 'The enum/iota status of the job group (started, completed, failed, etc',
  `data_version` tinyint unsigned DEFAULT NULL COMMENT 'The version of the data in the `data` field',
  `data` json DEFAULT NULL COMMENT 'The data for this job group, depending on the type.',
  `started_at` datetime(6) DEFAULT NULL COMMENT 'The time that the job group was started',
  `aqueduct_job_id` varchar(255) COLLATE ascii_general_ci DEFAULT NULL COMMENT 'The most recent aqueduct job id for this job_group',
  `restart_count` int unsigned NOT NULL DEFAULT '0' COMMENT 'the number of times this job group has been restarted',
  `completed_at` datetime(6) DEFAULT NULL COMMENT 'the time that the job group was completed',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_job_groups_owner_scope_completed` (`owner_scope_id`,`completed_at`) COMMENT 'support querying job groups by their owner and completion status',
  KEY `idx_job_groups_aqueduct_job_id` (`aqueduct_job_id`) COMMENT 'support querying job groups by their aqueduct job id'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_key_values`;
CREATE TABLE `secret_scanning_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `entry_key` varchar(192) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_secret_scanning_key_values_on_entry_key` (`entry_key`),
  KEY `index_secret_scanning_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci ROW_FORMAT=DYNAMIC;
DROP TABLE IF EXISTS `secret_scanning_public_leaks`;
CREATE TABLE `secret_scanning_public_leaks` (
  `created_at` datetime(6) NOT NULL COMMENT 'when this record was created',
  `updated_at` datetime(6) NOT NULL COMMENT 'when this record was updated',
  `token_type` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the type of token (from token_scan_results)',
  `token_signature` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the hex encoded sha256 checksum of the discovered secret; immutable',
  `repository_id` bigint unsigned NOT NULL,
  `commit_oid` varbinary(32) DEFAULT NULL COMMENT 'the hex-encoded commit oid that this location was discovered in; sha1 will be 20 chars, while sha256 will be 32',
  `blob_oid` varbinary(32) DEFAULT NULL COMMENT 'the hex-encoded blob oid that this location was discovered in; sha1 will be 20 chars, while sha256 will be 32',
  `path` varbinary(1024) DEFAULT NULL COMMENT 'the file path at this location, typically this is some utf8 string but it depends on the git users filesystem encoding',
  `start_line` int unsigned DEFAULT NULL COMMENT 'if the file, regardless of actual encoding, was read as ascii, this is the number of newline characters encountered before the token was found',
  `end_line` int unsigned DEFAULT NULL COMMENT 'if the file, regardless of actual encoding, was read as ascii, this is the number of newline characters encountered after reading <start_line> newlines, skipping <start_column> bytes but before reading <end_column> bytes',
  `start_column` int unsigned DEFAULT NULL COMMENT 'while the column name implies an encoding, one is not implied - this is actually just the explicit number of bytes to read to reach the start of the token, after <start_line> has been reached.',
  `end_column` int unsigned DEFAULT NULL COMMENT 'like start_column, no encoding is applied, this is just the raw number of bytes that should be read after end_line was reached, to include as the secret.',
  `content_type` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the type of content scanned, in which the secret was found in, such as commit, issue, pull request, issue or pull request review comment, discussion etc.',
  `content_number` int unsigned DEFAULT NULL COMMENT 'the number of the content in scope, if applicable',
  `content_id` bigint unsigned DEFAULT NULL COMMENT 'the ID of the content in scope, if applicable',
  `repository_type` tinyint unsigned NOT NULL COMMENT 'the type of repo where this leak was found, from Spokes::Repository::RepositoryType, to support gists and other non-repo repos',
  PRIMARY KEY (`token_type`,`token_signature`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_push_protection_blocks`;
CREATE TABLE `secret_scanning_push_protection_blocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL COMMENT 'id for the repository where the block occurred',
  `actor_id` bigint unsigned NOT NULL COMMENT 'id for the actor/user that triggered the block',
  `token_type` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the type of token that was blocked',
  `signature` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the hex encoded sha256 hash of the raw secret that was blocked',
  `block_date` date NOT NULL COMMENT 'the day the block occurred on',
  `first_blocked_timestamp` datetime(6) NOT NULL COMMENT 'timestamp for the first blocked push',
  `last_blocked_timestamp` datetime(6) NOT NULL COMMENT 'timestamp for the latest blocked push',
  `block_count` bigint unsigned NOT NULL DEFAULT '1' COMMENT 'total number of blocks aggregated by repo, actor, token type, signature, and block_date',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_repo_actor_type_signature_date` (`repository_id`,`actor_id`,`token_type`,`signature`,`block_date`) COMMENT 'limits it to at most new 1 row inserted a day per (repo, user, token fingerprint)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='aggregates the total number of blocks by repo, actor, token type, signature, and block_date';
DROP TABLE IF EXISTS `secret_scanning_push_protections_bypass`;
CREATE TABLE `secret_scanning_push_protections_bypass` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `owner_scope_id` bigint unsigned NOT NULL COMMENT 'the scope that this bypass applies to',
  `created_by` bigint unsigned NOT NULL COMMENT 'the user who created this bypass',
  `updated_by` bigint unsigned NOT NULL COMMENT 'the user who last updated this bypass',
  `signature` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the hex encoded sha256 hash of the raw secret that should be allowed into the remotes',
  `token_type` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the type of token that should be allowed into the remotes',
  `notes` varchar(2048) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL COMMENT 'freeform text field for notes about why this bypass was created',
  `expire_at` datetime(6) NOT NULL COMMENT 'timestamp that this bypass will expire',
  `reason` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'maps directly to the token-scanning-service Resolution iota/enum field ',
  `exemption_request_id` bigint unsigned DEFAULT NULL COMMENT 'If this bypass was created from a delegated bypass request, this is the bypass request ID (i.e `exemption_requests.id`)',
  PRIMARY KEY (`id`),
  KEY `idx_owner_scope_expired` (`owner_scope_id`,`expire_at`) COMMENT 'supports pulling all un-expired bypasses by scope',
  KEY `idx_scope_type_signature_expired_created` (`owner_scope_id`,`token_type`,`signature`,`expire_at`,`created_at`) COMMENT 'supports a lookup for a given token alert with a creation before bypass expiration, but after bypass creation.',
  KEY `index_exemption_request_id` (`exemption_request_id`) COMMENT 'Supports lookups by exemption_request_id, for the exemption UI pages'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_push_protections_bypass_placeholders`;
CREATE TABLE `secret_scanning_push_protections_bypass_placeholders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL COMMENT 'when the placeholder was created',
  `signature` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the hex encoded sha256 hash of the raw secret that should be allowed into the remotes',
  `token_type` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the type of token that should be allowed into the remotes',
  `owner_scope_id` bigint unsigned NOT NULL COMMENT 'the scope that this bypass placeholder applies to',
  `ksuid` char(27) COLLATE ascii_general_ci NOT NULL COMMENT 'a ksuid that identifies this record - to be used to construct urls with non-incrementing ids',
  `actor_id` bigint unsigned DEFAULT NULL COMMENT 'id for the actor/user that triggered the creation of the bypass placeholder',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_scope_type_signature` (`owner_scope_id`,`token_type`,`signature`),
  KEY `idx_created` (`created_at`),
  KEY `idx_ksuid` (`ksuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_repos`;
CREATE TABLE `secret_scanning_repos` (
  `id` bigint unsigned NOT NULL,
  `full_refresh_source_updated_at` datetime(6) NOT NULL COMMENT 'the updated_at value from the source repository model that was used to perform the last full refresh',
  `owner_scope_id` bigint unsigned NOT NULL COMMENT 'the owner_scopes.id of the user or organization which owns the repository',
  `business_id` bigint unsigned DEFAULT NULL COMMENT 'the enterprise, if any, which owns the repository.  This will be non-nil for both users and organizations which are part of a business.',
  `visibility` enum('PUBLIC','PRIVATE','INTERNAL') COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'the archived state of the repository',
  `default_ref` varbinary(1024) DEFAULT NULL COMMENT 'the default ref name of the repository',
  `parent_repository_id` bigint unsigned DEFAULT NULL COMMENT 'if null, this is a top-level repository.  If non-null, this is a direct fork of the ID specified',
  `checked_for_config_file` tinyint(1) DEFAULT NULL COMMENT 'true if the current default_ref has been checked for the secret scanning config file; otherwise false.  Null if it was never checked',
  `scanning_config_file_blob_oid` varchar(64) COLLATE ascii_general_ci DEFAULT NULL COMMENT 'the blob oid of the secret scanning config file, if it exists on the current default_ref',
  `scannable` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'true if the repository is scannable. a repository is not scannable if it is public and has been staff disabled, or it is private and not GHAS secret-scanning enabled',
  `ghas_secret_scanning_enabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'true if the repository is ghas_secret_scanning_enabled; false otherwise',
  `results_visible` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'true if the repository''s results are visible to the user false otherwise; visible implies webhooks and notifications, including alerts being visible',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `partner_validity_checks_enabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'whether validity checks for partners tokens are enabled for this repository',
  `soft_delete_found_at` datetime(6) DEFAULT NULL COMMENT 'if non-null, the timestamp for when token-scanning-service was notified the repository was soft-deleted.',
  `lower_confidence_patterns_enabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'whether lower confidence patterns are enabled for this repository',
  `generic_secrets_enabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'whether Generic Secrets is enabled for this repository',
  `wiki_scanning` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'whether wiki exists and can be scanned for this repository',
  `slice10` tinyint unsigned GENERATED ALWAYS AS ((floor(`created_at`) % 10)) VIRTUAL NOT NULL,
  PRIMARY KEY (`id`),
  KEY `secret_scanning_repos_parent_repo_id` (`parent_repository_id`) COMMENT 'index for finding all child repos',
  KEY `secret_scanning_repos_soft_delete_found_at` (`soft_delete_found_at`) COMMENT 'support lookups for soft-deleted repos',
  KEY `secret_scanning_repos_ghas` (`ghas_secret_scanning_enabled`) COMMENT 'support ghas-only lookups',
  KEY `secret_scanning_repos_scannable` (`scannable`) COMMENT 'support scannable-only lookups',
  KEY `secret_scanning_repos_partner_validity_checks_enabled` (`partner_validity_checks_enabled`) COMMENT 'supports looking up repos that have opted in to partner validity checks',
  KEY `secret_scanning_repos_owner_id` (`owner_scope_id`,`results_visible`,`visibility`,`business_id`,`archived`,`soft_delete_found_at`),
  KEY `secret_scanning_repos_business_id` (`business_id`,`results_visible`,`visibility`,`owner_scope_id`,`archived`,`soft_delete_found_at`),
  KEY `secret_scanning_repos_owner_sliced` (`owner_scope_id`,`results_visible`,`slice10`,`visibility`,`business_id`,`archived`,`soft_delete_found_at`),
  KEY `secret_scanning_repos_business_sliced` (`business_id`,`results_visible`,`slice10`,`visibility`,`owner_scope_id`,`archived`,`soft_delete_found_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='table of repositories; id is the repository id';
DROP TABLE IF EXISTS `secret_scanning_repositories`;
CREATE TABLE `secret_scanning_repositories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `organization_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `feature_visible` tinyint(1) NOT NULL DEFAULT '0',
  `source_updated_at` datetime(6) DEFAULT NULL,
  `visibility` enum('public','private','internal') DEFAULT NULL,
  `checked_for_config_file_branch` varbinary(1024) DEFAULT NULL COMMENT 'branch whose config file has OID in checked_for_config_file_oid',
  `checked_for_config_file_oid` varchar(40) DEFAULT NULL COMMENT 'OID of the config file in branch in checked_for_config_file_branch',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_secret_scanning_repositories_on_repository_id` (`repository_id`),
  KEY `index_secret_scanning_repos_on_source_updated_at` (`source_updated_at`),
  KEY `idx_ss_repos_on_org_fv_repo_id` (`organization_id`,`feature_visible`,`repository_id`),
  KEY `idx_ss_repos_on_org_fv_visibility_repo_id` (`organization_id`,`feature_visible`,`visibility`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `secret_scanning_scans`;
CREATE TABLE `secret_scanning_scans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL COMMENT 'repository ID that this scan was for',
  `scan_status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the current progress of the scan whether its requested, cancelled, completed etc',
  `scan_type` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the type of scan being performed such as backfills, dry runs, incremental etc',
  `job_group_id` bigint unsigned DEFAULT NULL COMMENT 'the job group that this scan belongs to, if any',
  `started_at` datetime(6) DEFAULT NULL COMMENT 'the time that the scan was started',
  `aqueduct_job_id` varchar(255) COLLATE ascii_general_ci DEFAULT NULL COMMENT 'The most recent aqueduct job id for this job_group',
  `restart_count` int unsigned NOT NULL DEFAULT '0' COMMENT 'the number of times this scan has been restarted',
  `completed_at` datetime(6) DEFAULT NULL COMMENT 'the time that the scan was completed',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `hcs_changelog_version` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL COMMENT 'The HCS changelog version that was used to run this scan',
  PRIMARY KEY (`id`),
  KEY `idx_scans_job_group_id` (`job_group_id`,`scan_status`) COMMENT 'supports job group processing by status',
  KEY `idx_scans_repo_type_status_hcs_version` (`repository_id`,`scan_status`,`scan_type`,`hcs_changelog_version`),
  KEY `idx_scans_aqueduct_job_id` (`aqueduct_job_id`) COMMENT 'support aqueduct job id lookups',
  KEY `idx_scans_created_status_type_repo` (`created_at`,`scan_status`,`scan_type`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_token_remediation_events`;
CREATE TABLE `secret_scanning_token_remediation_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `token_scan_result_id` bigint unsigned NOT NULL COMMENT 'the token_scan_results.id parent record for this event',
  `event_type` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the type of event (active, requested-revoked, revoked, etc) mapping to an enum in the token-scanning-service',
  `event_at` datetime(6) DEFAULT NULL COMMENT 'the time when the event occurred',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_by` bigint unsigned DEFAULT NULL COMMENT 'the user performed the event. If unset, the event was performed by the system',
  PRIMARY KEY (`id`),
  KEY `idx_token_rem_events_token_scan_result_id_event_at` (`token_scan_result_id`,`event_at`) COMMENT 'support queries by token scan result ID and sorting by event_at'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_tombstone_jobs`;
CREATE TABLE `secret_scanning_tombstone_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `original_job_queue` varchar(256) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'The original job queue for the failed job.',
  `aqueduct_job_id` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'The most recent aqueduct job id that handled this scan.',
  `original_job_payload` mediumblob NOT NULL COMMENT 'The payload for the original job that failed.',
  `tombstone_status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'The current progress of the tombstone: open, resolved, re-queued, etc...',
  `error_hash` varbinary(32) NOT NULL COMMENT 'The sha256 hash of the error that led to this job being tombstoned. This is the error that was thrown by the original worker.',
  `github_issue_number` bigint unsigned DEFAULT NULL COMMENT 'The issue in the github/secret-scanning repo that has been filed for this job.',
  `github_issue_comment_id` bigint unsigned DEFAULT NULL COMMENT 'The issue comment that has been filed for this job on an existing issue. This field and github_issue_number are mutually exclusive.',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_secret_scanning_tombstone_jobs_on_aqueduct_job_id` (`aqueduct_job_id`) COMMENT 'support queries by aqueduct job ID',
  KEY `index_secret_scanning_tombstone_jobs_on_error_hash` (`error_hash`) COMMENT 'support queries by the error_hash',
  KEY `index_secret_scanning_tombstone_jobs_on_github_issue_number` (`github_issue_number`) COMMENT 'support queries by github issue number'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_validation_multipart_continuations`;
CREATE TABLE `secret_scanning_validation_multipart_continuations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `root_token_scan_result_id` bigint unsigned NOT NULL COMMENT 'the root token_scan_result id (e.g. id of a result for an AWS Access Key ID)',
  `updated_at` datetime(6) NOT NULL COMMENT 'when this record was updated',
  `tuple_token_types` varchar(512) COLLATE ascii_general_ci NOT NULL COMMENT 'the comma delimited token types (asc alphabetically) which make up the the tuple for this continuation',
  `last_processed_created_at` datetime(6) NOT NULL COMMENT 'the last created at processed for this tuple group',
  `last_processed_group_id` varchar(128) COLLATE ascii_general_ci NOT NULL COMMENT 'comma delimited list of ids that''s used with last_processed_created_at to page through combinations. not necessarily a numerically ascending list of ids. the order depends on the order of tuple token types for a root.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_root_token_scan_result_id_tuple_token_types` (`root_token_scan_result_id`,`tuple_token_types`) COMMENT 'natural key; allows continuations for token types A + B, and A + D + C to co-exist'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_validation_multipart_group_members`;
CREATE TABLE `secret_scanning_validation_multipart_group_members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `root_token_scan_result_id` bigint unsigned NOT NULL COMMENT 'the root (identifying) token scan result id',
  `token_scan_result_id` bigint unsigned NOT NULL COMMENT 'a valid token scan alert id that is participating in the valid (or once valid) tuple',
  `group_id` varchar(128) COLLATE ascii_general_ci NOT NULL COMMENT 'comma delimited list of token scan result ids that make up this group. the order of the ids in group_id depends on the order of token types that make up this tuple.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_root_result_child_result_group_id` (`root_token_scan_result_id`,`token_scan_result_id`,`group_id`) COMMENT 'enforces correctness as a root/child combo can only exist in a group once. also supports fast lookups by root tokens.',
  KEY `index_token_scan_result_id` (`token_scan_result_id`) COMMENT 'supports lookups by non-root tokens',
  KEY `index_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scanning_validation_multipart_groups`;
CREATE TABLE `secret_scanning_validation_multipart_groups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NOT NULL COMMENT 'when this record was created',
  `group_id` varchar(128) COLLATE ascii_general_ci NOT NULL COMMENT 'comma delimited list of token scan result ids that make up this group. the order of the ids in group_id depends on the order of token types that make up this tuple.',
  `last_checked` datetime(3) NOT NULL COMMENT 'when validity was last checked for this tuple',
  `last_checked_active` datetime(3) DEFAULT NULL COMMENT 'the last time we saw this token tuple was active',
  `first_checked_inactive` datetime(3) DEFAULT NULL COMMENT 'the first time we saw this token tuple was inactive',
  `repository_id` bigint unsigned NOT NULL COMMENT 'the repository this group belongs to',
  `root_token_type` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the token type of the root (or identifying) token for this group',
  `validity` tinyint NOT NULL COMMENT 'internal enum/iota within the token-scanning-service representing validity for this group',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='table that holds metadata related to the validity of sets of tokens that are used together';
DROP TABLE IF EXISTS `secret_scanning_validation_resets`;
CREATE TABLE `secret_scanning_validation_resets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `token_type` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the token type this reset is for',
  `tuple_token_types` varchar(512) COLLATE ascii_general_ci DEFAULT NULL COMMENT 'if token_type is a root token type, then this column holds types the root is used with',
  `reset_at` datetime(3) NOT NULL COMMENT 'the time this reset was added. used to determine if standalone tokens and groups should be re-checked, and if continuation cursors should be reset',
  `internal_reason` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'internal (non customer facing) reason this reset was added',
  `customer_facing_reason` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'external reason this reset was added. shown to customers',
  PRIMARY KEY (`id`),
  KEY `index_token_type_reset_at` (`token_type`,`reset_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `secret_scans`;
CREATE TABLE `secret_scans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL COMMENT 'repository where the scan was initiated',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `scan_status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the current progress of the scan whether its requested, cancelled, completed etc',
  `scan_type` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the type of scan being performed such as backfills, dry runs, incremental etc',
  `scan_scope` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the scope of scan being performed such as content, issues etc',
  `scan_scope_parameters` blob NOT NULL COMMENT 'the parameters relevant to a given scope and type of scan such as ref updates for content scans',
  `patterns` blob NOT NULL COMMENT 'blob that holds the serialization of the regexs or patterns that were scanned for',
  `started_at` datetime(6) DEFAULT NULL COMMENT 'datetime when the scan was started',
  `completed_at` datetime(6) DEFAULT NULL COMMENT 'datetime when the scan was completed',
  `custom_pattern_id` bigint unsigned DEFAULT NULL COMMENT 'reference for related custom patterns when the scan type is dry run',
  PRIMARY KEY (`id`),
  KEY `index_secret_scans_repository_scan_type_status_scope` (`repository_id`,`scan_type`,`scan_status`,`scan_scope`),
  KEY `index_secret_scans_created_at` (`created_at`),
  KEY `index_secret_scans_repository_scan_status_created_at` (`repository_id`,`scan_status`,`created_at`),
  KEY `index_secret_scans_repository_scan_status_completed_at` (`repository_id`,`scan_status`,`completed_at`),
  KEY `index_secret_scans_on_custom_pattern_id_and_repository_id` (`custom_pattern_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `token_scan_location_migration_statuses`;
CREATE TABLE `token_scan_location_migration_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `migration_status` int unsigned NOT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_token_scan_location_migration_status_repository_id` (`repository_id`),
  KEY `index_token_scan_migration_status_and_repository_id` (`migration_status`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `token_scan_result_locations_v2`;
CREATE TABLE `token_scan_result_locations_v2` (
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `token_scan_result_id` bigint unsigned NOT NULL COMMENT 'the parent token_scan_results.id for this location',
  `repository_id` bigint unsigned NOT NULL COMMENT 'the repository_id that this location was found in; useful for finding locations without a join through token_scan_results',
  `commit_oid` varchar(64) COLLATE ascii_general_ci DEFAULT NULL COMMENT 'the hex-encoded commit oid that this location was discovered in; sha1 will be 40 chars, while sha256 will be 64',
  `blob_oid` varchar(64) COLLATE ascii_general_ci DEFAULT NULL COMMENT 'the hex-encoded blob oid at this location; sha1 will be 40 chars, while sha256 will be 64',
  `path` varbinary(1024) DEFAULT NULL COMMENT 'the file path at this location, typically this is some utf8 string but it depends on the git users filesystem encoding',
  `start_line` int unsigned DEFAULT NULL COMMENT 'if the file, regardless of actual encoding, was read as ascii, this is the number of newline characters encountered before the token was found',
  `end_line` int unsigned DEFAULT NULL COMMENT 'if the file, regardless of actual encoding, was read as ascii, this is the number of newline characters encountered after reading <start_line> newlines, skipping <start_column> bytes but before reading <end_column> bytes',
  `start_column` int unsigned DEFAULT NULL COMMENT 'while the column name implies an encoding, one is not implied - this is actually just the explicit number of bytes to read to reach the start of the token, after <start_line> has been reached.',
  `end_column` int unsigned DEFAULT NULL COMMENT 'like start_column, no encoding is applied, this is just the raw number of bytes that should be read after end_line was reached, to include as the secret.',
  `ignore_token` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'boolean; true if this location should be ignored. This value is set by customers secret-scanning paths-ignore configuration.',
  `scan_id` bigint unsigned DEFAULT NULL COMMENT 'the secret_scanning_scans.id which location was found in, if any',
  `content_type` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'the type of content scanned, in which the secret was found in, such as commit, issue, pull request, issue or pull request review comment, discussion etc.',
  `content_number` int unsigned DEFAULT NULL COMMENT 'the number of the content in scope, if applicable',
  `content_id` bigint unsigned DEFAULT NULL COMMENT 'the ID of the content scanned, if applicable',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_token_scan_result_locations` (`token_scan_result_id`,`path`),
  UNIQUE KEY `index_token_scan_result_locations_v2_unique_content_types` (`token_scan_result_id`,`content_type`,`content_number`,`content_id`) COMMENT 'unique constraint for non-code content locations like issues, pull requests, discussion comments, etc.',
  KEY `index_token_scan_result_locations_on_repository_and_path` (`repository_id`,`path`),
  KEY `index_token_scan_result_locations_on_result_and_ignore` (`token_scan_result_id`,`ignore_token`),
  KEY `index_token_scan_result_locations_v2_scan_id` (`scan_id`) COMMENT 'for looking up records by an explicit scan which created it',
  KEY `index_token_scan_result_locations_v2_on_content_type_id_number` (`content_type`,`content_number`,`content_id`) COMMENT 'for looking up non-code content locations.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='table that holds unique paths for tokens found in token_scan_results, including the location the secret was found at.';
DROP TABLE IF EXISTS `token_scan_result_sequences`;
CREATE TABLE `token_scan_result_sequences` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `number` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_token_scan_result_sequences_on_repository_id` (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `token_scan_results`;
CREATE TABLE `token_scan_results` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL COMMENT 'the repository_id that the secret was discovered in; immutable',
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  `token_type` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the internal-only token type; for a custom pattern this will start with cp_<pattern_id>; immutable',
  `token_signature` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the hex encoded sha256 checksum of the discovered secret; immutable',
  `resolution` int DEFAULT NULL COMMENT 'audited; internal enum/iota within the token-scanning-service representing the resolution (e.g., revoked, false positive)',
  `resolver_id` bigint unsigned DEFAULT NULL COMMENT 'audited; if resolution is not null, this represents the github login ID that applied <resolutions>',
  `resolved_at` datetime(3) DEFAULT NULL COMMENT 'audited; if resolution is not null, the timestamp <resolution> was applied by <resolver_id>',
  `number` int unsigned NOT NULL DEFAULT '0' COMMENT 'the repository-scoped sequence alert number; see token_scan_result_sequences; immutable',
  `scan_scope` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'internal enum/iota in the token-scanning-service representing the location where the scan was looking (e.g., repository content, commit content); immutable',
  `resolved` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'audited; boolean field based on the <resolution> field above; some non-null resolutions are considered false here (e.g., re-opened)',
  `first_location_id` bigint unsigned DEFAULT NULL COMMENT 'audited; the token_scan_result_locations_v2.id of the first discovered location of this secret.  This value changes depending on the secret-scanning configurations ignored paths',
  `has_valid_locations` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'audited; boolean; this is a performnce-only column useful as an index, which is based on whether first_location_id > 0',
  `custom_pattern_id` bigint unsigned DEFAULT NULL COMMENT 'the secret_scan_custom_patterns.id that this token_type belongs to; allows faster joins than using a parsed cp_<id> token_type; immutable',
  `scan_id` bigint unsigned DEFAULT NULL COMMENT 'the secret_scanning_scans.id which this record was found in, if any; immutable',
  `bypass_id` bigint unsigned DEFAULT NULL COMMENT 'if not null, the secret_scanning_push_protections_bypass.id that allowed a push to succeed; immutable',
  `resolution_comment` varchar(280) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL COMMENT 'audited; user-provided comment explaining the resolution status, if any',
  `validity` tinyint DEFAULT NULL COMMENT 'internal enum/iota within the token-scanning-service representing validity',
  `low_confidence` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'whether or not this secret belongs to a low confidence pattern',
  `publicly_leaked` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'whether this token has been leaked in a public repository',
  `internally_leaked` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'whether this token has been leaked in another repository within the same owner or enterprise',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_token_scan_results_on_repository_and_type_and_signature` (`repository_id`,`token_type`,`token_signature`),
  UNIQUE KEY `index_token_scan_results_on_repo_and_number` (`repository_id`,`number`),
  KEY `index_token_scan_results_on_repo_custom_pattern_id` (`repository_id`,`custom_pattern_id`),
  KEY `index_token_scan_results_scan_id` (`scan_id`) COMMENT 'for looking up records by an explicit scan which created it',
  KEY `index_token_scan_results_repository_token_signature` (`repository_id`,`token_signature`) COMMENT 'support verifying that a generic secret has not already been discovered in the given repository',
  KEY `index_token_type_token_signature` (`token_type`,`token_signature`,`publicly_leaked`,`internally_leaked`,`repository_id`) COMMENT 'support lookup by token type and token signature, with covering values',
  KEY `idx_acv_filters_created` (`repository_id`,`low_confidence`,`created_at`,`resolved`,`publicly_leaked`,`internally_leaked`,`validity`,`token_type`,`resolution`,`bypass_id`) COMMENT 'covering index for all alert-centric-view (ACV) filter-able columns, ordered by created_at',
  KEY `idx_acv_filters_updated` (`repository_id`,`low_confidence`,`updated_at`,`resolved`,`publicly_leaked`,`internally_leaked`,`validity`,`token_type`,`resolution`,`bypass_id`) COMMENT 'covering index for all alert-centric-view (ACV) filter-able columns, ordered by updated_at'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='table that holds alerts for discovered secrets for repositories; all mutable columns should be marked as audited, and included in inside audit_token_scan_results';
DROP TABLE IF EXISTS `token_scan_results_validation`;
CREATE TABLE `token_scan_results_validation` (
  `id` bigint unsigned NOT NULL,
  `last_checked` datetime(3) NOT NULL COMMENT 'when validity was last checked',
  `last_checked_active` datetime(3) DEFAULT NULL COMMENT 'the last time we saw this token was active',
  `first_checked_inactive` datetime(3) DEFAULT NULL COMMENT 'the first time we saw this token was inactive',
  `created_at` datetime(3) NOT NULL COMMENT 'when this record was created',
  `token_type` varchar(64) COLLATE ascii_general_ci NOT NULL COMMENT 'the type of token (from token_scan_results)',
  `async_check_requested_at` datetime(3) DEFAULT NULL COMMENT 'when an async on demand check was requested for this token. can be null. only some tokens have an async process.',
  `last_check_completed_at` datetime(3) DEFAULT NULL COMMENT 'when the last on demand check for this token was completed. can be null because for some tokens an async check can be requested before a scheduled check.',
  PRIMARY KEY (`id`),
  KEY `index_token_type_last_checked` (`token_type`,`last_checked`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='table of validation records for token_scan_results, id is the token_scan_result id';
DROP TABLE IF EXISTS `token_scan_statuses`;
CREATE TABLE `token_scan_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `repository_id` int NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `scanned_at` datetime DEFAULT NULL,
  `scan_state` int NOT NULL DEFAULT '0',
  `retry_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_token_scan_statuses_on_repository_id` (`repository_id`),
  KEY `index_token_scan_statuses_on_scan_state` (`scan_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
