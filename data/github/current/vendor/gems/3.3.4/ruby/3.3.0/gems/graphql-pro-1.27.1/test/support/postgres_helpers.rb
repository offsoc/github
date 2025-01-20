# frozen_string_literal: true

module PostgresHelpers
  extend self

  def reset_model_classes
    GraphQL::Pro::OperationStore::ActiveRecordBackend.constants.each do |const|
      GraphQL::Pro::OperationStore::ActiveRecordBackend.send(:remove_const, const)
    end
    model_files = [
      "lib/graphql/pro/operation_store/active_record_backend/graphql_operation_store_model.rb",
      "lib/graphql/pro/operation_store/active_record_backend/orphan_removal.rb",
      "lib/graphql/pro/operation_store/active_record_backend/graphql_index_reference.rb",
      "lib/graphql/pro/operation_store/active_record_backend/graphql_client_operation.rb",
      "lib/graphql/pro/operation_store/active_record_backend/graphql_index_entry.rb",
      "lib/graphql/pro/operation_store/active_record_backend/graphql_client.rb",
      "lib/graphql/pro/operation_store/active_record_backend/graphql_operation.rb",
    ]

    model_files.each { |f| load(f) }
  end

  def with_connection(opts = connection_options)
    return if @already_setup
    prev_conn = active_record_config
    ActiveRecord::Base.establish_connection(opts)
    reset_model_classes
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
    reset_model_classes
  end

  def connection_options
    database = ENV["POSTGRES_DB"] || "graphql_pro_test"
    user = ENV["POSTGRES_USER"]
    pass = ENV["POSTGRES_PASSWORD"]

    {
      host: "localhost",
      port: "5432",
      adapter: "postgresql",
      database: database,
      username: user,
      password: pass,
    }
  end

  def setup_database_once
    return if @setup_once
    @setup_once = true
    if !ENV["POSTGRES_DB"]
      # This database might not exist; don't care.
      `dropdb graphql_pro_test 2>&1`
      `createdb graphql_pro_test`
    end
    with_connection do
      ActiveRecordSetup.define_schema
      OperationStoreHelpers.add_fixtures(OperationStoreHelpers::ActiveRecordBackendSchema.operation_store)
    end
  end
end
