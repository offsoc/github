# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class VssSubscriptionEvent
      def self.create(payload:, investigation_notes: nil, status: "unprocessed")
        event = ::Licensing::Vss::VssSubscriptionEvent.create!(
          payload: payload,
          investigation_notes: investigation_notes,
          status: status,
        )

        event
      end
    end
  end
end
