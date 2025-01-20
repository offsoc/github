# frozen_string_literal: true
# typed: strict

require "active_support"
require "active_support/notifications"

module Vexi
  module Observability
    # Vexi null notifications instrumenter
    class Null
      extend T::Sig
      extend T::Helpers

      include Instrumenter

      sig do
        override.params(_name: String,
                        _payload: T::Hash[Symbol,
                                          T.any(String, Numeric, T::Boolean, Time, Exception, T::Array[String])]).void
      end
      def instrument(_name, _payload = {}); end
    end
  end
end
