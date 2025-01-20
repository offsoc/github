# frozen_string_literal: true

module SqliteHelpers
  extend self

  DB_PATH = File.expand_path("../test.db", __FILE__)
  `rm -rf #{DB_PATH}`

  def connection_options
    {adapter: "sqlite3", database: DB_PATH}
  end

  def setup_database_once
    return if @setup_once
    @setup_once = true
    FileUtils.rm_rf(DB_PATH)
    ActiveRecordSetup.define_schema
    OperationStoreHelpers.add_fixtures(OperationStoreHelpers::ActiveRecordBackendSchema.operation_store)
  end
end
