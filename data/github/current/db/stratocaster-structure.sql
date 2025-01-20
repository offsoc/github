DROP TABLE IF EXISTS `feed_key_values`;
CREATE TABLE `feed_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_feed_key_values_on_key` (`key`),
  KEY `index_feed_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `stratocaster_events`;
CREATE TABLE `stratocaster_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `raw_data` mediumblob,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_stratocaster_events_on_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
