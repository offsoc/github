# typed: strict
# frozen_string_literal: true

module Serviceowners
  module Concerns
    # A simple mixin to roughly match Rails' `presence` method.
    module Presence
      extend T::Sig

      sig { params(val: T.nilable(String)).returns(T.nilable(String)) }
      def presence(val)
        return nil if val.nil? || val.empty?
        return nil if val.strip.empty?

        val
      end
    end
  end
end
