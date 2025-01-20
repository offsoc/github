DROP TABLE IF EXISTS `authentication_tokens`;
CREATE TABLE `authentication_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `authenticatable_id` bigint NOT NULL,
  `authenticatable_type` enum('IntegrationInstallation','ScopedIntegrationInstallation','SiteScopedIntegrationInstallation') COLLATE utf8mb3_general_ci NOT NULL,
  `hashed_value` varbinary(44) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `token_last_eight` char(8) DEFAULT NULL,
  `expires_at_timestamp` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_authentication_tokens_on_hashed_value` (`hashed_value`),
  KEY `index_authentication_tokens_on_authenticatable_id_and_type` (`authenticatable_id`,`authenticatable_type`),
  KEY `index_authentication_tokens_on_expires_at_timestamp` (`expires_at_timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `scoped_integration_installations`;
CREATE TABLE `scoped_integration_installations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `integration_installation_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` bigint DEFAULT NULL,
  `authorization_details` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_scoped_installations_on_integration_installation_id` (`integration_installation_id`),
  KEY `index_scoped_integration_installations_on_created_at` (`created_at`),
  KEY `index_scoped_integration_installations_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `site_scoped_integration_installations`;
CREATE TABLE `site_scoped_integration_installations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `integration_id` bigint unsigned NOT NULL,
  `target_id` bigint unsigned NOT NULL,
  `target_type` varchar(25) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` bigint DEFAULT NULL,
  `rate_limit` int DEFAULT NULL,
  `authorization_details` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_site_scoped_integration_installations_on_integration_id` (`integration_id`),
  KEY `index_site_scoped_integration_installations_on_target` (`target_id`,`target_type`),
  KEY `index_site_scoped_integration_installations_on_created_at` (`created_at`),
  KEY `index_site_scoped_integration_installations_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
