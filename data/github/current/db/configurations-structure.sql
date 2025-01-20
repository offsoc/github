DROP TABLE IF EXISTS `configuration_entries`;
CREATE TABLE `configuration_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `target_id` bigint unsigned NOT NULL,
  `target_type` varchar(30) NOT NULL,
  `updater_id` bigint unsigned NOT NULL,
  `name` varchar(80) NOT NULL,
  `value` varchar(255) NOT NULL,
  `final` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_configuration_entries_on_target_and_name` (`target_id`,`target_type`,`name`),
  KEY `index_on_target_type_and_target_id_and_name_and_value_and_final` (`target_type`,`target_id`,`name`,`value`,`final`),
  KEY `index_configuration_entries_on_name_and_target_type_and_value` (`name`,`target_type`,`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
