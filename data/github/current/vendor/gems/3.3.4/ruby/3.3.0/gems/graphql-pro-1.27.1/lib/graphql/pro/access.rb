# frozen_string_literal: true
require "graphql/pro/access/analyzer"
require "graphql/pro/access/can_can_strategy"
require "graphql/pro/access/define"
if defined?(GraphQL::Schema::Field)
  # 1.8 support
  require "graphql/pro/access/extensions"
end
require "graphql/pro/access/gate"
require "graphql/pro/access/instrumentation"
require "graphql/pro/access/invalid_configuration_error"
require "graphql/pro/access/pundit_strategy"
require "graphql/pro/access/schema_filter"
require "graphql/pro/access/assert_pundit_policy"

module GraphQL
  module Pro
    module Access
      CURRENT_USER_KEY = :__pro_access_current_user__
      VIEW_METADATA_KEY = :__pro_access_view__
      ACCESS_METADATA_KEY = :__pro_access_access__
      AUTHORIZE_METADATA_KEY = :__pro_access_authorize__
      STRATEGY_KEY = :__pro_access_strategy__
      STRATEGY_OPTIONS_KEY = :__pro_access_strategy_options__
      NAMESPACE_KEY = :__pro_access_namespace__
      UNAUTHORIZED_FIELDS_KEY = :__pro_access_unauthorized_fields__
      UNAUTHORIZED_OBJECT_KEY = :__pro_access_unauthorized_object__
      # This strategy is used for validating operations which are
      # persisted with `OperationStore`
      OPERATION_STORE_STRATEGY_KEY = :__pro_access_operation_store_strategy__

      METADATA_KEYS = [
        VIEW_METADATA_KEY,
        ACCESS_METADATA_KEY,
        AUTHORIZE_METADATA_KEY,
      ]

      ROLE_KEYS = {
        view: VIEW_METADATA_KEY,
        access: ACCESS_METADATA_KEY,
        authorize: AUTHORIZE_METADATA_KEY,
      }

      BUILT_IN_STRATEGIES = {
        pundit: PunditStrategy,
        cancan: CanCanStrategy,
      }

      STATIC_ACCESS_DEFINITIONS = {
        view:   Define::GateDefinition.new(:view, VIEW_METADATA_KEY),
        access: Define::GateDefinition.new(:access, ACCESS_METADATA_KEY),
      }

      RUNTIME_ACCESS_DEFINITIONS = {
        authorize: Define::GateDefinition.new(:authorize, AUTHORIZE_METADATA_KEY),
      }

      NON_RUNTIME_ACCESS_DEFINITIONS = {
        authorize: ->(type, arg) { raise("Can't define runtime authorization for #{type.class} because it isn't used at runtime") }
      }

      RUNTIME_TYPES = [
        GraphQL::ObjectType,
        GraphQL::EnumType,
        GraphQL::ScalarType,
      ]

      NON_RUNTIME_TYPES = [
        GraphQL::InterfaceType,
        GraphQL::UnionType,
        GraphQL::InputObjectType,
      ]

      defn_method = GraphQL::Field.respond_to?(:deprecated_accepts_definitions) ? :deprecated_accepts_definitions : :accepts_definitions

      GraphQL::Field.public_send(defn_method, STATIC_ACCESS_DEFINITIONS)
      GraphQL::Field.public_send(defn_method, RUNTIME_ACCESS_DEFINITIONS)

      GraphQL::BaseType.public_send(defn_method, STATIC_ACCESS_DEFINITIONS)
      RUNTIME_TYPES.each { |t| t.public_send(defn_method, RUNTIME_ACCESS_DEFINITIONS) }
      NON_RUNTIME_TYPES.each { |t| t.public_send(defn_method, NON_RUNTIME_ACCESS_DEFINITIONS) }

      GraphQL::Schema.public_send(
        defn_method,
        authorization: Define::AuthorizationDefinition,
        unauthorized_fields: GraphQL::Define.assign_metadata_key(UNAUTHORIZED_FIELDS_KEY),
        unauthorized_object: GraphQL::Define.assign_metadata_key(UNAUTHORIZED_OBJECT_KEY),
      )

      # Raised when a Pundit strategy can't be found for an authorization spec
      class PunditStrategyNotFoundError < StandardError; end
    end
  end
end
