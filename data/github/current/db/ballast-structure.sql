DROP TABLE IF EXISTS `authenticated_devices`;
CREATE TABLE `authenticated_devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `device_id` varchar(32) NOT NULL,
  `display_name` varbinary(1024) NOT NULL,
  `accessed_at` datetime NOT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `trusted_device_available` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_authenticated_devices_on_device_id_and_user_id` (`device_id`,`user_id`),
  KEY `index_authenticated_devices_on_user_id_and_approved_at` (`user_id`,`approved_at`),
  KEY `index_authenticated_devices_on_approved_at_and_accessed_at` (`approved_at`,`accessed_at`),
  KEY `index_authenticated_devices_on_accessed_at` (`accessed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `authentication_records`;
CREATE TABLE `authentication_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `country_code` varchar(2) DEFAULT NULL,
  `octolytics_id` varchar(32) NOT NULL,
  `client` varchar(40) NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_agent` text,
  `flagged_reason` varchar(32) DEFAULT NULL,
  `user_session_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(40) NOT NULL,
  `authenticated_device_id` bigint unsigned DEFAULT NULL,
  `region_name` varchar(64) DEFAULT NULL,
  `city` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_authentication_records_on_user_session_id_and_ip_address` (`user_session_id`,`ip_address`),
  KEY `authentication_records_on_user_id_octolytics_id_and_created_at` (`user_id`,`octolytics_id`,`created_at`),
  KEY `index_authentication_records_on_created_at` (`created_at`),
  KEY `index_authentication_records_on_user_id_and_device_id` (`user_id`,`authenticated_device_id`),
  KEY `index_authentication_records_ondevice_id_ip_address_and_user_id` (`authenticated_device_id`,`ip_address`,`user_id`),
  KEY `index_authentication_records_on_ip_address` (`ip_address`),
  KEY `index_on_user_id_country_code_client_and_created_at` (`user_id`,`country_code`,`client`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `collection_items`;
CREATE TABLE `collection_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `collection_id` int NOT NULL,
  `content_id` int NOT NULL,
  `content_type` varchar(30) NOT NULL,
  `slug` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_collection_items_on_collection_id` (`collection_id`),
  KEY `index_collection_items_on_content_id_and_content_type` (`content_id`,`content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `collection_urls`;
CREATE TABLE `collection_urls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` text NOT NULL,
  `title` varchar(40) NOT NULL,
  `description` varbinary(1024) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `collection_videos`;
CREATE TABLE `collection_videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` text NOT NULL,
  `title` varchar(40) NOT NULL,
  `description` varbinary(1024) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `thumbnail_url` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `collections`;
CREATE TABLE `collections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(40) NOT NULL,
  `description` varbinary(1024) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `attribution_url` text,
  `display_name` varchar(100) NOT NULL,
  `image_url` text,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_collections_on_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `content_reference_attachments`;
CREATE TABLE `content_reference_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content_reference_id` int DEFAULT NULL,
  `integration_id` int DEFAULT NULL,
  `state` int NOT NULL DEFAULT '0',
  `title` varbinary(1024) DEFAULT NULL,
  `body` mediumblob,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_content_reference_id_and_integration_id` (`content_reference_id`,`integration_id`),
  KEY `index_on_content_reference_id_and_state` (`content_reference_id`,`state`),
  KEY `index_content_reference_attachments_on_integration_id` (`integration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `content_references`;
CREATE TABLE `content_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `content_id` bigint unsigned NOT NULL,
  `content_type` varchar(30) NOT NULL,
  `reference_hash` varchar(64) COLLATE utf8mb3_general_ci NOT NULL,
  `reference` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_content_id_and_content_type_and_reference_hash` (`content_id`,`content_type`,`reference_hash`),
  KEY `index_content_references_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_post_replies`;
CREATE TABLE `discussion_post_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `body` mediumblob NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `number` int NOT NULL,
  `user_id` int NOT NULL,
  `discussion_post_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_post_replies_on_discussion_post_id_and_number` (`discussion_post_id`,`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `discussion_posts`;
CREATE TABLE `discussion_posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `number` int DEFAULT NULL,
  `body` mediumblob NOT NULL,
  `formatter` varchar(20) DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `team_id` bigint unsigned NOT NULL,
  `pinned_at` datetime DEFAULT NULL,
  `pinned_by_user_id` bigint unsigned DEFAULT NULL,
  `private` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `title` varbinary(1024) NOT NULL,
  `transferred_discussion_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_discussion_posts_on_team_id_and_number` (`team_id`,`number`),
  KEY `index_discussion_posts_on_team_id_and_pinned_at` (`team_id`,`pinned_at`),
  KEY `index_discussion_posts_on_team_id_and_private` (`team_id`,`private`),
  KEY `index_discussion_posts_on_transferred_discussion_id` (`transferred_discussion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `feed_filter_settings`;
CREATE TABLE `feed_filter_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `is_topic` tinyint(1) NOT NULL DEFAULT '0',
  `announcements_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `releases_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `sponsors_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `stars_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `repositories_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `repository_activity_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `follows_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `recommendations_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `posts_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `explicit_only_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_feed_filter_settings_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `feed_post_comments`;
CREATE TABLE `feed_post_comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `feed_post_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `parent_comment_id` bigint unsigned DEFAULT NULL,
  `body` mediumblob NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_post_comment_on_post_id_deleted_created` (`feed_post_id`,`deleted_at`,`created_at`),
  KEY `index_feed_post_comments_on_parent_deleted_created` (`parent_comment_id`,`deleted_at`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `feed_post_embeds`;
CREATE TABLE `feed_post_embeds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subject_id` bigint unsigned NOT NULL,
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `title` varchar(1024) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` blob NOT NULL,
  `url` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `site_name` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `image_url` text COLLATE utf8mb4_unicode_520_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_feed_post_embeds_on_subject_id_and_subject_type` (`subject_id`,`subject_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `feed_post_references`;
CREATE TABLE `feed_post_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference_id` bigint unsigned NOT NULL,
  `reference_type` tinyint NOT NULL,
  `feed_post_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_feed_post_references_on_post_and_reference` (`feed_post_id`,`reference_id`,`reference_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `feed_posts`;
CREATE TABLE `feed_posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `author_id` bigint unsigned NOT NULL,
  `body` mediumblob NOT NULL,
  `hidden` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `topic_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_feed_posts_on_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `feeds_key_values`;
CREATE TABLE `feeds_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_feeds_key_values_on_key` (`key`),
  KEY `index_feeds_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `graphql_client_operations`;
CREATE TABLE `graphql_client_operations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `graphql_client_id` bigint NOT NULL,
  `graphql_operation_id` bigint NOT NULL,
  `alias` varchar(256) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `last_used_at` datetime(6) DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `graphql_client_operations_pairs` (`graphql_client_id`,`alias`),
  KEY `index_graphql_client_operations_on_graphql_operation_id` (`graphql_operation_id`),
  KEY `index_graphql_client_operations_on_is_archived` (`is_archived`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `graphql_clients`;
CREATE TABLE `graphql_clients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(256) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_graphql_clients_on_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `graphql_index_entries`;
CREATE TABLE `graphql_index_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(256) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_graphql_index_entries_on_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `graphql_index_references`;
CREATE TABLE `graphql_index_references` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `graphql_index_entry_id` bigint NOT NULL,
  `graphql_operation_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `graphql_index_reference_pairs` (`graphql_index_entry_id`,`graphql_operation_id`),
  KEY `index_graphql_index_references_on_graphql_operation_id` (`graphql_operation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `graphql_operations`;
CREATE TABLE `graphql_operations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `digest` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `name` varchar(256) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_graphql_operations_on_digest` (`digest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `invoiced_sponsorship_transfer_reversals`;
CREATE TABLE `invoiced_sponsorship_transfer_reversals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoiced_sponsorship_transfer_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `amount_in_cents` int NOT NULL,
  `stripe_transfer_reversal_id` varchar(255) COLLATE utf8mb3_bin DEFAULT NULL,
  `transfer_reversal_created_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_invoiced_sponsorship_transfer_reversals_on_stripe_reversal` (`stripe_transfer_reversal_id`),
  KEY `index_invoiced_sponsorship_transfer_reversals_on_transfer` (`invoiced_sponsorship_transfer_id`),
  KEY `index_invoiced_sponsorship_transfer_reversals_on_actor_id` (`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `invoiced_sponsorship_transfers`;
CREATE TABLE `invoiced_sponsorship_transfers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_listing_id` bigint unsigned NOT NULL,
  `stripe_connect_account_id` bigint unsigned NOT NULL,
  `sponsor_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  `amount_in_cents` int NOT NULL,
  `stripe_transfer_id` varchar(255) COLLATE utf8mb3_bin DEFAULT NULL,
  `zuora_payment_id` varchar(255) COLLATE utf8mb3_bin NOT NULL,
  `transfer_created_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `send_new_sponsor_email_on_transfer` tinyint(1) NOT NULL DEFAULT '0',
  `new_sponsor_email_note` blob,
  `new_sponsor_email_sent_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_invoiced_sponsorship_transfers_on_stripe_transfer_id` (`stripe_transfer_id`),
  KEY `index_invoiced_sponsorship_transfers_on_sponsors_listing_id` (`sponsors_listing_id`),
  KEY `index_invoiced_sponsorship_transfers_on_stripe_connect_account` (`stripe_connect_account_id`),
  KEY `index_invoiced_sponsorship_transfers_on_sponsor_id` (`sponsor_id`),
  KEY `index_invoiced_sponsorship_transfers_on_actor_id` (`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `issue_summaries`;
CREATE TABLE `issue_summaries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issue_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `content` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` varchar(36) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_issue_summaries_on_issue_id_and_user_id` (`issue_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `organization_domains`;
CREATE TABLE `organization_domains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `owner_type` varchar(30) NOT NULL DEFAULT 'User',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `domain` varchar(255) NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_organization_domains_on_domain_and_owner_type_and_owner_id` (`domain`,`owner_type`,`owner_id`),
  KEY `index_organization_domains_on_owner_type_and_owner_id` (`owner_type`,`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `organization_feed_filter_settings`;
CREATE TABLE `organization_feed_filter_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `releases_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `repositories_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `repository_activity_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_feed_filter_settings_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pages_embargoed_cnames`;
CREATE TABLE `pages_embargoed_cnames` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `previous_owner_id` bigint unsigned NOT NULL,
  `previous_repository_id` bigint unsigned NOT NULL,
  `cname` varbinary(1024) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pages_embargoed_cnames_cname` (`cname`),
  KEY `index_pages_embargoed_cnames_previous_owner_id` (`previous_owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `patreon_webhooks`;
CREATE TABLE `patreon_webhooks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kind` int NOT NULL,
  `payload` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `processed_at` datetime(6) DEFAULT NULL,
  `account_id` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `status` enum('pending','processed','ignored') COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_patreon_webhooks_on_account_id_and_kind` (`account_id`,`kind`),
  KEY `index_patreon_webhooks_on_status_and_created_at` (`status`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `reserved_logins`;
CREATE TABLE `reserved_logins` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(40) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `kind` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_reserved_logins_on_login` (`login`),
  KEY `index_reserved_logins_on_kind_and_login` (`kind`,`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `retired_namespaces`;
CREATE TABLE `retired_namespaces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_login` varchar(40) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `owner_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_retired_namespaces_on_owner_login_and_name` (`owner_login`,`name`),
  KEY `index_retired_namespaces_on_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `slotted_counters`;
CREATE TABLE `slotted_counters` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `record_type` varchar(30) NOT NULL,
  `record_id` int NOT NULL,
  `slot` int NOT NULL DEFAULT '0',
  `count` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `records_and_slots` (`record_type`,`record_id`,`slot`),
  KEY `index_slotted_counters_on_record_type_and_record_id_and_count` (`record_type`,`record_id`,`count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `stafftools_roles`;
CREATE TABLE `stafftools_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `stripe_webhooks`;
CREATE TABLE `stripe_webhooks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kind` int NOT NULL,
  `fingerprint` varchar(64) NOT NULL,
  `payload` text NOT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `account_id` varchar(255) COLLATE utf8mb3_bin DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `status` enum('pending','processed','ignored') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_stripe_webhooks_on_fingerprint` (`fingerprint`),
  KEY `index_stripe_webhooks_on_processed_at` (`processed_at`),
  KEY `index_stripe_webhooks_account_kind_created` (`account_id`,`kind`,`created_at`),
  KEY `index_stripe_webhooks_on_status_and_created_at` (`status`,`created_at`),
  KEY `index_stripe_webhooks_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `topic_sources`;
CREATE TABLE `topic_sources` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `topic_id` bigint unsigned NOT NULL,
  `source_id` bigint unsigned NOT NULL,
  `source_type` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_topic_sources_on_topic_id_and_source_id_and_source_type` (`topic_id`,`source_id`,`source_type`),
  KEY `index_topic_sources_on_source_id_and_source_type` (`source_id`,`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `user_stafftools_roles`;
CREATE TABLE `user_stafftools_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `stafftools_role_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_user_stafftools_roles_on_user_id` (`user_id`),
  KEY `index_user_stafftools_roles_on_stafftools_role_id` (`stafftools_role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `web_push_subscriptions`;
CREATE TABLE `web_push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `endpoint` text NOT NULL,
  `user_id` int NOT NULL,
  `auth` varchar(255) NOT NULL,
  `p256dh` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_agent` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_web_push_subscriptions_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `zuora_webhooks`;
CREATE TABLE `zuora_webhooks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kind` int NOT NULL,
  `account_id` varchar(64) DEFAULT NULL,
  `payload` text NOT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('pending','processed','ignored','investigating') DEFAULT NULL,
  `investigation_notes` text,
  PRIMARY KEY (`id`),
  KEY `index_zuora_webhooks_on_processed_at` (`processed_at`),
  KEY `index_zuora_webhooks_on_account_id_and_kind` (`account_id`,`kind`),
  KEY `index_zuora_webhooks_on_status_and_created_at` (`status`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
