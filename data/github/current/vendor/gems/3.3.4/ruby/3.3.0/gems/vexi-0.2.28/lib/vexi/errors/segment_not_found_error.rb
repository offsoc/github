# frozen_string_literal: true
# typed: strict

module Vexi
  module Errors
    # Public: Vexi segment not found error.
    class SegmentNotFoundError < EntityNotFoundError
      extend T::Sig

      sig { params(entity_id: String).void }
      def initialize(entity_id)
        super(entity_id, "segment")
      end
    end
  end
end
