SET sql_log_bin = OFF;
USE github_enterprise;
DROP PROCEDURE IF EXISTS update_incr;
DROP PROCEDURE IF EXISTS update_incr_all_tables;
DROP PROCEDURE IF EXISTS startup;
DELIMITER //
CREATE PROCEDURE update_incr (IN sch VARCHAR(64), IN tab VARCHAR(64))
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SHOW ERRORS;
    ROLLBACK;
    REPLACE INTO `_mysql_update_incr_status` (`schema`, `table`, `status`) VALUES(sch, tab, 0);
    SELECT 'update_incr stored procedure failed, rolled back';
  END;
  SELECT COLUMN_NAME INTO @columnName from information_schema.columns where TABLE_SCHEMA = sch and TABLE_NAME = tab and EXTRA like '%auto_increment%';
  SELECT COUNT(*) INTO @tableCount FROM information_schema.tables WHERE TABLE_SCHEMA = sch AND TABLE_NAME = tab;
  SET @maxStmt = CONCAT('SELECT COALESCE((SELECT MAX(', @columnName,') FROM ', sch, '.', tab, '), 0) + 1 INTO @newIncr');
  IF (SELECT COUNT(*) from information_schema.tables where TABLE_SCHEMA = sch and TABLE_NAME = CONCAT('archived_',tab))>= 1 THEN
    SET @maxStmt = CONCAT('SELECT GREATEST( COALESCE((SELECT MAX(', @columnName,') FROM ', sch, '.', tab,'), 0),
                                            COALESCE((SELECT MAX(', @columnName,') FROM ', sch, '. archived_', tab,'), 0)) + 1 INTO @newIncr');
  END IF;
  SET @success = 0;
  IF @tableCount >= 1 THEN
    PREPARE maxQuery FROM @maxStmt;
    EXECUTE maxQuery;
    DEALLOCATE PREPARE maxQuery;
    -- Only update auto_increment if there's a mismatch
    SELECT COUNT(*) INTO @mismatchCount FROM information_schema.tables WHERE TABLE_SCHEMA = sch AND TABLE_NAME = tab AND AUTO_INCREMENT != @newIncr;
    IF @mismatchCount >= 1 THEN
      SET @alterStmt = CONCAT('ALTER TABLE ', sch, '.', tab, ' AUTO_INCREMENT = ', @newIncr);
      PREPARE alterQuery FROM @alterStmt;
      EXECUTE alterQuery;
      DEALLOCATE PREPARE alterQuery;
    END IF;
    SET @success = 1;
  END IF;
  REPLACE INTO `_mysql_update_incr_status` (`schema`, `table`, `status`) VALUES(sch, tab, @success);
END//
CREATE PROCEDURE update_incr_all_tables ( )
BEGIN
  DECLARE schemaName, tableName VARCHAR(64);
  DECLARE done INT DEFAULT 0;

  -- get all table_schema and table_name
  DECLARE table_cur
    CURSOR FOR 
    SELECT TABLE_SCHEMA, TABLE_NAME FROM information_schema.TABLES where AUTO_INCREMENT is not NULL and TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys') and TABLE_NAME NOT LIKE 'archived_%';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=1;

  DROP TABLE IF EXISTS `_mysql_update_incr_status`;
  CREATE TABLE `_mysql_update_incr_status` (
      `schema` varchar(64) NOT NULL,
      `table` varchar(64) NOT NULL,
      `status` tinyint(4) NOT NULL DEFAULT '0',
      PRIMARY KEY (`schema`, `table`)
  ) ENGINE=MEMORY;
  
  OPEN table_cur;

  -- Loop through all tables
  getTable: LOOP
    FETCH table_cur INTO schemaName, tableName;
    IF done=1 THEN
	  LEAVE getTable;
    END IF;
    CALL update_incr(schemaName, tableName);

  End LOOP getTable;
  CLOSE table_cur;

END//
CREATE PROCEDURE startup ( )
BEGIN
  -- The autoincr vulnerability (MySQL Bug #199) has been fixed in 8.0.0
  IF cast(substring(version(), 1, 1) AS UNSIGNED) < 8 THEN
    CALL update_incr_all_tables();
  ELSE
    DROP TABLE IF EXISTS `_mysql_update_incr_status`;
  END IF;
END//
DELIMITER ;
CALL github_enterprise.startup();
DROP PROCEDURE startup;
DROP PROCEDURE update_incr_all_tables;
DROP PROCEDURE update_incr;
