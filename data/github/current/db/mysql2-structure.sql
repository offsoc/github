DROP TABLE IF EXISTS `custom_inboxes`;
CREATE TABLE `custom_inboxes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varbinary(1024) NOT NULL,
  `query_string` varbinary(1024) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_custom_inboxes_on_user_id_and_name` (`user_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `hidden_users`;
CREATE TABLE `hidden_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_hidden_users_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `mobile_push_notification_schedules`;
CREATE TABLE `mobile_push_notification_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `day` tinyint NOT NULL,
  `start_time` varchar(8) DEFAULT NULL,
  `end_time` varchar(8) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `starts_at` varchar(8) DEFAULT NULL,
  `ends_at` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_schedules_on_day_and_user` (`user_id`,`day`),
  KEY `index_schedules_on_user_and_day_and_start_time_and_end_time` (`user_id`,`day`,`start_time`,`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `mobile_push_notification_settings`;
CREATE TABLE `mobile_push_notification_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `direct_mention` tinyint(1) NOT NULL DEFAULT '0',
  `assignment` tinyint(1) NOT NULL DEFAULT '0',
  `review_requested` tinyint(1) NOT NULL DEFAULT '0',
  `deployment_request` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `scheduled_notifications` tinyint(1) NOT NULL DEFAULT '0',
  `pull_request_review` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_mobile_push_settings_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `notification_key_values`;
CREATE TABLE `notification_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_notification_key_values_on_key` (`key`),
  KEY `index_notification_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `notification_subscription_events`;
CREATE TABLE `notification_subscription_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscription_type` varchar(255) NOT NULL,
  `subscription_id` bigint NOT NULL,
  `event_name` varchar(32) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_events_on_subscription_type_id_and_name` (`subscription_type`,`subscription_id`,`event_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `notification_subscriptions`;
CREATE TABLE `notification_subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `list_type` varchar(64) NOT NULL DEFAULT 'Repository',
  `list_id` bigint unsigned NOT NULL,
  `ignored` tinyint(1) NOT NULL,
  `notified` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_notification_subscriptions_on_user_list_type_and_list_id` (`user_id`,`list_type`,`list_id`),
  KEY `index_notification_subscriptions_on_list_ignored_and_created_at` (`list_type`,`list_id`,`ignored`,`created_at`),
  KEY `index_notification_subscriptions_on_notified_list_type_and_user` (`notified`,`list_type`,`user_id`),
  KEY `index_notification_subscriptions_on_user_list_ignored_created_at` (`user_id`,`list_type`,`ignored`,`created_at`),
  KEY `index_notification_subscriptions_on_notified_and_user_id` (`notified`,`user_id`),
  KEY `index_notification_subscriptions_on_list_ignored_and_user` (`list_type`,`list_id`,`ignored`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `notification_thread_subscriptions`;
CREATE TABLE `notification_thread_subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `list_type` varchar(64) NOT NULL DEFAULT 'Repository',
  `list_id` bigint unsigned NOT NULL,
  `ignored` tinyint(1) NOT NULL,
  `reason` varchar(40) DEFAULT NULL,
  `thread_key` varchar(80) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_on_list_type_and_list_id_and_thread_key_and_user_id` (`list_type`,`list_id`,`thread_key`,`user_id`),
  KEY `index_notification_thread_subscriptions_on_lt_li_thrd_and_ignore` (`list_type`,`list_id`,`thread_key`,`ignored`),
  KEY `user_id_and_ignored_and_list_type_and_list_id_and_thread_key` (`user_id`,`ignored`,`list_type`,`list_id`,`thread_key`),
  KEY `index_on_list_id_user_id_reason_list_type_ignored` (`list_id`,`user_id`,`reason`,`list_type`,`ignored`),
  KEY `index_on_user_id_list_type_ignored` (`user_id`,`list_type`,`ignored`),
  KEY `index_on_list_id_user_id_list_type_ignored` (`list_id`,`user_id`,`list_type`,`ignored`),
  KEY `index_on_user_id_reason_list_type_ignored` (`user_id`,`reason`,`list_type`,`ignored`),
  KEY `index_list_type_reason_thread_key_11` (`list_type`,`reason`,`thread_key`(11))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `notification_thread_type_subscriptions`;
CREATE TABLE `notification_thread_type_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `list_id` int NOT NULL,
  `list_type` varchar(64) NOT NULL DEFAULT 'Repository',
  `thread_type` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_notification_tts_by_list_and_user` (`list_id`,`list_type`,`user_id`,`thread_type`),
  KEY `index_notification_thread_type_subscriptions_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `notification_user_settings`;
CREATE TABLE `notification_user_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `raw_data` blob,
  `auto_subscribe` tinyint(1) NOT NULL DEFAULT '1',
  `auto_subscribe_teams` tinyint(1) NOT NULL DEFAULT '1',
  `notify_own_via_email` tinyint(1) NOT NULL DEFAULT '0',
  `participating_web` tinyint(1) NOT NULL DEFAULT '0',
  `participating_email` tinyint(1) NOT NULL DEFAULT '1',
  `subscribed_web` tinyint(1) NOT NULL DEFAULT '0',
  `subscribed_email` tinyint(1) NOT NULL DEFAULT '1',
  `notify_comment_email` tinyint(1) NOT NULL DEFAULT '1',
  `notify_pull_request_review_email` tinyint(1) NOT NULL DEFAULT '1',
  `notify_pull_request_push_email` tinyint(1) NOT NULL DEFAULT '1',
  `vulnerability_web` tinyint(1) NOT NULL DEFAULT '0',
  `vulnerability_email` tinyint(1) NOT NULL DEFAULT '0',
  `vulnerability_cli` tinyint(1) NOT NULL DEFAULT '1',
  `participating_web_push` tinyint(1) NOT NULL DEFAULT '0',
  `continuous_integration_email` tinyint(1) NOT NULL DEFAULT '1',
  `continuous_integration_web` tinyint(1) NOT NULL DEFAULT '0',
  `continuous_integration_failures_only` tinyint(1) NOT NULL DEFAULT '1',
  `direct_mention_mobile_push` tinyint(1) NOT NULL DEFAULT '0',
  `org_deploy_key_email` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
