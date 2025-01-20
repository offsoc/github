# frozen_string_literal: true

module MysqlHelpers
  extend self

  def with_connection
    prev_conn = active_record_config
    ActiveRecord::Base.establish_connection(connection_options)
    if block_given?
      begin
        yield
      ensure
        restore_connection(prev_conn)
      end
    else
      prev_conn
    end
  end

  def self.restore_connection(prev_conn)
    ActiveRecord::Base.establish_connection(prev_conn)
  end

  def connection_options
    {
      host: "localhost",
      port: "3306",
      adapter: "mysql2",
      database: ENV["MYSQL_DATABASE"] || "graphql_pro_test",
      username: "root",
      password: ENV["MYSQL_ROOT_PASSWORD"],
    }
  end

  def setup_database_once
    return if @setup_once
    @setup_once = true
    if !ENV["MYSQL_DATABASE"]
      `mysql -u root -e "create database if not exists graphql_pro_test"`
      `mysql -u root -Nse 'show tables' graphql_pro_test | while read table; do mysql -u root -e "drop table $table" graphql_pro_test; done`
    end
    with_connection do
      ActiveRecordSetup.define_schema
      OperationStoreHelpers.add_fixtures(OperationStoreHelpers::ActiveRecordBackendSchema.operation_store)
    end
  end
end
