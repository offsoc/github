DROP TABLE IF EXISTS `authentic_commits`;
CREATE TABLE `authentic_commits` (
  `network_id` bigint unsigned NOT NULL,
  `oid` binary(20) NOT NULL,
  `verified_at` datetime(6) NOT NULL,
  PRIMARY KEY (`network_id`,`oid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `pushes`;
CREATE TABLE `pushes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned DEFAULT NULL,
  `pusher_id` bigint unsigned DEFAULT NULL,
  `before` varchar(40) DEFAULT NULL,
  `after` varchar(40) DEFAULT NULL,
  `ref` varbinary(1024) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `pushed_at` datetime(6) NOT NULL,
  `push_type` tinyint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pushes_on_repository_id_and_after` (`repository_id`,`after`),
  KEY `index_pushes_on_repository_id_and_ref_and_pushed_at` (`repository_id`,`ref`,`pushed_at`),
  KEY `index_pushes_on_repository_id_and_pusher_id_and_pushed_at` (`repository_id`,`pusher_id`,`pushed_at`),
  KEY `index_pushes_on_repository_id_and_pushed_at` (`repository_id`,`pushed_at`),
  KEY `index_pushes_on_repository_id_and_push_type_and_pushed_at` (`repository_id`,`push_type`,`pushed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
