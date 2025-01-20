# frozen_string_literal: true
# typed: strict

module Vexi
  # Vexi instrumenter interface
  module Instrumenter
    extend T::Sig
    extend T::Helpers
    interface!

    include Kernel

    NotificationContextValue = T.type_alias { T.any(String, Numeric, Time, T::Boolean, T::Array[String]) }
    NotificationContext = T.type_alias { T::Hash[Symbol, NotificationContextValue] }

    sig do
      abstract.params(_name: String, _payload: NotificationContext).void
    end
    def instrument(_name, _payload = {}); end
  end
end
