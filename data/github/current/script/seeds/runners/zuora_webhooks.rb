# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ZuoraWebhooks < Seeds::Runner
      extend T::Sig

      sig { returns(String) }
      def self.help
        <<~HELP
        Creates different Zuora_Webhooks
        HELP
      end

      sig { params(options: T::Hash[T.untyped, T.untyped]).void }
      def self.run(options = {})
        require_relative "../factory_bot_loader"
        # Creating a Zuora webhook object

        FactoryBot.create :zuora_webhook, :amendment_processed
        FactoryBot.create :zuora_webhook, :amendment_processed
        FactoryBot.create :zuora_webhook, :payment_processed, created_at: 6.minutes.ago
      end
    end
  end
end
