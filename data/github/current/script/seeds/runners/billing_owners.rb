# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    extend T::Sig

    class BillingOwners < Seeds::Runner
      extend T::Sig

      sig { returns(String) }
      def self.help
        <<~HELP
        Creates different Users, Organizations, and Businesses with different billing methods
        HELP
      end

      sig { params(options: T::Hash[Symbol, T.untyped]).void }
      def self.run(options = {})
        require_relative "../factory_bot_loader"

        options[:credit_card_users].to_i.times do |i|
          # credit card user
          login = "billing-user#{i + 1}"
          User.find_by(login: login)&.destroy if options[:reset]
          ReservedLogin.untombstone!(login)
          user = Objects::User.create(login: login)
          Objects::Repository.create(owner_name: user.login, repo_name: "repo1", setup_master: true)
          if !user.customer_account
            user.update!(billing_type: "card", customer_account: FactoryBot.create(:credit_card_customer_account, user: user))
          end
          user.update!(billed_on: 10.days.from_now.to_date)
          FactoryBot.create(:billing_plan_subscription, :zuora, user: user) unless user.plan_subscription
        end

        # credit card org
        options[:credit_card_organizations].to_i.times do |i|
          org = create_organization(login: "billing-credit-card-org#{i + 1}", billing_type: "card", options: options)
          puts "Setup organization: #{org.login} with plan: #{org.plan} to use credit card"
        end

        # invoiced org
        options[:invoiced_organizations].to_i.times do |i|
          org = create_organization(login: "billing-invoiced-org#{i + 1}", billing_type: "invoice", options: options, zuora_account_id: options[:invoiced_organization_zuora_account_id])
          puts "Setup organization: #{org.login} with plan: #{org.plan} to be invoiced"
        end

        # invoiced business
        options[:invoiced_businesses].to_i.times do |i|
          business = create_business(name: "Invoiced Business#{i + 1}", org_prefix: "business-invoiced#{i + 1}-org", options: options, zuora_account_id: options[:invoiced_business_zuora_account_id])
          puts "Setup business: #{business.name} to be invoiced with three orgs"
        end

        # azure-billed business
        options[:azure_businesses].to_i.times do |i|
          business = create_business(name: "Azure Business#{i + 1}", org_prefix: "business-azure#{i + 1}-org", options: options, factory_bot_overrides: [:with_azure_subscription])
          puts "Setup business: #{business.name} to be billed through azure with three orgs"
        end
      end
    end

    sig { params(login: String, billing_type: String, options: T::Hash[Symbol, T.untyped], zuora_account_id: T.nilable(String)).returns(Organization) }
    def self.create_organization(login:, billing_type:, options:, zuora_account_id: nil)
      Organization.find_by(login: login)&.destroy if options[:reset]
      ReservedLogin.untombstone!(login)
      org = Objects::Organization.create(login: login, admin: Objects::User.monalisa, plan: "business")
      Objects::Repository.create(owner_name: org.login, repo_name: "repo1", setup_master: true)
      unless org.customer_account
        customer_account = case billing_type
        when "card" then FactoryBot.create(:credit_card_customer_account, user: org)
        when "invoice" then FactoryBot.create(:no_credit_card_customer_account, user: org)
        else raise Objects::CreateFailed, "billing_type must be 'card' or 'invoice'"
        end
        org.update!(billing_type: billing_type, customer_account: customer_account)
        org.reset_customer
      end
      org.customer.update(zuora_account_id: zuora_account_id) if zuora_account_id.present?

      FactoryBot.create(:billing_plan_subscription, :zuora, user: org) unless org.plan_subscription
      org.update!(billed_on: 10.days.from_now.to_date)
      org
    end

    sig { params(name: String, org_prefix: String, options: T::Hash[Symbol, T.untyped], zuora_account_id: T.nilable(String), factory_bot_overrides: T::Array[Symbol]).returns(Business) }
    def self.create_business(name:, org_prefix:, options:, zuora_account_id: nil, factory_bot_overrides: [])
      Business.find_by(name: name)&.destroy if options[:reset]
      factory_bot_args = [:business, *factory_bot_overrides, { name: name, owners: [Objects::User.monalisa] }]
      business = Business.find_by(name: name) || FactoryBot.create(*T.unsafe(factory_bot_args))
      3.times do |i|
        login = "#{org_prefix}#{i + 1}"
        Organization.find_by(login: login)&.destroy if options[:reset]
        ReservedLogin.untombstone!(login)
        org = Objects::Organization.create(login: login, admin: Objects::User.monalisa)
        org.update!(business: business)
        Objects::Repository.create(owner_name: org.login, repo_name: "repo1", setup_master: true)
      end

      business.customer.update(zuora_account_id: zuora_account_id) if zuora_account_id.present?
      business
    end
  end
end
