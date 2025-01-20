DROP TABLE IF EXISTS `notification_summaries`;
CREATE TABLE `notification_summaries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `list_type` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'Repository',
  `list_id` bigint unsigned NOT NULL,
  `raw_data` blob,
  `thread_key` varchar(80) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_notification_summaries_list_id_list_type_thread_key` (`list_id`,`list_type`,`thread_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
