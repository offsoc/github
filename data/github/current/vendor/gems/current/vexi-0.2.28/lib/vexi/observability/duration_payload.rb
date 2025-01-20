# frozen_string_literal: true
# typed: strict

require "active_support"
require "active_support/notifications"

module Vexi
  module Observability
    # Vexi payload contained in duration notifications
    class DurationPayload
      extend T::Sig
      extend T::Helpers

      sig { params(event: ActiveSupport::Notifications::Event).void }
      def initialize(event)
        @operation = T.let(event.payload[:operation] || "unspecified", String)
        @measured_start = T.let(event.payload[:measured_start], Time)
        @measured_finish = T.let(event.payload[:measured_finish], Time)
        @result = T.let(event.payload[:result], T.nilable(T::Boolean))
        @entities_count = T.let(event.payload[:entities_count], T.nilable(Numeric))
        @context_tags = T.let(event.payload, Instrumenter::NotificationContext)
        @feature_flag = T.let((@context_tags[:feature_flag] || "").to_s, String)
        @custom_gate_name = T.let((@context_tags[:custom_gate_name] || "").to_s, String)
      end

      # Public: The operation that was measured
      sig { returns(String) }
      attr_reader :operation

      # Public: The start time of the measurement
      sig { returns(Time) }
      attr_reader :measured_start

      # Public: The finish time of the measurement
      sig { returns(Time) }
      attr_reader :measured_finish

      # Public: The result of the operation
      sig { returns(T.nilable(T::Boolean)) }
      attr_reader :result

      # Public: The context tags for the measurement
      sig { returns(Instrumenter::NotificationContext) }
      attr_reader :context_tags

      # Public: The feature flag for the measurement (optional)
      sig { returns(String) }
      attr_reader :feature_flag

      # Public: The feature flag for the measurement (optional)
      sig { returns(String) }
      attr_reader :custom_gate_name

      # Public: The entities count for the measurement (optional)
      sig { returns(T.nilable(Numeric)) }
      attr_reader :entities_count
    end
  end
end
