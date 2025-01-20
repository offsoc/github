# frozen_string_literal: true
module GraphQL
  module Pro
    module RelationConnection
      # Figure out which kind of cursor you received,
      # then pick an object to delegate to
      # @api private
      class OrderedRelationConnection
        extend Forwardable
        def_delegators :@pagination,
          :edge_nodes, :parent, :field, :max_page_size,
          :arguments, :first, :after, :last, :before

        attr_reader :nodes

        def initialize(ordered_relation, order_values, args, kwargs)
          @order_values = order_values
          @nodes, _aliased_selects = Pro::RelationConnection::Selects.apply(ordered_relation, @order_values)
          @cursor_encoder = kwargs[:context].schema.cursor_encoder
          before = args[:before]
          after = args[:after]
          # TODO how to decode only once?
          if (before && decode(before) =~ /\A\d+\Z/) || (after && decode(after) =~ /\A\d+\Z/)
            @pagination = GraphQL::Relay::RelationConnection.new(@nodes, args, **kwargs)
          else
            @pagination = ColumnValueConnection.new(@nodes, @order_values, args, **kwargs)
          end
          @cursors_from_nodes = {}
        end

        def cursor_from_node(node)
          @cursors_from_nodes[node] ||= encode(Pro::RelationConnection::Selects.cursor_for(node, @order_values))
        end

        def encode(cursor)
          @cursor_encoder.encode(cursor, nonce: true)
        end

        def decode(cursor)
          @cursor_encoder.decode(cursor, nonce: true)
        end

        def page_info
          CombinedPageInfo.new(self, @pagination)
        end

        private

        class CombinedPageInfo
          extend Forwardable
          def_delegators :@pagination, :has_next_page, :has_previous_page
          def_delegators :@cursor, :cursor_from_node
          def initialize(cursor, pagination)
            @cursor = cursor
            @pagination = pagination
          end

          # Used by `pageInfo`
          def start_cursor
            if start_node = @pagination.edge_nodes.first
              cursor_from_node(start_node)
            else
              nil
            end
          end

          def end_cursor
            if end_node = @pagination.edge_nodes.last
              cursor_from_node(end_node)
            else
              nil
            end
          end
        end
      end
    end
  end
end
