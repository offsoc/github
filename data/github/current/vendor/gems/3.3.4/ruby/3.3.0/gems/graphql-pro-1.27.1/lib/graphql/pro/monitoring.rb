# frozen_string_literal: true
require "graphql/pro/monitoring/appsignal_platform"
require "graphql/pro/monitoring/datadog_platform"
require "graphql/pro/monitoring/new_relic_platform"
require "graphql/pro/monitoring/scout_platform"
require "graphql/pro/monitoring/skylight_platform"
require "graphql/pro/monitoring/statsd_platform"
require "graphql/pro/monitoring/eager_load_relation"
require "graphql/pro/monitoring/instrumentation"
require "graphql/pro/monitoring/define_monitoring"

module GraphQL
  module Pro
    module Monitoring
      def self.get_type_and_name(query)
        selected_op = query.selected_operation
        if selected_op
          op_type = selected_op.operation_type
          op_name = selected_op.name || "anonymous"
        else
          op_type = "query"
          op_name = "anonymous"
        end

        return op_type, op_name
      end

      METADATA_KEY = :__graphql_pro_monitoring__

      defn_method = GraphQL::Schema.respond_to?(:deprecated_accepts_definitions) ? :deprecated_accepts_definitions : :accepts_definitions

      GraphQL::Schema.public_send(defn_method,
        monitoring: DefineMonitoring.method(:schema_monitoring)
      )
      GraphQL::Field.public_send(defn_method,
        monitoring: DefineMonitoring.method(:member_monitoring)
      )
      GraphQL::BaseType.public_send(defn_method,
        monitoring: DefineMonitoring.method(:member_monitoring)
      )
    end
  end
end
