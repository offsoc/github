# frozen_string_literal: true

require "active_record"
require "active_record/connection_adapters/trilogy_adapter"

require "github_trilogy_adapter/version"
require "github_trilogy_adapter/schema_version"
require "github_trilogy_adapter/support_overrides"
require "github_trilogy_adapter/native_database_types"
require "github_trilogy_adapter/quoting"
require "github_trilogy_adapter/driver"
require "github_trilogy_adapter/deadlock_retries"
require "github_trilogy_adapter/query_retries"
require "github_trilogy_adapter/query_data"
require "github_trilogy_adapter/connection_instrumentation"

module ActiveRecord
  module ConnectionAdapters
    class TrilogyAdapter
      prepend ::GitHubTrilogyAdapter::SchemaVersion
      prepend ::GitHubTrilogyAdapter::SupportOverrides
      prepend ::GitHubTrilogyAdapter::NativeDatabaseTypes
      prepend ::GitHubTrilogyAdapter::Quoting
      prepend ::GitHubTrilogyAdapter::Driver
      prepend ::GitHubTrilogyAdapter::DeadlockRetries
      prepend ::GitHubTrilogyAdapter::QueryRetries
      prepend ::GitHubTrilogyAdapter::QueryData
      prepend ::GitHubTrilogyAdapter::ConnectionInstrumentation
    end
  end
end
