DROP TABLE IF EXISTS `notification_deliveries`;
CREATE TABLE `notification_deliveries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `delivered_at` datetime NOT NULL,
  `list_id` int NOT NULL,
  `thread_key` varchar(255) NOT NULL,
  `comment_key` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `handler` varchar(255) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `by_list` (`list_id`,`thread_key`,`comment_key`,`user_id`,`handler`),
  KEY `by_time` (`delivered_at`),
  KEY `by_user` (`user_id`,`list_id`,`thread_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
