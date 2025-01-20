# frozen_string_literal: true
require "graphql/pro/relation_connection/order"
require "graphql/pro/relation_connection/selects"


module GraphQL
  module Pro
    class StableRelationConnection < GraphQL::Pagination::ActiveRecordRelationConnection
      class InvalidCursorError < GraphQL::ExecutionError
        attr_accessor :cursor_value
        attr_reader :argument_name
        def initialize(argument_name:)
          @argument_name = argument_name
        end

        def message
          "Invalid cursor for `#{argument_name}#{cursor_value ? ": #{cursor_value.inspect}" : ""}`. Fetch a new cursor and try again."
        end
      end

      def initialize(items, *args, **kwargs)
        # Use {RelationConnection::Order} to extract ordering information
        # from the given relation
        ordered_items, @order_values = Pro::RelationConnection::Order.normalize(items)
        # Add the `cursor_#{idx}` selects to the relation
        decorated_relation, @aliased_selects = Pro::RelationConnection::Selects.apply(ordered_items, @order_values)
        @nodes_loaded = false
        super(decorated_relation, *args, **kwargs)
      end

      # Build a String cursor using the aliased fields in the selection
      # @see {Selects.apply} where those selections are added
      # @param node [Object] a member of the relation
      # @return [String] GraphQL-ready cursor for `cursor`
      def cursor_for(node)
        stringified_value = Pro::RelationConnection::Selects.cursor_for(node, @order_values)
        context.schema.cursor_encoder.encode(stringified_value, nonce: true)
      end

      # Override this hook so that `node` can be annotated with the `SELECT`s
      # required for building a cursor.
      def range_add_edge(node)
        node_with_selects = items.find(node.id)
        edge_class.new(node_with_selects, self)
      end

      def has_previous_page
        if !defined?(@has_previous_page)
          if offset_fallback?
            @has_previous_page = super
          else
            load_nodes
          end
        end
        !!@has_previous_page
      end

      def has_next_page
        if !defined?(@has_next_page)
          if offset_fallback?
            @has_next_page = super
          else
            load_nodes
          end
        end
        !!@has_next_page
      end

      def start_cursor
        load_nodes
        @nodes && super
      end

      def end_cursor
        load_nodes
        @nodes && super
      end

      private

      def load_nodes
        if @nodes_loaded
          @nodes
        else
          @nodes_loaded = true
          @nodes = if offset_fallback?
            super
          else
            load_nodes_by_value
          end
        end
      end

      def sliced_nodes
        @sliced_nodes ||= if offset_fallback?
          super
        else
          sliced_nodes_by_value
        end
      end

      def limited_nodes
        @limited_nodes ||= if offset_fallback?
          super
        else
          limited_nodes_by_value
        end
      end

      # When this is true, delegate to offset-based loading;
      # but it will still use this class's `cursor_for` implementation
      # and provide forward-compatible value-based cursors
      def offset_fallback?
        if !defined?(@offset_fallback)
          @offset_fallback = offset_cursor?(after) || offset_cursor?(before)
        end
        @offset_fallback
      end

      def offset_cursor?(cursor)
        !!(cursor && context.schema.cursor_encoder.decode(cursor, nonce: true) =~ /^\d+$/)
      end

      def load_nodes_by_value
        # Add `WHERE` conditions based on the given cursors
        decoded_before = before && before != "" && context.schema.cursor_encoder.decode(before, nonce: true)
        decoded_after = after && after != "" && context.schema.cursor_encoder.decode(after, nonce: true)
        sliced_nodes = Pro::RelationConnection::Filter.filter_relation(
          relation: items,
          order_values: @order_values,
          aliased_selects: @aliased_selects,
          after: decoded_after,
          before: decoded_before,
          allow_eq: false,
          small_nulls: small_nulls?,
        )
        if first
          # If an `after` cursor was given, assume there's a previous page
          @has_previous_page = !!after

          extra_limit = first + 1
          extra_nodes = sliced_nodes.limit(extra_limit)
          extra_nodes_len = begin
            extra_nodes.length
          rescue ActiveRecord::StatementInvalid
            raise InvalidCursorError.new(argument_name: :after)
          end

          if extra_nodes_len == extra_limit
            # There's one more item after the requested `first`
            @has_next_page = true
            @nodes = extra_nodes[0..-2]
          else
            # There aren't any more nodes after these, or
            # else we would have loaded at extra `+ 1`.
            #
            # Alternatively, if there's a `before` cursor given,
            # assume that there are nodes after current set
            # which were hidden because of the `before` cursor's `WHERE` condition,
            # applied above.
            @has_next_page = !!before
            @nodes = extra_nodes
          end
        elsif last
          # If a `before` cursor was given,
          # assume there are items after this one.
          @has_next_page = !!before
          # If a legacy cursor previously used `limit` to implement `before`,
          # grab the value and apply it as offset here.
          previous_limit = sliced_nodes.limit_value || 0
          extra_limit = last + 1
          extra_nodes_q = sliced_nodes.limit(nil).reverse_order.offset(previous_limit).limit(extra_limit)
          extra_nodes = nil
          extra_nodes_len = begin
            extra_nodes = extra_nodes_q.reverse
            extra_nodes.length
          rescue ActiveRecord::StatementInvalid
            raise InvalidCursorError.new(argument_name: :before)
          end
          if extra_nodes_len == extra_limit
            @has_previous_page = true
            @nodes = extra_nodes[1..-1]
          else
            @has_previous_page = false
            @nodes = extra_nodes
          end
        else
          # There's no limit on this connection
          @has_previous_page = !!after
          @has_next_page = !!before
          @nodes = sliced_nodes
        end
      rescue InvalidCursorError => err
        case err.argument_name
        when :after
          err.cursor_value = after
        when :before
          err.cursor_value = before
        end
        @nodes = []
        raise
      end
    end

    class SqliteStableRelationConnection < StableRelationConnection
      def small_nulls?
        true
      end
    end

    class MySQLStableRelationConnection < StableRelationConnection
      def small_nulls?
        true
      end
    end

    class PostgresStableRelationConnection < StableRelationConnection
      def small_nulls?
        false
      end
    end
  end
end
