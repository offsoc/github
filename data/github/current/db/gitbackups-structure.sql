DROP TABLE IF EXISTS `disabled_backups`;
CREATE TABLE `disabled_backups` (
  `reason` varchar(255) NOT NULL,
  `disabled_at` datetime NOT NULL,
  `spec` varchar(255) NOT NULL,
  PRIMARY KEY (`spec`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gist_bases`;
CREATE TABLE `gist_bases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `repo_name` varchar(255) NOT NULL,
  `incremental_id` bigint NOT NULL,
  `path` varchar(255) NOT NULL,
  `key_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_gist_bases_on_repo_name` (`repo_name`),
  KEY `index_gist_bases_on_key_id` (`key_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gist_incrementals`;
CREATE TABLE `gist_incrementals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT NULL,
  `previous_id` bigint DEFAULT NULL,
  `repo_name` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `checksum` varchar(255) DEFAULT NULL,
  `audit_log_len` bigint DEFAULT NULL,
  `key_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_gist_incrementals_previous_unique` (`previous_id`),
  KEY `index_gist_on_repo_name` (`repo_name`),
  KEY `index_gist_incrementals_on_key_id` (`key_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gist_maintenance`;
CREATE TABLE `gist_maintenance` (
  `repo_name` varchar(255) NOT NULL,
  `status` enum('completed','scheduled','running','retry','error') NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `last_maintenance_at` datetime DEFAULT NULL,
  `incrementals` int DEFAULT NULL,
  `mode_s3` enum('absent','required','optional','want-absent','want-required','want-optional') NOT NULL DEFAULT 'required',
  `mode_abs` enum('absent','required','optional','want-absent','want-required','want-optional') NOT NULL DEFAULT 'absent',
  `status_s3` enum('absent','complete','error') NOT NULL DEFAULT 'absent',
  `status_abs` enum('absent','complete','error') NOT NULL DEFAULT 'absent',
  `worker_site` enum('aws','azure') NOT NULL DEFAULT 'aws',
  PRIMARY KEY (`repo_name`),
  KEY `gist_maintenance_on_incrementals` (`incrementals`),
  KEY `index_gist_maintenance_on_status_and_scheduled_at` (`status`,`scheduled_at`),
  KEY `idx_gist_maintenance_on_last_maint_at_and_status_and_incr` (`last_maintenance_at`,`status`,`incrementals`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `key_versions`;
CREATE TABLE `key_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `realm` varchar(255) NOT NULL,
  `version` int NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `deprecated` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_versions_on_realm_and_version` (`realm`,`version`),
  KEY `index_key_versions_on_realm_and_active` (`realm`,`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_bases`;
CREATE TABLE `repository_bases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `network_id` int NOT NULL,
  `path` varchar(255) NOT NULL,
  `incremental_id` bigint NOT NULL,
  `key_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_repository_bases_on_network_id_and_repository_id` (`network_id`),
  KEY `index_repository_bases_on_key_id` (`key_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_incrementals`;
CREATE TABLE `repository_incrementals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT NULL,
  `previous_id` bigint DEFAULT NULL,
  `network_id` int NOT NULL,
  `repository_id` int NOT NULL,
  `path` varchar(255) NOT NULL,
  `checksum` varchar(48) DEFAULT NULL,
  `audit_log_len` bigint DEFAULT NULL,
  `key_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_incrementals_previous_unique` (`previous_id`),
  KEY `index_repository_incrementals_on_key_id` (`key_id`),
  KEY `index_repository_incrementals_on_repository_id_and_checksum` (`repository_id`,`checksum`),
  KEY `index_repository_incrementals_on_ids2` (`network_id`,`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_maintenance`;
CREATE TABLE `repository_maintenance` (
  `network_id` bigint unsigned NOT NULL,
  `status` enum('completed','scheduled','running','retry','error') NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `last_maintenance_at` datetime DEFAULT NULL,
  `incrementals` int DEFAULT NULL,
  `mode_s3` enum('absent','required','optional','want-absent','want-required','want-optional') NOT NULL DEFAULT 'required',
  `mode_abs` enum('absent','required','optional','want-absent','want-required','want-optional') NOT NULL DEFAULT 'absent',
  `status_s3` enum('absent','complete','error') NOT NULL DEFAULT 'absent',
  `status_abs` enum('absent','complete','error') NOT NULL DEFAULT 'absent',
  `worker_site` enum('aws','azure') NOT NULL DEFAULT 'aws',
  PRIMARY KEY (`network_id`),
  KEY `repository_maintenance_on_last_maintenance_at` (`last_maintenance_at`),
  KEY `repository_maintenance_on_incrementals` (`incrementals`),
  KEY `index_repository_maintenance_on_status_and_scheduled_at` (`status`,`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `wal`;
CREATE TABLE `wal` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `path` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_wal_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `wiki_bases`;
CREATE TABLE `wiki_bases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `network_id` int NOT NULL,
  `repository_id` int NOT NULL,
  `incremental_id` bigint NOT NULL,
  `path` varchar(255) NOT NULL,
  `key_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_wiki_bases_on_network_id_and_repository_id` (`network_id`,`repository_id`),
  KEY `index_wiki_bases_on_key_id` (`key_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `wiki_incrementals`;
CREATE TABLE `wiki_incrementals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT NULL,
  `previous_id` bigint DEFAULT NULL,
  `network_id` int NOT NULL,
  `repository_id` int NOT NULL,
  `path` varchar(255) NOT NULL,
  `checksum` varchar(48) DEFAULT NULL,
  `audit_log_len` bigint DEFAULT NULL,
  `key_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_wiki_incrementals_previous_unique` (`previous_id`),
  KEY `index_wiki_incrementals_on_ids` (`network_id`,`repository_id`),
  KEY `index_wiki_incrementals_on_key_id` (`key_id`),
  KEY `index_wiki_incrementals_on_repository_id_and_checksum` (`repository_id`,`checksum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `wiki_maintenance`;
CREATE TABLE `wiki_maintenance` (
  `network_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL,
  `status` enum('completed','scheduled','running','retry','error') NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `last_maintenance_at` datetime DEFAULT NULL,
  `incrementals` int DEFAULT NULL,
  `mode_s3` enum('absent','required','optional','want-absent','want-required','want-optional') NOT NULL DEFAULT 'required',
  `mode_abs` enum('absent','required','optional','want-absent','want-required','want-optional') NOT NULL DEFAULT 'absent',
  `status_s3` enum('absent','complete','error') NOT NULL DEFAULT 'absent',
  `status_abs` enum('absent','complete','error') NOT NULL DEFAULT 'absent',
  `worker_site` enum('aws','azure') NOT NULL DEFAULT 'aws',
  PRIMARY KEY (`network_id`,`repository_id`),
  KEY `wiki_maintenance_on_last_maintenance_at` (`last_maintenance_at`),
  KEY `wiki_maintenance_on_incrementals` (`incrementals`),
  KEY `index_wiki_maintenance_on_status_and_scheduled_at` (`status`,`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
