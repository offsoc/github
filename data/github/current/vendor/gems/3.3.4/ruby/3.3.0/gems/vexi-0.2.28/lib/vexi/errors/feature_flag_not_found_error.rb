# frozen_string_literal: true
# typed: strict

module Vexi
  module Errors
    # Public: Vexi feature flag not found error.
    class FeatureFlagNotFoundError < EntityNotFoundError
      extend T::Sig

      sig { params(entity_id: String).void }
      def initialize(entity_id)
        super(entity_id, "feature flag")
      end
    end
  end
end
