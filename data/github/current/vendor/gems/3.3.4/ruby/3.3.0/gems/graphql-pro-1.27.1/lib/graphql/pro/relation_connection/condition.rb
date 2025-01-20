# frozen_string_literal: true

module GraphQL
  module Pro
    module RelationConnection
      module Condition
        COMPARISON_OPERATORS = {
          before: {
            asc: "<",
            desc: ">"
          },
          after: {
            asc: ">",
            desc: "<"
          }
        }

        # Prepare a SQL filter which will allow items
        # continuing from `cursor` in the direction of `before_or_after`.
        #
        # @param relation [Relation] the relation being paginated
        # @param cursor [String] A decrypted before- or after-cursor
        # @param direction [:before, :after] Which direction from `cursor` do you want to allow?
        # @param order_values [Array] order values from the relation
        # @param allow_eq [Boolean] For grouped relations, you don't have a primary key,
        #   So the next out-of-bounds item will have a value _equal_ to the cursor value.
        #   You have to let the caller specify that.
        # @param small_nulls [Boolean] True if this database's default null handling treats them as smaller than any other value
        # @return [Array(String, Array)] SQL template and bind values
        def self.build_condition(relation:, aliased_selects:, cursor:, direction:, order_values:, allow_eq:, small_nulls:)
          comparison_operators = COMPARISON_OPERATORS.fetch(direction)

          sql_conditions = []
          sql_values = []
          cursor_values = JSON.parse(cursor).map do |cursor_value|
            if cursor_value.is_a?(Array) && defined?(PG::TextEncoder)
              PG::TextEncoder::Array.new.encode(cursor_value)
            else
              cursor_value
            end
          end
          prev_values = []
          prev_condition = nil
          first_priority_nulls_first = false
          connection = relation.connection
          cursor_values.each_with_index do |val, idx|
            normalized_order = order_values[idx] || raise(GraphQL::ExecutionError, "The provided cursor was invalid, please fetch a new cursor and try again")
            order_table_name = normalized_order.table_name
            col_name = normalized_order.name
            asc_or_desc = normalized_order.dir

            column_id = if !order_table_name && !relation.column_names.include?(col_name)
              # If it's not one of the columns, it's a result of grouping
              "#{col_name}"
            elsif order_table_name == false
              "#{col_name}"
            else
              "#{connection.quote_table_name(order_table_name || relation.table_name)}.#{connection.quote_column_name(col_name)}"
            end

            column_id = aliased_selects[column_id] || column_id

            nullable = if (order_table_name.nil? || order_table_name == relation.table_name) && (col = relation.model.columns_hash[col_name])
              col.null
            elsif normalized_order.is_not_null
              true
            else
              # don't know about this, and don't have a way to look it up
              true
            end


            nulls_last = case normalized_order.nulls_last
            when nil
              # Get a default value
              if small_nulls || # MySQL, Sqlite
                  normalized_order.is_not_null # makes null 0
                (asc_or_desc == :asc  && direction == :before) ||
                  (asc_or_desc == :desc && direction == :after)
              else
                # Postgres
                case asc_or_desc
                when :asc
                  direction == :after
                else
                  direction == :before
                end
              end
            when true
              # The query has specified nulls last
              direction == :after
            when false
              # The query has specified nulls first
              direction == :before
            else
              raise "Invariant: unexpected `nulls_last` value: #{normalized_order.nulls_last.inspect}"
            end

            if first_priority_nulls_first == false && nulls_last == false
              first_priority_nulls_first = true
            end

            condition_val = if normalized_order.is_not_null
              nil
            else
              val
            end

            if condition_val.nil?
              if val.nil? || (normalized_order.is_not_null && is_not_null_falsey?(val))
                eq_operator = "IS"
                comparison_operator = "IS NOT"
                comparison_eq_operator = "IS NOT"
              else
                eq_operator = "IS NOT"
                comparison_operator = "IS"
                comparison_eq_operator = "IS"
              end
            else
              eq_operator = "="
              comparison_operator = comparison_operators.fetch(asc_or_desc)
              comparison_eq_operator = "#{comparison_eq_operator}="
            end

            # Keep open to future NULL values if
            # there maybe more nulls ahead.
            or_null = if nullable && nulls_last && (!first_priority_nulls_first) && ((!normalized_order.is_not_null) || is_not_null_falsey?(val))
              " OR #{column_id} IS NULL"
            else
              ""
            end

            # This is the second (or later) cursor value
            if prev_condition
              next_condition = "#{prev_condition} AND #{column_id} #{comparison_operator} ?"
              prev_condition += " AND #{column_id} #{eq_operator} ?"
            else
              # This is the first cursor value
              next_condition_operator = allow_eq ? comparison_eq_operator : comparison_operator
              next_condition = "#{column_id} #{next_condition_operator} ?"
              # This will be used by the next iteration
              prev_condition = "#{column_id} #{eq_operator} ?"
            end
            skip_condition = nulls_last ? (val.nil? || (normalized_order.is_not_null && is_not_null_falsey?(val))) : (normalized_order.is_not_null && is_not_null_truthy?(val))

            prev_values << condition_val
            if skip_condition
              # Don't append a condition
              # This assumes that there _is_ a value after this one
              if cursor_values.size == (idx + 1)
                # This is the last value
                raise "Invariant: the final sort column can't have null values (#{column_id})"
              end
            elsif or_null == ""
              sql_conditions << next_condition
              sql_values.concat(prev_values)
            else
              sql_conditions << "(#{next_condition}#{or_null})"
              sql_values.concat(prev_values)
            end

          end
          condition_string = sql_conditions.size > 1 ? "(#{sql_conditions.join(" OR ")})" : sql_conditions.first
          [condition_string, sql_values]
        end

        class << self
          private

          # Postgresql uses true/false, MySQL and sqlite use 1/0
          def is_not_null_truthy?(value)
            value == 1 || value == true
          end

          def is_not_null_falsey?(value)
            value == 0 || value == false
          end
        end
      end
    end
  end
end
