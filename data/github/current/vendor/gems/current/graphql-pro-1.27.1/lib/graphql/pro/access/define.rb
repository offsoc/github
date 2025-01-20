# frozen_string_literal: true
require "graphql/pro/access/unauthorized_object"
require "graphql/pro/access/unauthorized_fields"
module GraphQL
  module Pro
    module Access
      # @api private
      module Define
        class GateDefinition
          def initialize(level, metadata_key)
            @level = level
            @metadata_key = metadata_key
          end

          def call(owner, gate_spec)
            owner.metadata[@metadata_key] = Gate.build(owner, @level, gate_spec)
            nil
          end
        end

        module AuthorizationDefinition
          def self.call(schema, strategy, ability_class: nil, fallback: {}, current_user: :current_user, operation_store: nil, namespace: nil)
            # normalize the argument:
            strategy_class = if strategy.is_a?(Symbol)
              BUILT_IN_STRATEGIES[strategy] || raise("Unknown authorization #{strategy.inspect} (must be: #{BUILT_IN_STRATEGIES.keys.map(&:inspect).join(", ")})")
            elsif strategy.is_a?(Class) && strategy.instance_method(:allowed?)
              strategy
            else
              raise("Unexpected authorization: #{strategy.inspect}. Expected Symbol or Class responding to `#allowed?`.")
            end

            # hook up everything needed for auth:
            schema.metadata[CURRENT_USER_KEY] = current_user
            schema.metadata[STRATEGY_KEY] = strategy_class
            schema.metadata[STRATEGY_OPTIONS_KEY] = {ability_class: ability_class}
            schema.metadata[UNAUTHORIZED_FIELDS_KEY] ||= GraphQL::Pro::Access::Analyzer::UnauthorizedFields
            schema.metadata[UNAUTHORIZED_OBJECT_KEY] ||= GraphQL::Pro::Access::Instrumentation::UnauthorizedObject
            schema.metadata[OPERATION_STORE_STRATEGY_KEY] = operation_store
            if namespace && Gate.pundit_namespace && namespace != Gate.pundit_namespace
              raise "Can't reassign Pundit `namespace: #{namespace}`, already assigned to #{Gate.pundit_namespace}"
            else
              Gate.pundit_namespace = namespace
            end

            fallback.each do |role, defn|
              key = Access::ROLE_KEYS.fetch(role)
              case defn
              when Symbol
                defn = { role: defn, pundit_policy_name: "SchemaDefaultPolicy" }
              when Hash
                defn[:pundit_policy_name] ||= "SchemaDefaultPolicy"
              end
              schema.metadata[key] = defn
            end

            instrumentation = GraphQL::Pro::Access::Instrumentation.new(schema)
            # This has to come before anything that might call the filter
            schema.instrumenters[:query].unshift(instrumentation)
            # Put this one last so it wraps user-provided resolves
            schema.instrumenters[:field].push(instrumentation)
            schema.query_analyzers << GraphQL::Pro::Access::Analyzer
            # Add this to class-based schemas, but not to the base class
            # (which is given here when `.define` is called)
            if schema.class != GraphQL::Schema && schema.class.respond_to?(:query_analyzer) # could be a very old version :S
              schema.class.query_analyzer(GraphQL::Pro::Access::Analyzer)
            end
            schema.default_mask = GraphQL::Pro::Access::SchemaFilter

            if strategy_class == GraphQL::Pro::Access::PunditStrategy
              AssertPunditPolicy.call(schema)
            end

            nil
          end
        end
      end
    end
  end
end
