# frozen_string_literal: true
module GraphQL
  module Pro
    module RelationConnection
      # Contains pagination logic when you have a value-based cursor
      # @api private
      class ColumnValueConnection < GraphQL::Relay::BaseConnection
        def initialize(nodes, order_values, args, **kwargs)
          @order_values = order_values
          super(nodes, args, **kwargs)
          @decoded_after = after && decode(after)
          @decoded_before = before && decode(before)
        end

        def has_next_page
          if first
            next_page_and_nodes
            @has_next_page
          elsif before && RelationConnection.bidirectional_pagination?
            # Is there an item _after_ this cursor?
            relation = Pro::RelationConnection::Filter.filter_relation(
              relation: @nodes,
              order_values: @order_values,
              aliased_selects: {},
              after: @decoded_after,
              allow_eq: true,
              small_nulls: false, # dunno, default to postgres
            )
            relation.limit(1).length == 1
          else
            false
          end
        end

        def has_previous_page
          if last && !first
            prev_page_and_nodes
            @has_previous_page
          elsif after && RelationConnection.bidirectional_pagination?
            # Is there an item _before_ this cursor?
            has_item_before_after_cursor?
          else
            # You're on the first page!
            false
          end
        end

        private

        def paged_nodes
          @paged_nodes ||= begin
            if first || last.nil?
              _has_page, nodes = next_page_and_nodes
            else
              _has_page, nodes = prev_page_and_nodes
            end
            nodes
          end
        end

        def sliced_nodes
          @sliced_nodes ||= begin
            Pro::RelationConnection::Filter.filter_relation(
              relation: @nodes,
              order_values: @order_values,
              aliased_selects: {},
              after: @decoded_after,
              before: @decoded_before,
              allow_eq: false,
              # We don't actually know what database is being used here, use Postgres
              small_nulls: false,
            )
          end
        end

        def nodes_limit
          @nodes_limit ||= [first, last, max_page_size].compact.min
        end

        def prev_page_and_nodes
          if @prev_nodes.nil?
            if nodes_limit.nil?
              @prev_nodes = sliced_nodes
              if after
                @has_previous_page = has_item_before_after_cursor?
              else
                @has_previous_page = false
              end
            else
              extra_limit = nodes_limit + 1
              extra_nodes = sliced_nodes.reverse_order.limit(extra_limit).reverse

              if extra_nodes.length == extra_limit
                @has_previous_page = true
                @prev_nodes = extra_nodes[1..-1]
              else
                @has_previous_page = false
                @prev_nodes = extra_nodes
              end
            end
          end

          return @has_previous_page, @prev_nodes
        end

        def next_page_and_nodes
          if @next_nodes.nil?
            if nodes_limit.nil?
              @next_nodes = sliced_nodes
              @has_next_page = false
            else
              extra_limit = nodes_limit + 1
              extra_nodes = sliced_nodes.limit(extra_limit)
              if extra_nodes.length == extra_limit
                # Is there one more item after these items?
                @has_next_page = true
                @next_nodes = extra_nodes[0..-2]
              else
                @has_next_page = false
                @next_nodes = extra_nodes
              end
            end
          end

          return @has_next_page, @next_nodes
        end

        def has_item_before_after_cursor?
          if !defined?(@has_item_before_after_cursor)
            relation = Pro::RelationConnection::Filter.filter_relation(
              relation: @nodes,
              order_values: @order_values,
              aliased_selects: {},
              before: @decoded_after,
              allow_eq: true,
              small_nulls: false, # dunno, so behave like postgres
            )
            @has_item_before_after_cursor = relation.limit(1).length == 1
          else
            @has_item_before_after_cursor
          end
        end
      end
    end
  end
end
