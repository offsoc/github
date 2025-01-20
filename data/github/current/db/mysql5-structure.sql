DROP TABLE IF EXISTS `global_stratocaster_indexes`;
CREATE TABLE `global_stratocaster_indexes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `index_key` varchar(32) NOT NULL,
  `value` bigint NOT NULL,
  `modified_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_global_stratocaster_indexes_on_index_key_and_value` (`index_key`,`value`),
  KEY `index_on_index_key_and_modified_at_and_id_and_value` (`index_key`,`modified_at`,`id`,`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `key_values`;
CREATE TABLE `key_values` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_key_values_on_key` (`key`),
  KEY `index_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `search_index_template_configurations`;
CREATE TABLE `search_index_template_configurations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(127) NOT NULL,
  `template_type` varchar(100) NOT NULL,
  `template_version` int NOT NULL DEFAULT '0',
  `cluster` varchar(100) NOT NULL,
  `version_sha` varchar(40) DEFAULT NULL,
  `is_writable` tinyint(1) NOT NULL DEFAULT '0',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_search_index_template_configurations_on_fullname` (`fullname`),
  KEY `index_search_index_template_configurations_on_template_type` (`template_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `stratocaster_indexes`;
CREATE TABLE `stratocaster_indexes` (
  `index_key` varchar(32) NOT NULL DEFAULT '',
  `value` blob NOT NULL,
  PRIMARY KEY (`index_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
/*!50100 PARTITION BY KEY ()
PARTITIONS 2 */;
-- partitions are always set to 2 for consistency checks but may differ in production.
