# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class VssSubscriptionEvents < Seeds::Runner
      def self.help
        <<~HELP
        Create VSS Subscription Events.
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        puts "Setting up events."

        statuses = ::Licensing::Vss::VssSubscriptionEvent.statuses.values

        statuses.each do |status|
          event = FactoryBot.build(:licensing_vss_subscription_event)

          Seeds::Objects::VssSubscriptionEvent.create(
            payload: event.payload,
            investigation_notes: "Investigation Note",
            status: status,
          )
        end
      end
    end
  end
end
