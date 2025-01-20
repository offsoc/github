# frozen_string_literal: true
# typed: strict

require "active_support"
require "active_support/notifications"

module Vexi
  module Observability
    # Vexi activesupport notifications instrumenter
    class Notification
      extend T::Sig
      extend T::Helpers

      include Instrumenter

      sig do
        override.params(name: String, payload: NotificationContext).void
      end
      def instrument(name, payload = {})
        ActiveSupport::Notifications.instrument(name, payload)
      end
    end
  end
end
