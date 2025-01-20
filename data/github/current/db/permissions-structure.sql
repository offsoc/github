DROP TABLE IF EXISTS `organization_programmatic_access_grant_requests`;
CREATE TABLE `organization_programmatic_access_grant_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned NOT NULL,
  `organization_programmatic_access_grant_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `reason` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `user_programmatic_access_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_org_programmatic_grants_requests_on_grant` (`organization_programmatic_access_grant_id`),
  UNIQUE KEY `index_grant_request_on_user_programmatic_access_and_org` (`user_programmatic_access_id`,`organization_id`),
  KEY `index_org_programmatic_grants_requests_on_org` (`organization_id`),
  KEY `index_grant_request_on_user_and_org` (`user_id`,`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `organization_programmatic_access_grants`;
CREATE TABLE `organization_programmatic_access_grants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned NOT NULL,
  `user_programmatic_access_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_org_programmatic_grants_on_access_and_org` (`user_programmatic_access_id`,`organization_id`),
  KEY `index_organization_programmatic_access_grants_on_organization_id` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actor_id` bigint unsigned NOT NULL,
  `actor_type` enum('IntegrationInstallation','OauthAuthorization','OrganizationProgrammaticAccessGrant','OrganizationProgrammaticAccessGrantRequest','ScopedIntegrationInstallation','SiteScopedIntegrationInstallation','User','UserProgrammaticAccessGrant','UserProgrammaticAccessGrantRequest') COLLATE utf8mb3_general_ci NOT NULL,
  `action` int unsigned NOT NULL,
  `subject_id` bigint unsigned NOT NULL,
  `subject_type` varchar(60) NOT NULL,
  `priority` int unsigned NOT NULL DEFAULT '1',
  `parent_id` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ability_id` bigint DEFAULT NULL,
  `expires_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_permissions_by_identity` (`actor_type`,`actor_id`,`subject_type`,`subject_id`,`priority`,`parent_id`),
  UNIQUE KEY `index_permissions_by_subject_type_ability` (`subject_type`,`ability_id`),
  KEY `index_permissions_on_actor_subject_and_action` (`actor_id`,`subject_id`,`actor_type`,`subject_type`,`action`),
  KEY `index_permissions_on_actor_type_and_created_at` (`actor_type`,`created_at`),
  KEY `index_permissions_on_expires_at` (`expires_at`),
  KEY `subject_and_actor_type_and_action_and_priority_and_actor_id` (`subject_id`,`subject_type`,`actor_type`,`action`,`priority`,`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `user_programmatic_access_grant_requests`;
CREATE TABLE `user_programmatic_access_grant_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint unsigned NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `user_programmatic_access_id` bigint unsigned NOT NULL,
  `user_programmatic_access_grant_id` bigint unsigned DEFAULT NULL,
  `reason` varchar(1024) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_grant_request_on_access_and_target` (`user_programmatic_access_id`,`target_id`),
  UNIQUE KEY `index_user_grant_requests_on_grant` (`user_programmatic_access_grant_id`),
  KEY `index_user_grant_requests_on_target` (`target_id`),
  KEY `index_grant_request_on_actor_and_target` (`actor_id`,`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `user_programmatic_access_grants`;
CREATE TABLE `user_programmatic_access_grants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `user_programmatic_access_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_programmatic_grants_on_access_and_user` (`user_programmatic_access_id`,`user_id`),
  KEY `index_user_programmatic_access_grants_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `user_programmatic_accesses`;
CREATE TABLE `user_programmatic_accesses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `programmatic_access_bot_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(40) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `description` varchar(120) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `accessed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_user_programmatic_accesses_on_programmatic_access_bot_id` (`programmatic_access_bot_id`),
  UNIQUE KEY `index_user_programmatic_access_on_user_and_name` (`user_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
