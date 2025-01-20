# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class BillingOrgsVNext < Seeds::Runner
      def self.help
        <<~HELP
        Add organization with billing enabled products
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        # create Team organization for testing
        user = Seeds::Objects::User.monalisa
        name = "billing-test-org"
        # business plan maps to a "Team" organization
        organization = Seeds::Objects::Organization.create(login: name, admin: user, plan: "business")

        ::Customer.create(
          billing_type: "invoice",
          billing_end_date: GitHub::Billing.today + 1.year,
          name: name,
          billing_attempts: 0,
          term_length: 12,
          billed_via_billing_platform: true,
        )
        organization_customer = Customer.find_by(name: name)

        if organization_customer != nil
          organization.customer = organization_customer
          organization_customer.build_billing_platform_enabled_product
          org_bp_enabled_product = organization_customer.billing_platform_enabled_product || organization_customer.build_billing_platform_enabled_product
          org_bp_enabled_product.update(actions: true)
          org_bp_enabled_product.update(copilot: true)
          org_bp_enabled_product.update(ghas: true)
        end

        # Create test repo to generate test usage
        Seeds::Objects::Repository.create(
          owner_name: name,
          repo_name: "test-repo",
          is_public: false,
          setup_master: true,
          template: true,
        )

        puts "Done enabling products"
      end
    end
  end
end
