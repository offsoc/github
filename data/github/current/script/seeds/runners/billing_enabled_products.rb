# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class BillingEnabledProducts < Seeds::Runner
      def self.help
        <<~HELP
        Enable products for billing
        HELP
      end

      def self.run(options = {
        customer_id: 1,
        all_products: false,
        actions: true,
        git_lfs: false,
        copilot: false,
        packages: false,
        codespaces: false,
        ghec: false,
        ghas: false,
        reset: true
      })
        require_relative "../factory_bot_loader"

        customer = Customer.find options[:customer_id]
        customer.update(billed_via_billing_platform: true)

        if options[:reset]
          customer.build_billing_platform_enabled_product
        end

        bp_enabled_product = customer.billing_platform_enabled_product || customer.build_billing_platform_enabled_product

        if options[:all_products] || options[:actions]
          bp_enabled_product.update(actions: true)
          puts "Enabled product Actions"
        end

        if options[:all_products] || options[:git_lfs]
          bp_enabled_product.update(git_lfs: true)
          puts "Enabled product LFS"
        end

        if options[:all_products] || options[:copilot]
          bp_enabled_product.update(copilot: true)
          puts "Enabled product Copilot"
        end

        if options[:all_products] || options[:packages]
          bp_enabled_product.update(packages: true)
          puts "Enabled product packages"
        end

        if options[:all_products] || options[:codespaces]
          bp_enabled_product.update(codespaces: true)
          puts "Enabled product Codespaces"
        end

        if options[:all_products] || options[:ghec]
          bp_enabled_product.update(ghec: true)
          puts "Enabled product GHEC"
        end

        if options[:all_products] || options[:ghas]
          bp_enabled_product.update(ghas: true)
          puts "Enabled product GHAS"
        end

        puts "Done enabling products"
      end
    end
  end
end
