# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class IntegrationAgents < Seeds::Runner
      def self.help
        <<~EOF
        Create integrations agents associated with integrations
        EOF
      end

      def self.run(options = {})
        count = options[:count] || 1
        count.times do
          owner = if options[:org_owned]
            login = Faker::Alphanumeric.alpha(number: 10)
            admin = Objects::User.monalisa
            Objects::Organization.create(login: login, admin: admin)
          else
            Objects::User.monalisa
          end
          integration = Seeds::Objects::Integration.create(owner: owner, app_name: Faker::Alphanumeric.alpha(number: 10))

          Seeds::Objects::IntegrationAgent.create(integration: integration)
        end
      end
    end
  end
end
