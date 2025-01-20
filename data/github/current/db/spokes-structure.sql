DROP TABLE IF EXISTS `cache_storage_policies`;
CREATE TABLE `cache_storage_policies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `entity_id` bigint unsigned NOT NULL,
  `entity_type` tinyint NOT NULL,
  `cache_location` varchar(20) NOT NULL,
  `number_of_replicas` tinyint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_cache_storage_policies_on_entity_id_and_entity_type` (`entity_id`,`entity_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `cold_networks`;
CREATE TABLE `cold_networks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `network_id` int NOT NULL,
  `state` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_cold_networks_on_network_id` (`network_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `datacenters`;
CREATE TABLE `datacenters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `datacenter` varchar(8) NOT NULL,
  `region` varchar(8) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_datacenters_on_datacenter` (`datacenter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `entity_problems`;
CREATE TABLE `entity_problems` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `repository_type` tinyint unsigned NOT NULL,
  `network_id` bigint unsigned NOT NULL,
  `priority` tinyint unsigned NOT NULL,
  `task_name` varchar(25) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `state` tinyint unsigned DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_repository_id_repository_type_and_network_id` (`repository_id`,`repository_type`,`network_id`),
  KEY `index_on_priority_updated_at_id_state` (`priority`,`updated_at`,`id`,`state`),
  KEY `index_on_priority_created_at` (`priority`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `fileservers`;
CREATE TABLE `fileservers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `host` varchar(255) NOT NULL,
  `fqdn` varchar(255) NOT NULL,
  `embargoed` tinyint(1) NOT NULL DEFAULT '0',
  `online` tinyint(1) NOT NULL DEFAULT '0',
  `evacuating` tinyint(1) NOT NULL DEFAULT '0',
  `quiescing` tinyint(1) NOT NULL DEFAULT '0',
  `datacenter` varchar(20) DEFAULT NULL,
  `rack` varchar(20) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `evacuating_reason` varchar(255) DEFAULT NULL,
  `quiescing_reason` varchar(255) DEFAULT NULL,
  `embargoed_reason` varchar(255) DEFAULT NULL,
  `non_voting` tinyint(1) NOT NULL DEFAULT '0',
  `hdd_storage` tinyint(1) NOT NULL DEFAULT '0',
  `site` varchar(20) DEFAULT NULL,
  `cache_location` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_fileservers_on_host` (`host`),
  UNIQUE KEY `index_fileservers_on_fqdn` (`fqdn`),
  KEY `index_fileservers_by_location` (`datacenter`,`rack`),
  KEY `index_fileservers_on_site_and_rack` (`site`,`rack`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `gist_replicas`;
CREATE TABLE `gist_replicas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `gist_id` int NOT NULL,
  `host` varchar(255) NOT NULL,
  `checksum` varchar(255) NOT NULL,
  `state` int NOT NULL,
  `read_weight` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_gist_replicas_on_gist_id_and_host` (`gist_id`,`host`),
  KEY `index_gist_replicas_on_updated_at` (`updated_at`),
  KEY `index_gist_replicas_on_state` (`state`),
  KEY `index_gist_replicas_on_host_and_state_and_gist_id` (`host`,`state`,`gist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `network_replicas`;
CREATE TABLE `network_replicas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `network_id` int NOT NULL,
  `host` varchar(255) NOT NULL,
  `state` int NOT NULL,
  `read_weight` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_host` (`network_id`,`host`),
  KEY `index_network_replicas_on_state` (`state`),
  KEY `index_network_replicas_on_host_and_state_and_network_id` (`host`,`state`,`network_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_checksums`;
CREATE TABLE `repository_checksums` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repository_id` int NOT NULL,
  `repository_type` int NOT NULL DEFAULT '0',
  `checksum` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_checksums_on_repository_type` (`repository_id`,`repository_type`),
  KEY `index_repository_checksums_on_updated_at` (`updated_at`),
  KEY `index_repository_checksums_on_repository_type_and_updated_at` (`repository_type`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `repository_replicas`;
CREATE TABLE `repository_replicas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `repository_type` int NOT NULL DEFAULT '0',
  `host` varchar(255) NOT NULL,
  `checksum` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `network_replica_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_repository_replicas_on_repository_type_and_host` (`repository_id`,`repository_type`,`host`),
  KEY `update_time` (`updated_at`),
  KEY `host_only` (`host`),
  KEY `index_repository_replicas_on_network_replica_id` (`network_replica_id`),
  KEY `repo_id_and_repo_type_and_replica_id_and_checksum_and_host` (`repository_id`,`repository_type`,`network_replica_id`,`checksum`,`host`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sites`;
CREATE TABLE `sites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site` varchar(12) NOT NULL,
  `region` varchar(8) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sites_on_site` (`site`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
