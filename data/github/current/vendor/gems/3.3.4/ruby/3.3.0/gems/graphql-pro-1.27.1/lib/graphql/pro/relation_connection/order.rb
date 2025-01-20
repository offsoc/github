# frozen_string_literal: true
module GraphQL
  module Pro
    module RelationConnection
      class InvalidRelationError < StandardError; end
      # Infer some ordering from an AR::Relation
      # @api private
      module Order
        class NormalizedOrder
          attr_reader :name, :table_name, :is_not_null, :is_quoted
          attr_accessor :nulls_last, :dir

          def initialize(name, table_name, dir_str, nulls_str, is_not_null, is_quoted)
            @name = name
            @table_name = table_name
            @dir = dir_str =~ /desc/i ? :desc : :asc
            @is_not_null = !!is_not_null
            @nulls_last = nulls_str ? !!(nulls_str =~ /last/i) : nil
            @is_quoted = is_quoted
          end
        end

        SORT_WITH_NULLS = '(?<isnotnull>IS NOT NULL\s+)?(?<sort>(asc|desc))?(\s+(?<nulls>NULLS\s+(?:FIRST|LAST)))?'
        ORDER_BY_CASE = /^\s*(?<case>#{Patterns::CASE})\s*#{SORT_WITH_NULLS}\s*$/mi
        ORDER_BY_FUNCTION_CALL = /^\s*(?<function>#{Patterns::FUNCTION_CALL})\s*#{SORT_WITH_NULLS}\s*$/mi
        ORDER_BY_ARRAY = /\A\s*(?<array>ARRAY\[.*\])\s*#{SORT_WITH_NULLS}\s*\Z/im
        ORDER_BY_COLUMN = /^\s*#{Patterns::COLUMN_ID}?\s*#{SORT_WITH_NULLS}$/i
        ORDER_BY_POSTGRES_JSON_ACCESS = /^\s*(?<json_access>\(?#{Patterns::POSTGRES_JSON_ACCESS}\)?)\s*#{SORT_WITH_NULLS}\s*$/mi

        class << self
          private

          def normalize_arel(arel_node)
            case arel_node
            when Arel::Nodes::NullsFirst
              ordering = normalize_arel(arel_node.expr)
              ordering.nulls_last = false
              ordering
            when Arel::Nodes::NullsLast
              ordering = normalize_arel(arel_node.expr)
              ordering.nulls_last = true
              ordering
            when Arel::Nodes::Ascending, Arel::Nodes::Descending
              dir = arel_node.is_a?(Arel::Nodes::Ascending) ? :asc : :desc
              ordering = normalize_arel(arel_node.expr)
              ordering.dir = dir
              ordering
            when Arel::Attributes::Attribute
              col_name = arel_node.name.to_s
              table_name = arel_node.relation.name
              NormalizedOrder.new(col_name, table_name, dir, nil, nil, nil)
            when Arel::Nodes::SqlLiteral
              NormalizedOrder.new(arel_node, false, nil, nil, nil, nil)
            else
              NormalizedOrder.new(arel_node.to_sql, false, nil, nil, nil, nil)
            end
          end
        end

        # Infer normalized orders from an AR::Relation
        # @return [Array<NormalizedOrder>]
        def self.normalize(relation)
          # This may have orders applied to it
          ordered_relation = relation

          order_values = ordered_relation.order_values.uniq
          order_values.reject!(&:blank?)

          normalized_orders = []

          order_values.each do |v|
            case v
            when Arel::Nodes::Ordering, Arel::Attributes::Attribute
              normalized_orders << normalize_arel(v)
            when String
              case v
              when ORDER_BY_CASE
                # Grab a SQL case statement
                normalized_orders << NormalizedOrder.new($~[:case], false, $~[:sort], $~[:nulls], $~[:isnotnull], nil)
              when ORDER_BY_FUNCTION_CALL
                # Grab a SQL function, maybe followed by NULLS LAST on postgres
                normalized_orders << NormalizedOrder.new($~[:function], false, $~[:sort], $~[:nulls], $~[:isnotnull], nil)
              when ORDER_BY_ARRAY
                # It's a postgres ARRAY[...] selection
                normalized_orders << NormalizedOrder.new($~[:array], false, $~[:sort], $~[:nulls], $~[:isnotnull], nil)
              when ORDER_BY_POSTGRES_JSON_ACCESS
                normalized_orders << NormalizedOrder.new($~[:json_access], false, $~[:sort], $~[:nulls], $~[:isnotnull], nil)
              else
                # It's one or more SQL order-by clauses, in a string
                sorts = v.split(",")
                sorts.each do |sort_s|
                  match = sort_s.match(ORDER_BY_COLUMN)
                  if match.nil?
                    # This is a last-ditch effort to make sense of the ordering
                    normalized_orders << NormalizedOrder.new(sort_s, nil, :asc, nil, nil, nil)
                  else
                    # If no table name was explicitly provided,
                    # don't default to the relation's table name,
                    # because it might be ordered by an aliased SELECT.
                    table_name = match[:table] || false
                    is_quoted = !!(match[:column_open_quote] || match[:table_open_quote])
                    normalized_orders << NormalizedOrder.new(match[:column], table_name, match[:sort], match[:nulls], match[:isnotnull], is_quoted)
                  end
                end
              end
            else
              raise InvalidRelationError, <<-ERR
Unexpected ordering (#{v.class}, #{v.inspect}), can't create a stable cursor for it.

To fix this error, use a different ordering technique or open an issue on GraphQL-Ruby to add support for this kind of ordering: https://github.com/rmosolgo/graphql-ruby/issues

Relation SQL: #{relation.to_sql.inspect}
ERR
            end
          end

          raw_primary_key = ordered_relation.primary_key
          # Ensure that primary key sort is applied, if possible
          # (it's not possible when things are grouped)
          if ordered_relation.group_values.none? && raw_primary_key
            primary_keys = case raw_primary_key
            when Array
              raw_primary_key
            when Symbol
              [raw_primary_key.to_s]
            when String
              raw_primary_key.split(",")
            else
              raise "Unsupported relation primary key: #{raw_primary_key.inspect}\n(relation: #{relation.to_sql.inspect})"
            end

            missing_pkeys = primary_keys.select { |k| normalized_orders.none? { |o| o.name == k } }
            connection = ordered_relation.connection
            missing_pkeys.each do |pkey|
              ordered_relation = ordered_relation.order("#{connection.quote_table_name(ordered_relation.table_name)}.#{connection.quote_column_name(pkey)} asc")
              normalized_orders << NormalizedOrder.new(pkey, ordered_relation.table_name, :asc, nil, nil, true)
            end
          elsif normalized_orders.none?
            raise InvalidRelationError, "Relations must be ordered by a unique value in order to provide stable cursors, please add an `.order(...)` clause"
          end

          return ordered_relation, normalized_orders
        end
      end
    end
  end
end
