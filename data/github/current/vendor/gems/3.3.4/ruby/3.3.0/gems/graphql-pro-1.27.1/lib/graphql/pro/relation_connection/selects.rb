# frozen_string_literal: true

module GraphQL
  module Pro
    module RelationConnection
      module Selects
        class CursorValueMissingError < GraphQL::Error
        end

        ALIASED_SELECT = /\s*(?<selection>#{Patterns::COLUMN_ID}|#{Patterns::FUNCTION_CALL}|#{Patterns::CASE}|#{Patterns::POSTGRES_JSON_ACCESS}|\(.*\)#{Patterns::POSTGRES_CAST}?)\s+AS\s+(["`]?(?<alias>\w*)["`]?)\s*/im

        # Add some select fields to the `SELECT` part the of the query
        # so that we can reliably access them from the result.
        #
        # The selected fields are called `cursor_{idx}`, and they can be extracted to build cursors.
        #
        # @return [ActiveRecord::Relation] An equivalent relation, with added selects
        # @return [Hash<String => String>] A map of aliases to the original select fields
        def self.apply(relation, order_values)
          conn = relation.connection
          if relation.select_values.empty?
            relation = relation.select("#{conn.quote_table_name(relation.table_name)}.*")
          end
          aliased_selects = {}
          relation.select_values.each do |select_value|
            case select_value
            when String
              # Check if this a `(table_name.?column_name|function)` AS alias`
              if (match = select_value.match(ALIASED_SELECT))
                aliased_selects[match[:alias]] = match[:selection]
              end
            else
              # Ignore symbols (is anything else possible here?)
            end
          end

          order_values.each_with_index do |v, idx|
            selection = if v.table_name == false
              v.name
            else
              table_name = v.table_name || relation.table_name
              column_name = v.name
              if v.is_quoted != false
                table_name = conn.quote_table_name(table_name)
                column_name = conn.quote_column_name(column_name)
              end
              "#{table_name}.#{column_name}"
            end

            if v.is_not_null
              selection += " IS NOT NULL"
            end
            # If the order value is a reference to an aliased selection,
            # then grab the expression that was aliased and re-add it
            # with a cursor-related alias.
            # (If it wasn't aliased, then use the selection verbatim.)
            selection = aliased_selects[selection] || selection
            relation = relation.select("#{selection} AS cursor_#{idx}")
          end

          return relation, aliased_selects
        end

        # Build a String cursor using the aliased fields in the selection
        # @see {Selects.apply} where those selections are added
        # @param node [Object] a member of the relation
        # @param order_values [Array] extracted order values from the relation
        # @return [String] a value to be encoded and returned
        def self.cursor_for(node, order_values)
          cursor_values = order_values.each_with_index.map { |v, idx|
            cursor_method = "cursor_#{idx}"
            cursor_value = if !node.respond_to?(cursor_method)
              raise(CursorValueMissingError, "Failed to build GraphQL cursor, no method `#{cursor_method}` on #{node} (found: #{node.attributes.keys})")
            else
              node.public_send(cursor_method)
            end
            prepare_cursor_value(cursor_value)
          }
          JSON.dump(cursor_values)
        end

        class << self
          private

          # JSON's default datetime format doesn't include fractional seconds,
          # but that's required for precise, stable cursors. So we've improved
          # serialization in that case.
          #
          # If you're having trouble because of this, please let me know!
          #
          # @param value [Object] A value read from the database adapter
          # @return [Object] something ready for `JSON.dump`
          def prepare_cursor_value(value)
            if value.respond_to?(:strftime)
              value.strftime("%Y-%m-%d %H:%M:%S.%N %Z")
            else
              value
            end
          end
        end
      end
    end
  end
end
