# frozen_string_literal: true
require "graphql/pro/access/instrumentation/authorized_resolve"
require "graphql/pro/access/instrumentation/merged_gate"

module GraphQL
  module Pro
    module Access
      class Instrumentation
        def initialize(schema)
          @schema = schema
          @strategy_class = schema.metadata[STRATEGY_KEY]
          @default_view_config = @schema.metadata[VIEW_METADATA_KEY]
          @default_access_config = @schema.metadata[ACCESS_METADATA_KEY]
          @default_authorize_config = @schema.metadata[AUTHORIZE_METADATA_KEY]
          @assert_policy_cache = Hash.new { |h,k| h[k] = AssertPunditPolicy.call(k) }
        end

        # Prepare the strategy for authorizing this query
        def before_query(query)
          query.context[STRATEGY_KEY] = @strategy_class.new(query.context)
        end

        def after_query(query)
        end

        # Find fields who are subject to authorization
        # and wrap their resolve / lazy_resolve functions
        # in authorization logic
        def instrument(type, field)
          if type.name.start_with?("__") || field.name.start_with?("__")
            return field
          end

          field_gate = field.metadata[AUTHORIZE_METADATA_KEY]

          field_return_type = field.type.unwrap

          if @default_view_config && !field.metadata[VIEW_METADATA_KEY] && !field_return_type.metadata[VIEW_METADATA_KEY]
            field = field.redefine(view: @default_view_config)
          end

          if @default_access_config && !field.metadata[ACCESS_METADATA_KEY] && !field_return_type.metadata[ACCESS_METADATA_KEY]
            field = field.redefine(access: @default_access_config)
          end

          if @strategy_class == GraphQL::Pro::Access::PunditStrategy
            @assert_policy_cache[type]
            @assert_policy_cache[field_return_type]
          end

          type_gate = case field_return_type
          when GraphQL::UnionType, GraphQL::InterfaceType
            RuntimeTypeGate.new(field_return_type)
          else
            field_return_type.metadata[AUTHORIZE_METADATA_KEY]
          end

          if type_gate.nil? && field_gate.nil? && @default_authorize_config
            # Only apply it if not already applied
            field_gate = Access::Gate.build(field, :view, @default_authorize_config)
          end

          if field_gate || type_gate
            merged_gate = MergedGate.new(field_gate, type_gate)
            new_resolve = AuthorizedResolve.new(field.type, merged_gate, field.resolve_proc)
            new_lazy_resolve = AuthorizedResolve.new(field.type, merged_gate, field.lazy_resolve_proc)
            field.redefine(
              resolve: new_resolve,
              lazy_resolve: new_lazy_resolve,
            )
          else
            field
          end
        end

        class RuntimeTypeGate
          attr_reader :type
          def initialize(type)
            @type = type
          end

          def pundit_policy
            nil
          end
        end
      end
    end
  end
end
