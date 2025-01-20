# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class AdvancedSecurity < Seeds::Runner
      def self.help
        <<~HELP
        Enables GHAS and security and analysis features for the 'github' organization.
        HELP
      end

      def self.run(options = {})
        manager = SecurityProductsEnablement::SecurityProductsManager.new
        user = Seeds::Objects::User.monalisa
        business = options[:business_slug] ? ::Business.find_by!(slug: options[:business_slug]) : Seeds::Objects::Business.github
        organization = options[:organization_name] ? ::Organization.find_by!(login: options[:organization_name]) : Seeds::Objects::Organization.github

        business.mark_advanced_security_as_purchased_for_entity(actor: user)

        # enable security products for all new repos on org
        Seeds::Objects::SecurityConfiguration.custom_configuration(
          org: organization,
          options: {
            dependency_graph: manager.dependency_graph_enabled? ? :enabled : :disabled,
            dependabot_alerts: manager.dependabot_alerts_enabled? ? :enabled : :disabled,
            dependabot_security_updates: manager.dependabot_security_updates_enabled? ? :enabled : :disabled,
            secret_scanning: manager.secret_scanning_enabled? ? :enabled : :disabled,
            default_for_new_public_repos: true,
            default_for_new_private_repos: true
          }
        )

        return unless options.fetch(:create_repo, true)

        # create a sample repo
        repository = Seeds::Objects::Repository.create(owner_name: organization, setup_master: true, is_public: false)

        puts "Created #{repository.nwo} with GHAS and security products enabled."
      end
    end
  end
end
