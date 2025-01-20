# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GhasTrial < Seeds::Runner

      DEFAULT_RESET = false
      DEFAULT_DAYS = 30

      def self.help
        <<~HELP
        Creates various states related to sales-serve GitHub Advanced Security trials.
        - Creates an organization that is eligible for a sales-serve trial.
        - Creates an organization that is on a sales-serve Advanced Security trial
        - Creates a Business that is on a sales-serve Advanced Security trial
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        puts "Creating ghas-eligible-org..."
        eligible_org = create_organization(login: "ghas-eligible-org", options: options)
        eligible_org.enable_advanced_security_eligiblity_for_entity(actor: User.ghost)

        puts "Creating sales-serve ghas-trial-org..."
        trial_org = create_organization(login: "ghas-trial-org", options: options)
        trial = EnterpriseCloudOnboard::GhasTrial.new(actor: User.ghost, billable_entity: trial_org, api_access: true)
        trial.enable(options[:days] || DEFAULT_DAYS)

        puts "Creating sales-serve ghas-trial-business..."
        trial_business = create_business(name: "ghas-trial-business", options: options)
        trial_b = EnterpriseCloudOnboard::GhasTrial.new(actor: User.ghost, billable_entity: trial_business, api_access: true)
        trial_b.enable(options[:days] || DEFAULT_DAYS)
      end

      def self.create_organization(login:, options:)
        Organization.find_by(login: login)&.destroy if options[:reset]
        ReservedLogin.untombstone!(login)
        FactoryBot.create(:credit_card_organization, login: login, admin: Objects::User.monalisa, plan: "business_plus").tap do |org|
          org.save!
        end
      end

      def self.create_business(name:, options:)
        Business.find_by(name: name)&.destroy if options[:reset]
        FactoryBot.create(:business, name: name, owners: [Objects::User.monalisa]).tap do |business|
          business.save!
        end
      end
    end
  end
end
