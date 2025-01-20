# frozen_string_literal: true

module GraphQL
  module Pro
    module RelationConnection
      module Filter
        # Apply `WHERE` conditions to `relation` based on the given cursors,
        # and the extracted `order_values`.
        #
        # @return [ActiveRecord::Relation] Like the provided one, but with conditions to paginate
        def self.filter_relation(relation:, order_values:, aliased_selects:, before: nil, after: nil, allow_eq:, small_nulls:)
          if before
            current_argument_name = :before
            sql, values = Pro::RelationConnection::Condition.build_condition(relation: relation, aliased_selects: aliased_selects, order_values: order_values, cursor: before, direction: :before, allow_eq: allow_eq, small_nulls: small_nulls)
            relation = if relation.group_values.any?
              relation.having(sql, *values)
            else
              relation.where(sql, *values)
            end
          end

          if after
            current_argument_name = :after
            sql, values = Pro::RelationConnection::Condition.build_condition(relation: relation, aliased_selects: aliased_selects, order_values: order_values, cursor: after, direction: :after, allow_eq: allow_eq, small_nulls: small_nulls)
            relation = if relation.group_values.any?
              relation.having(sql, *values)
            else
              relation.where(sql, *values)
            end
          end

          relation
        rescue JSON::ParserError => _err
          raise StableRelationConnection::InvalidCursorError.new(argument_name: current_argument_name)
        end
      end
    end
  end
end
