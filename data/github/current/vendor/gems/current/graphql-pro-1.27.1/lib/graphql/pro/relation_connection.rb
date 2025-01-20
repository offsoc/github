# frozen_string_literal: true

module GraphQL
  module Pro
    module RelationConnection
      module Patterns
        FUNCTION_CALL = '((?:[a-z._]+)\(.*\))'
        COLUMN_ID = '((?<table_open_quote>["`])?(?<table>\w*)["`]?\.)?(?<column_open_quote>["`])?(?<column>[^\s"`]*)["`]?'
        CASE = '(case.*end)'
        POSTGRES_JSON_ACCESS = "(#{COLUMN_ID} *->{1,2} *'[a-z_0-9]+')"
        POSTGRES_CAST = "(::[a-z0-9_]+)"
      end

      # Load these after Patterns are defined
      if defined?(GraphQL::Relay::BaseConnection)
        require "graphql/pro/relation_connection/column_value_connection"
      end
      require "graphql/pro/relation_connection/condition"
      require "graphql/pro/relation_connection/filter"
      require "graphql/pro/relation_connection/order"
      require "graphql/pro/relation_connection/ordered_relation_connection"
      require "graphql/pro/relation_connection/selects"

      # This is a fake connection!
      # It "just" infers the order from the relation
      # then makes an OrderedRelation and wraps that.
      def self.new(nodes, args, kwargs)
        ordered_nodes, orders = Order.normalize(nodes)
        OrderedRelationConnection.new(ordered_nodes, orders, args, kwargs)
      end

      def self.bidirectional_pagination?
        GraphQL::Relay::ConnectionType.respond_to?(:bidirectional_pagination) &&
          GraphQL::Relay::ConnectionType.bidirectional_pagination
      end
    end

    if defined?(ActiveRecord::Relation) && defined?(GraphQL::Relay::BaseConnection)
      GraphQL::Relay::BaseConnection.register_connection_implementation(
        ActiveRecord::Relation, RelationConnection
      )
    end
  end
end
