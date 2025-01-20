DROP TABLE IF EXISTS `abilities_permissions_routing`;
CREATE TABLE `abilities_permissions_routing` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cluster` int NOT NULL DEFAULT '0',
  `subject_type` varchar(60) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_abilities_permissions_routing_by_cluster` (`cluster`,`subject_type`),
  KEY `index_abilities_permissions_routing_by_subject_type` (`subject_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `fine_grained_permissions`;
CREATE TABLE `fine_grained_permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `custom_roles_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `target_type` varchar(60) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_fine_grained_permissions_on_action` (`action`),
  KEY `index_fine_grained_permissions_on_custom_roles_enabled` (`custom_roles_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `fine_grained_permission_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `action` varchar(60) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_role_perms_by_role_and_fgp` (`fine_grained_permission_id`,`role_id`),
  KEY `index_role_permissions_on_role_id_and_action` (`role_id`,`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varbinary(255) NOT NULL,
  `owner_id` bigint unsigned DEFAULT NULL,
  `owner_type` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `base_role_id` bigint unsigned DEFAULT NULL,
  `description` varbinary(608) DEFAULT NULL,
  `target_type` varchar(60) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_roles_on_name_and_owner_id_and_owner_type` (`name`,`owner_id`,`owner_type`),
  KEY `index_roles_on_owner_id_and_owner_type` (`owner_id`,`owner_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `target_type` varchar(60) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `actor_type` varchar(60) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `actor_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_roles_on_role_target_type_actor` (`role_id`,`target_id`,`target_type`,`actor_type`,`actor_id`),
  KEY `idx_user_roles_actor_role_and_target` (`actor_id`,`actor_type`,`role_id`,`target_id`,`target_type`),
  KEY `index_user_roles_on_target_id_and_target_type` (`target_id`,`target_type`),
  KEY `index_user_roles_on_role_id_and_actor_type_and_actor_id` (`role_id`,`actor_type`,`actor_id`),
  KEY `index_user_roles_on_actor_and_target` (`actor_id`,`actor_type`,`target_id`,`target_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
