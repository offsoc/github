# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class IntegrationInstallTrigger
      def self.create(integration:, install_type:, reason: "Setup via seed")
        if integration &&
            (latest = ::IntegrationInstallTrigger.latest(integration: integration, install_type: install_type)) &&
            !latest.deactivated?
          return latest
        end

        ::IntegrationInstallTrigger.create(integration_id: integration.id, install_type: install_type, reason: reason).tap do |install_trigger|
          raise Objects::CreateFailed, install_trigger.errors.full_messages.to_sentence unless install_trigger.persisted?
        end
      end
    end
  end
end
