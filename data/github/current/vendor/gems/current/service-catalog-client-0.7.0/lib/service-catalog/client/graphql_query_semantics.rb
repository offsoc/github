# frozen_string_literal: true

require "active_support/inflector/methods" # camelize
require "active_support/core_ext/hash/keys" # deep_transform_keys

module ServiceCatalog
  class Client
    # GraphqlQuerySemantics is a module with class methods for handling GraphQL query semantics,
    # such as defining variables and their types.
    module GraphqlQuerySemantics

      # Converts a Ruby variable name into a GraphQL variable name.
      #
      # @param ruby_variable_name [String or Symbol] Ruby variable name
      #
      # @return [String] GraphQL variable name
      def self.graphql_variable_name(ruby_variable_name)
        ruby_variable_name.to_s.camelize(:lower)
      end

      # Converts a Ruby object to a GraphQL variable type.
      #
      # @param ruby_object [Object] Ruby object
      # @param strict [Boolean] (optional) Whether the type is non-nullable (true for non-nullable)
      # @param key [String] (optional) The GraphQL variable key
      #
      # @return [String] GraphQL variable type
      def self.graphql_variable_type(ruby_object, strict: false, key: nil)
        gql_type = case ruby_object
        when Integer
          "Int"
        when Time
          "ISO8601DateTime"
        when Array
          return "[#{graphql_variable_type(ruby_object.first, strict: strict)}]"
        else
          ruby_object.class.name
        end

        gql_type = "ID" if key.eql?("id")

        gql_type = "#{gql_type}!" if strict
        gql_type
      end

      # Converts a Hash of Ruby keyword arguments into a Hash of GraphQL variables by converting the key to a GraphQL variable.
      #
      # @param kwargs [Hash] Ruby keyword arguments
      #
      # @return [Hash] GraphQL variables
      def self.kwargs_to_graphql_variables(kwargs)
        kwargs.deep_transform_keys { |key| graphql_variable_name(key) }
      end

      # Creates a GraphQL query declaration for the given variables.
      # This might look like:
      #   $after: String, $serviceName: String
      #
      # @param variables [Hash] GraphQL variables
      # @param strict [Boolean] True if the fields are required (deprecated, prefer +variable_types+)
      # @param variable_types [Hash] Map of GraphQL variable name to GraphQL type as string
      # @param include_parens [Boolean] True will wrap the output in opening and closing parentheses
      #
      # @return [String] GraphQL variable declaration
      def self.graphql_variable_declaration(variables, strict: false, variable_types: Hash.new, include_parens: false)
        return "" if variables.empty?
        declaration = variables.map { |k, v| "$#{k}: #{variable_types[k] || graphql_variable_type(v, strict: strict, key: k)}" }.join(", ")
        declaration = "(#{declaration})" if include_parens
        declaration
      end

      # Creates a GraphQL query passing for all variables.
      # This might look like:
      #   after: $after, serviceName: $serviceName
      #
      # @param variables [Hash] GraphQL variables
      # @param include_parens [Boolean] True will wrap the output in opening and closing parentheses
      #
      # @return [String] GraphQL variable passing
      def self.graphql_variable_passing(variables, include_parens: false)
        return "" if variables.empty?
        passing = variables.map { |k, _| "#{k}: $#{k}" }.join(", ")
        passing = "(#{passing})" if include_parens
        passing
      end
    end
  end
end
