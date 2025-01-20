# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class SsoIdentityCodespaceBusiness
      # Public: Updates the business in the enterprise environment.
      #
      # Returns nothing
      def self.update(seed_business_data, no_scim: false)
        return unless GitHub.single_business_environment?

        business = ::Business.all.first
        current_user = ::User.find_by(login: "monalisa")

        seed_business_data.each do |slug, business_data|
          # skip businesses that do not belong in environment
          next unless matching_environment?(business_data[:environment])

          puts "Updating business #{business_data[:name]}"

          business.update! name: business_data[:name], slug: slug

          raise Objects::ActionFailed, "business didn't save!" unless business.persisted?

          next if no_scim

          create_provider(business_data, business.reload, no_scim: no_scim)
        end
      end

      # Public: Creates the business in the dotcom environment.  Business can be EMU or not.
      #
      # Returns nothing
      def self.create(seed_business_data, no_scim: false)
        return if GitHub.single_business_environment?

        seed_business_data.each do |slug, business_data|
          # skip businesses that do not belong in current environment
          next unless matching_environment?(business_data[:environment])

          shortcode = business_data[:shortcode]

          if shortcode.present?
            admin = self.create_emu_business_admin(business_data)
            business = self.create_business(business_data, slug, admin)

            if business_data[:environment] == "mt"
              admin.update_attribute(:business_id, business.id)
            end

            self.create_provider(business_data, business)

            # create admins's EMU account
            admin_user_account = ::BusinessUserAccount.find_by(login: admin.login)
            unless admin_user_account.present?
              admin_user_account = business.add_user_accounts([admin.id])
            end
          end
        end
      end

      # Public: Creates provider for a business.
      #
      # Returns nothing
      def self.create_provider(business_data, business, no_scim: false)
        # skip businesses that does not belong in environment
        return unless matching_environment?(business_data[:environment])

        puts "Creating #{business_data[:provider]} provider for #{business_data[:name]}"

        # create provider
        if business.reload.external_provider.present?
          provider = business.reload.external_provider

          if business_data[:provider] == "saml"
            raw = File.read business_data[:certificate]
            cert = OpenSSL::X509::Certificate.new raw

            provider.update(
              sso_url: business_data[:sso_url],
              issuer: business_data[:issuer],
              idp_certificate: cert,
              recovery_codes_viewed: true,
            )
            unless no_scim
              provider.scim_provisioning_state = :scim_provisioning_state_enabled
              provider.save
            end
          else
            provider.update(
              oidc_provider: business_data[:provider_idp],
              tenant_id: business_data[:tenant],
            )
          end
        else
          if business_data[:provider] == "saml"
            raw = File.read business_data[:certificate]
            cert = OpenSSL::X509::Certificate.new raw

            provider = business.create_saml_provider(
              sso_url: business_data[:sso_url],
              issuer: business_data[:issuer],
              idp_certificate: cert,
              recovery_codes_viewed: true,
            )

            raise Objects::CreateFailed, "provider didn't save!" unless provider.persisted?

            unless no_scim
              provider.scim_provisioning_state = :scim_provisioning_state_enabled
              provider.save
            end
          else
            provider = ::Business::OIDCProvider.new(
              business: business,
              oidc_provider: business_data[:provider_idp],
              tenant_id: business_data[:tenant],
            )
            provider.save

            raise Objects::CreateFailed, "provider didn't save!" unless provider.persisted?
          end
        end
      end

      # Public: Creates the admin user for the business.
      #
      # Returns User
      def self.create_emu_business_admin(business_data)
        shortcode = business_data[:shortcode]

        # create business admin
        admin = ::User.find_by(login: "#{shortcode}_admin")

        unless admin.present?
          email = "#{business_data[:email]}+#{shortcode}-admin@#{business_data[:email_suffix]}"
          admin  = ::User.create_with_random_password(shortcode, false, { "email" => email, "force_enterprise_managed" => true,
            "login_suffix" => "admin", :password => GitHub.default_password, :password_confirmation => GitHub.default_password })
          admin.save

          puts "Created EMU admin user #{admin.login} for #{shortcode}"

          # set the profile primary email
          profile = if admin.persisted?
            admin.find_or_create_profile
          else
            admin.build_profile
          end
          profile.email = "#{business_data[:email]}@#{business_data[:email_suffix]}"
          profile.save

          admin.emails.map(&:verify!)
          admin.clear_employee_memo
        end

        admin
      end

      # Public: Creates the business.
      #
      # Returns Business
      def self.create_business(business_data, slug, admin)
        shortcode = business_data[:shortcode]

        puts "Creating business #{business_data[:name]}"

        # create business
        business = ::Business.find_by(slug: slug)

        unless business.present?
          if shortcode.present?
            business = ::Business.create(
              name: business_data[:name],
              seats_plan_type: business_data[:seats_plan_type] || :full,
              seats: 10000,
              owners: [admin],
              business_type: :enterprise_managed,
              shortcode: shortcode,
              customer: ::Customer.create(
                billing_type: "invoice",
                billing_end_date: GitHub::Billing.today + 1.year,
                name: business_data[:name],
                billing_attempts: 0,
                term_length: 12,
              ),
            )
          else
            business = ::Business.create(
              name: business_data[:name],
              seats_plan_type: business_data[:seats_plan_type] || :full,
              seats: 10000,
              owners: [admin],
              customer: ::Customer.create(
                billing_type: "invoice",
                billing_end_date: GitHub::Billing.today + 1.year,
                name: business_data[:name],
                billing_attempts: 0,
                term_length: 12,
              ),
            )
          end
        end

        # Enable Copilot configuration when needed
        if business_data[:seats_plan_type].to_s == "basic"
          copilot_business = Copilot::Business.new(business)
          copilot_business.ensure_configuration!
        end

        # Enable metered Azure subscription when needed
        if business_data[:azure_subscription] == true
          business.customer.update!(
            metered_ghe: true,
            metered_via_azure: true,
            azure_subscription_id: "80e769f2-ce0f-11ed-afa1-0242ac120002",
            azure_subscription_name: "My subscription"
          )
          business.customer.onboard_to_billing_platform(
            products: [
              Billing::OnboardCustomerToProductInBillingPlatformJob::ProductEnum::Actions.serialize,
              Billing::OnboardCustomerToProductInBillingPlatformJob::ProductEnum::Codespaces.serialize,
              Billing::OnboardCustomerToProductInBillingPlatformJob::ProductEnum::Copilot.serialize,
              Billing::OnboardCustomerToProductInBillingPlatformJob::ProductEnum::Git_Lfs.serialize,
              Billing::OnboardCustomerToProductInBillingPlatformJob::ProductEnum::Ghec.serialize,
              Billing::OnboardCustomerToProductInBillingPlatformJob::ProductEnum::Packages.serialize
            ],
          )
          business.enable_self_serve_payments(skip_billing: true, plan_duration: "month")
        end

        # Enable feature flags for the business
        if business_data[:feature_flags].present?
          business_data[:feature_flags].each do |flag_name|
            GitHub.flipper[flag_name].enable(business)
          end
        end

        business
      end

      def self.matching_environment?(env)
        case env
        when "ghec", "mt"
          !GitHub.enterprise?
        when "ghes"
          GitHub.enterprise?
        else
          raise "#{env} is not a valid environment"
        end
      end

      private_class_method :create_business, :create_emu_business_admin, :create_provider
    end
  end
end
