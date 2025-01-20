DROP TABLE IF EXISTS `verified_commits`;
CREATE TABLE `verified_commits` (
  `oid` binary(20) NOT NULL,
  PRIMARY KEY (`oid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
