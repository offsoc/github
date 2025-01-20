# frozen_string_literal: true

module GitHubTrilogyAdapter
  module NativeDatabaseTypes
    # Our types drifted away from the upstream types over time. We should
    # probably change these to match upstream, but we may need to be careful
    # to avoid changing the behavior of existing migrations.
    NATIVE_DATABASE_TYPES = ActiveRecord::ConnectionAdapters::TrilogyAdapter::NATIVE_DATABASE_TYPES.merge(
      primary_key: "int(11) NOT NULL auto_increment PRIMARY KEY", # Changed in https://github.com/rails/rails/pull/26266
      float: { name: "float" }, # Changed in https://github.com/rails/rails/pull/28041
      timestamp: { name: "timestamp NULL" }, # Added in https://github.com/rails/rails/pull/23553 without NULL default
    )

    def native_database_types
      NATIVE_DATABASE_TYPES
    end
  end
end
