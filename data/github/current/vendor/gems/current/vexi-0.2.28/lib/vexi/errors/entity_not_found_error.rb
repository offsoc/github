# frozen_string_literal: true
# typed: strict

module Vexi
  module Errors
    # Public: Vexi entity not found error.
    class EntityNotFoundError < StandardError
      extend T::Helpers
      extend T::Sig
      abstract!

      # This is a getter method for @entity_id. It returns the value of @entity_id.
      sig { returns(String) }
      attr_reader :entity_id

      # This is a getter method for @entity_type. It returns the value of @entity_type.
      sig { returns(String) }
      attr_reader :entity_type

      sig { params(entity_id: String, entity_type: String).void }
      def initialize(entity_id, entity_type)
        @entity_id = entity_id
        @entity_type = entity_type
        super("entity #{@entity_type} with entity id #{@entity_id} not found")
      end
    end
  end
end
