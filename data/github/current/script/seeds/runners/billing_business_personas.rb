# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    extend T::Sig

    class BillingBusinessPersonas < Seeds::Runner
      extend T::Sig

      sig { returns(String) }
      def self.help
        <<~HELP
        Creates different Businesses in various billing states and billing cycles
        HELP
      end

      sig { params(options: T::Hash[Symbol, T.untyped]).void }
      def self.run(options = {
        self_serve_business_monthly: true,
        self_serve_business_yearly: true,
        self_serve_rbi_payment_method: true,
        self_serve_locked_billing: true,
        self_serve_dunning: true,
        self_serve_no_payment_method: true,
        self_serve_declined_payment_method: true,
        self_serve_business_on_trial: true,
        self_serve_metered_business_on_trial: true,
        self_serve_metered_ghec_business: true,
        sales_serve_volume_ghec_business: true,
        sales_serve_volume_ghec_business_with_vss_bundle: true,
        reset: true,
      })
        require_relative "../factory_bot_loader"

        puts "NOTE: Business on a dunning cycle is NOT created by default: set the flag --self_serve_dunning=true to create it"
        puts "enabling feature flags to support self-serve businesses"
        GitHub.flipper[:global_notice_next].enable
        GitHub.flipper[:global_notice_next_component].enable

        if options[:self_serve_business_monthly]
          create_self_serve_business_with_billing_frequency(billing_frequency: "month", options: options)
        end

        if options[:self_serve_business_yearly]
          create_self_serve_business_with_billing_frequency(billing_frequency: "year", options: options)
        end

        if options[:self_serve_rbi_payment_method]
          create_self_serve_business_with_rbi_payment_method(options: options)
        end

        if options[:self_serve_locked_billing]
          create_self_serve_business_with_locked_billing(options: options)
        end

        if options[:self_serve_dunning]
          create_self_serve_business_that_is_dunning(options: options)
        end

        if options[:self_serve_no_payment_method]
          create_self_serve_business_with_no_payment_method(options: options)
        end

        if options[:self_serve_declined_payment_method]
          create_self_serve_business_with_declined_payment_method(options: options)
        end

        if options[:self_serve_business_on_trial]
          create_self_serve_business_on_trial(options: options)
        end

        if options[:self_serve_metered_business_on_trial]
          create_self_serve_metered_business_on_trial(options: options)
        end

        if options[:self_serve_metered_ghec_business]
          create_self_serve_metered_ghec_business(options: options)
        end

        if options[:sales_serve_volume_ghec_business]
          create_sales_serve_volume_ghec_business(options: options)
        end

        if options[:sales_serve_volume_ghec_business_with_vss_bundle]
          create_sales_serve_metered_ghec_business_with_vss_bundle(options: options)
        end

        puts "Done creating businesses!"
      end
    end

    sig do
      params(
        business: ::Business,
        address: String,
        city: String,
        region: String,
        postal_code: T.any(String, Integer),
        country_code: String,
      ).returns(AccountScreeningProfile)
    end
    def self.update_address(business, address:, city:, region: , postal_code: , country_code:)
      FactoryBot.create(
        :account_screening_profile,
        :with_self_serve_business,
        address1: address,
        city: city,
        region: region,
        country_code: country_code,
        postal_code: postal_code,
        owner: business
      )
    end

    sig do
      params(
        business: ::Business,
        credit_card_number: String,
        credit_card_country_code: String
      ).returns(T::Hash[Symbol, T.untyped])
    end
    def self.zuora_account_params(business, credit_card_number:, credit_card_country_code:)
      {
        BusinessSegment__c: Billing::CreateCustomer::SELF_SERVE_BUSINESS_SEGMENT,
        batch: Billing::CreateCustomer::SELF_SERVE_BATCH,
        SynctoNetSuite__NS: "No",
        billCycleDay: 0,
        communicationProfileId: GitHub.zuora_self_serve_communication_profile_id,
        currency: "USD",
        name: business.name,
        paymentGateway: ::Billing::Zuora::PaymentGateway.for(business, type: :credit_card),
        billToContact: {
          firstName: business.name,
          lastName: business.name,
          country: credit_card_country_code,
          state: business.trade_screening_record.region
        },
        taxInfo: {
          exemptStatus: "Yes",
          exemptCertificateId: "N/A"
        },
        paymentMethod: {
          type: "CreditCard",
          cardHolderInfo: {
            cardHolderName: "Mona Lisa",
            addressLine1: business.trade_screening_record.address1,
            city: business.trade_screening_record.city,
            country: credit_card_country_code,
            state: business.trade_screening_record.region,
            zipCode: business.trade_screening_record.postal_code,
          },
          cardNumber: credit_card_number,
          cardType: "Visa",
          expirationMonth: "01",
          expirationYear: "2040",
        }
      }
    end

    sig do
      params(
        business: ::Business,
        payment_method_id: String,
        credit_card_number: String,
        credit_card_country_code: String
      ).returns(T::Hash[Symbol, T.untyped])
    end
    def self.payment_method_details(business, payment_method_id:, credit_card_number:, credit_card_country_code:)
      {
        actor: business.owners.first,
        zuora_payment_method_id: payment_method_id,
        card: {
          number: credit_card_number,
          cvv: "000",
          expiration_month: "01",
          expiration_year: "2040"
        },
        billing_address: {
          city: business.trade_screening_record.city,
          region: business.trade_screening_record.region,
          country_code_alpha3: credit_card_country_code,
          postal_code: business.trade_screening_record.postal_code
        }
      }

    end

    sig do
      params(business: ::Business, credit_card_number: String, credit_card_country_code: String)
        .returns(::Business)
    end
    def self.create_zuora_account_and_update_payment_method(business, credit_card_number: "4111111111111111", credit_card_country_code: "USA")
      return business unless customer = business.customer

      account_request_params = zuora_account_params(business, credit_card_number: credit_card_number, credit_card_country_code: credit_card_country_code)
      response = GitHub.zuorest_client.create_account(account_request_params)

      customer.zuora_account_id = response["accountId"]
      customer.zuora_account_number = response["accountNumber"]
      business.payment_method.payment_processor_customer_id = response["accountId"]
      business.payment_method.payment_token = response["paymentMethodId"]

      updated_payment_method_details = payment_method_details(
        business,
        payment_method_id: response["paymentMethodId"],
        credit_card_number: credit_card_number,
        credit_card_country_code: credit_card_country_code
      )
      business.payment_method.update_payment_details(updated_payment_method_details)

      business.save!
      business.synchronize_general_purpose_subscription_later

      business
    end

    sig { params(business: ::Business).void }
    def self.clear_mock_zuora_values(business)
      if customer = business.customer
        customer.zuora_account_id = nil
        customer.zuora_account_number = nil
      end

      business.save!
    end

    sig do
      params(
        name: String,
        org_prefix: String,
        options: T::Hash[Symbol, T.untyped],
        billing_frequency: String,
        zuora_account_id: T.nilable(String),
        factory_bot_overrides: T::Array[Symbol],
        address_details: T::Hash[Symbol, T.untyped]
      ).returns(Business)
    end
    def self.create_self_serve_business(
      name:,
      org_prefix:,
      options:,
      billing_frequency: "month",
      zuora_account_id: nil,
      factory_bot_overrides: [],
      address_details: {}
    )
      Business.find_by(name: name)&.destroy if options[:reset]

      factory_opts = [:business, :with_self_serve_payment, *factory_bot_overrides, { name: name, owners: [Objects::User.monalisa] }]
      business = Business.find_by(name: name) || FactoryBot.create(*T.unsafe(factory_opts))

      login = "#{org_prefix}"
      Organization.find_by(login: login)&.destroy if options[:reset]
      ReservedLogin.untombstone!(login)
      org = Objects::Organization.create(login: login, admin: Objects::User.monalisa)
      org.update!(business: business)
      Objects::Repository.create(owner_name: org.login, repo_name: "repo1", setup_master: true)

      business.enable_self_serve_payments(plan_duration: billing_frequency)

      update_address(
        business,
        address: address_details[:address] || "88 Colin P Kelly Jr St",
        city: address_details[:city] || "San Francisco",
        region: address_details[:region] || "CA",
        postal_code: address_details[:postal_code] || 94107,
        country_code: address_details[:country_code] || "US"
      )
      # This is needed so that businesses who don't have a real Zuora account can still update
      # their payment method
      clear_mock_zuora_values(business)

      business.reload

      business
    end

    sig { params(billing_frequency: String, options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_business_with_billing_frequency(billing_frequency:, options: {})
      puts "creating business with name self-serve-business-#{billing_frequency}"
      business = create_self_serve_business(
        name: "self-serve-business-#{billing_frequency}",
        org_prefix: "#{billing_frequency}-self-serve-org",
        options: options,
        billing_frequency: billing_frequency,
        zuora_account_id: options[:invoiced_business_zuora_account_id]
      )
      create_zuora_account_and_update_payment_method(business)
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_business_with_rbi_payment_method(options: {})
      puts "creating business with name self-serve-business-rbi-payment-method"
      business = create_self_serve_business(
        name: "self-serve-business-rbi-payment-method",
        org_prefix: "rbi-self-serve-org",
        options: options,
        address_details: {
          address: "Sohini Tech Park, Rd Number 2",
          city: "Hyderabad",
          region: "Telangana",
          postal_code: 500032,
          country_code: "IN"
        }
      )

      create_zuora_account_and_update_payment_method(
        business,
        # The following is an India-based credit card number from https://stripe.com/docs/testing
        credit_card_number: "4000003560000008",
        credit_card_country_code: PaymentMethod::INDIA_COUNTRY_CODE
      )
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_business_with_locked_billing(options: {})
      puts "creating business with name self-serve-business-locked-billing"
      business = create_self_serve_business(name: "self-serve-business-locked-billing", org_prefix: "locked-billing-self-serve-org", options: options)

      business.plan_subscription.balance_in_cents = 1_000_000
      business.save!
      create_zuora_account_and_update_payment_method(business)

      3.times { business.increment_billing_attempts }
      business.disable!

      business
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_business_that_is_dunning(options: {})
      puts "creating business with name self-serve-business-dunning"
      business = create_self_serve_business(name: "self-serve-business-dunning", org_prefix: "dunning-self-serve-org", options: options)

      create_zuora_account_and_update_payment_method(business)

      business.plan_subscription.balance_in_cents = 1_000_000
      business.plan_subscription.save!

      ::Billing::ManualDunningPeriod.create(customer: business.customer)
      T.must(business.customer).save!

      business.increment_billing_attempts
      business.save!

      Billing::BusinessManualDunningCheckJob.perform_later business

      business
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_business_with_no_payment_method(options: {})
      puts "creating business with name self-serve-business-no-payment-method"
      business = create_self_serve_business(name: "self-serve-business-no-payment-method", org_prefix: "no-payment-method-self-serve-org", options: options)
      business.payment_method.clear_payment_details(business.owners.first)

      business
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_business_with_declined_payment_method(options: {})
      puts "creating business with name self-serve-business-declined-payment-method"
      business = create_self_serve_business(name: "self-serve-business-declined-payment-method", org_prefix: "declined-self-serve-org", options: options)

      # The declined payment number can found here: https://stripe.com/docs/testing
      create_zuora_account_and_update_payment_method(business, credit_card_number: "4000000000000341")
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_business_on_trial(options: {})
      puts "creating business with name self-serve-business-on-trial"
      business = create_self_serve_business(name: "self-serve-business-on-trial", org_prefix: "self-serve-org-on-trial", options: options)
      business.payment_method.clear_payment_details(business.owners.first)

      business.update_attribute(:trial_expires_at, 2.weeks.from_now)
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_metered_business_on_trial(options: {})
      puts "creating business with name self-serve-metered-business-on-trial"

      business = create_self_serve_business(name: "self-serve-metered-business-on-trial", org_prefix: "self-serve-metered-org-on-trial", options: options)
      business.payment_method.clear_payment_details(business.owners.first)
      business.update_attribute(:trial_expires_at, 2.weeks.from_now)

      if customer = business.customer
        customer.billing_type = Customer::BILLING_TYPE_INVOICE
        customer.metered_plan = true
        customer.save!
      end
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_self_serve_metered_ghec_business(options: {})
      puts "creating business with name self-serve-metered-ghec-business"

      business = create_self_serve_business(
        name: "self-serve-metered-ghec-business",
        org_prefix: "self-serve-metered-org",
        options: options
      )
      business.payment_method.clear_payment_details(business.owners.first)

      if customer = business.customer
        customer.update!(
          azure_subscription_id: SecureRandom.uuid,
          azure_subscription_name: "Test Azure Sub",
          billing_type: Customer::BILLING_TYPE_INVOICE,
          metered_plan: true,
        )
      end
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_sales_serve_volume_ghec_business(options: {})
      puts "creating business with name sales-serve-volume-ghec-business"

      business = create_self_serve_business(
        name: "sales-serve-volume-ghec-business",
        org_prefix: "sales-serve-volume-ghec-org",
        options: options,
        billing_frequency: "yearly",
        zuora_account_id: options[:invoiced_business_zuora_account_id]
      )
      create_zuora_account_and_update_payment_method(business)

      business.switch_to_invoiced_payments
    end

    sig { params(options: T::Hash[Symbol, T.untyped]).void }
    def self.create_sales_serve_metered_ghec_business_with_vss_bundle(options: {})
      puts "creating business with name sales-serve-volume-ghec-business-with-vss-bundle"

      org_login = "sales-serve-volume-ghec-with-vss-org"

      business = create_self_serve_business(
        name: "sales-serve-volume-ghec-business-with-vss-bundle",
        org_prefix: org_login,
        options: options,
        billing_frequency: "yearly",
        zuora_account_id: options[:invoiced_business_zuora_account_id]
      )
      create_zuora_account_and_update_payment_method(business)

      business.switch_to_invoiced_payments

      agreement_id = rand(1_000_000)
      ::Licensing::EnterpriseAgreement.create!(
        agreement_id: agreement_id,
        status: :active,
        category: :visual_studio_bundle,
        seats: 50,
        business: business
      )

      if customer = business.customer
        customer.update!(
          azure_subscription_id: SecureRandom.uuid,
          azure_subscription_name: "Test Azure Sub",
        )
      end

      # add some users consuming VSS licenses
      org = Organization.find_by(login: org_login)
      vss_user_count = 5
      (1..vss_user_count).each do |i|
        user_login = "vss-bundle-user-#{i}"
        user_email = "vss-bundle-user-#{i}@example.com"

        # remove the user first if the reset flag is set
        User.find_by(login: user_login)&.destroy if options[:reset]
        ReservedLogin.untombstone!(user_login)

        user = Seeds::Objects::User.create(login: user_login, email: user_email)

        business.add_user_accounts([user])
        T.must(org).add_member(user)

        Licensing::BundledLicenseAssignment.create!(
          enterprise_agreement_number: agreement_id,
          business_id: business.id,
          email: user_email,
          revoked: false,
          subscription_id: "some-sub-id-#{user.id}"
        )
      end
    end
  end
end
