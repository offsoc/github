# frozen_string_literal: true
if !ENV["TEST"]

  require 'simplecov'
  SimpleCov.at_exit do
    text_result = +""
    SimpleCov.result.groups.each do |name, files|
      text_result << "Group: #{name}\n"
      text_result << "=" * 40
      text_result << "\n"
      files.each do |file|
        text_result << "#{file.filename} (coverage: #{file.covered_percent.round(2)}% / branch: #{file.branches_coverage_percent.round(2)}%)\n"
      end
      text_result << "\n"
    end
    File.write("test/graphql/pro/coverage.txt", text_result)
    SimpleCov.result.format!
  end

  SimpleCov.start do
    enable_coverage :branch
    primary_coverage :branch
    add_filter %r{^/test/}
    add_group "Authorization", ["lib/graphql/pro/pundit_integration.rb", "lib/graphql/pro/can_can_integration.rb"]
    add_group "OperationStore", ["lib/graphql/pro/operation_store"]
    add_group "Dashboard", ["lib/graphql/pro/dashboard", "lib/graphql/pro/routes.rb"]
    add_group "Stable Connections", [
      "lib/graphql/pro/stable_relation_connection.rb",
      "lib/graphql/pro/relation_connection/condition.rb",
      "lib/graphql/pro/relation_connection/filter.rb",
      "lib/graphql/pro/relation_connection/selects.rb",
      "lib/graphql/pro/relation_connection/order.rb",
    ]
    add_group "Subscriptions", [
      "lib/graphql/pro/subscriptions",
      "lib/graphql/pro/subscriptions.rb",
      "lib/graphql/pro/ably_subscriptions.rb",
      "lib/graphql/pro/pusher_subscriptions.rb",
      "lib/graphql/pro/pubnub_subscriptions.rb",
    ]
    add_group "Legacy", [
      "lib/graphql/pro/monitoring",
      "lib/graphql/pro/access",
      "lib/graphql/pro/repository",
      "lib/graphql/pro/railtie.rb",
      "lib/graphql/pro/relation_connection.rb",
      "lib/graphql/pro/relation_connection/column_value_connection.rb",
      "lib/graphql/pro/relation_connection/ordered_relation_connection.rb",
    ]
    add_group "Encoders", [
      "lib/graphql/pro/encoder",
      "lib/graphql/pro/encoder.rb",
    ]
    add_group "Defer", [
      "lib/graphql/pro/defer.rb",
      "lib/graphql/pro/stream.rb",
    ]
    formatter SimpleCov::Formatter::HTMLFormatter
  end
end

def rails_loaded?
  !ENV["NO_RAILS"]
end

def active_record_config
  ActiveRecord::Base.connection_db_config.configuration_hash
end

if rails_loaded?
  # This is required to auto-load the connection implementation
  require "active_record"
  # This is required to load the railtie
  require "rails"
  require "mongoid"
  MODERN_RAILS = Rails::VERSION::STRING > "4"
  # Configure Rails Environment
  ENV["RAILS_ENV"] = "development"
  if MODERN_RAILS
    require File.expand_path("../dummy/config/environment.rb", __FILE__)
    require "rails/test_help"
  end

  ActiveRecord::Base.logger = Logger.new(StringIO.new)
else
  MODERN_RAILS = false
end

require "graphql/pro"
GRAPHQL_19_PLUS = Gem::Version.new(GraphQL::VERSION) >= Gem::Version.new("1.9.0")
GRAPHQL_110_PLUS = Gem::Version.new(GraphQL::VERSION) >= Gem::Version.new("1.10.0")

require "graphql/batch"
require "minitest"
require "cancan"
require "pundit"
require "minitest/autorun"
require "minitest/reporters"
require "minitest/focus"
require "webmock/minitest"
require "active_support/file_update_checker"
require "logger"
require "redis"
require "sinatra"
require "sinatra/streaming"
require "graphql/pro/stable_relation_connection_assertions"
Dir.glob("./test/support/**/*.rb").each do |f|
  if !defined?(GraphQL::ObjectType) &&
      f.end_with?("repository_helpers.rb", "access_helpers.rb", "access_schema.rb")
    next
  else
    require(f)
  end
end

if rails_loaded?
  ActiveRecord::Base.establish_connection(SqliteHelpers.connection_options)
end

require "graphql/pro/operation_store_assertions"
require "graphql/pro/operation_store/index_assertions"
require "graphql/pro/operation_store/endpoint_assertions"
require "graphql/pro/operation_store/add_operation_batch_assertions"

# Include global monitoring stubs (eg `::NewRelic`)
include MonitoringHelpers

Minitest::Reporters.use! Minitest::Reporters::DefaultReporter.new(color: true)

Minitest.backtrace_filter = Minitest::BacktraceFilter.new

# Split these out so that they can run in parallel
REDIS_NUMBERS = {
  ably: 1,
  pubnub: 2,
  pusher: 3,
  subscriptions: 4,
  migration: 5,
  operation_store: 6,
  dashboard: 7,
  script_client: 8,
  ably_redis_client: 9,
}
ActiveRecord::Base.class_exec do
  # Override this to _not_ cache the table name -- it breaks when switching connections in test
  # because mysql uses backticks for quoting but the other dbs use double-quotes.
  def self.quoted_table_name
    connection.quote_table_name(table_name)
  end
end

def with_sql_log(io: nil)
  print_mode = io.nil?
  if print_mode
    io = StringIO.new
  end
  prev_logger = ActiveRecord::Base.logger
  ActiveRecord::Base.logger = Logger.new(io)
  yield
ensure
  if print_mode && io
    puts io.string
  end
  ActiveRecord::Base.logger = prev_logger
end

def with_bidirectional_pagination
  prev_value = GraphQL::Relay::ConnectionType.bidirectional_pagination
  GraphQL::Relay::ConnectionType.bidirectional_pagination = true
  yield
ensure
  GraphQL::Relay::ConnectionType.bidirectional_pagination = prev_value
end
