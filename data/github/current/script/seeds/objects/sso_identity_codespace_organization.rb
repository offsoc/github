# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class SsoIdentityCodespaceOrganization < Seeds::Objects::SsoIdentityCodespaceAddMultiTenant
      def self.create(organization_seed_data, seed_data)
        organization_seed_data.each do |login, organization_data|
          create_organization_for_business(login, organization_data, seed_data)
          create_organization(login, organization_data, seed_data)
        end
      end

      def self.create_organization_for_business(login, organization_data, seed_data)
        return unless organization_data[:business].present?

        organization_data[:business].each do |slug|
          business = ::Business.find_by(slug: slug)
          next unless business.present?

          environment = seed_data.businesses_data[slug][:environment]
          email_suffix = seed_data.email_suffix(slug)

          if environment == "mt"
            on_multi_tenant_enterprise(business) do
              create_organization_for(organization_data, environment, business, slug, email_suffix, login)
            end
          else
            create_organization_for(organization_data, environment, business, slug, email_suffix, login)
          end
        end
      end

      def self.create_organization(login, organization_data, seed_data)
        return if GitHub.single_business_environment?
        return if organization_data[:business].present?

        puts "Creating organization #{login}"

        email_suffix = "contoso.org.com"

        admins = organization_data[:admins].map do |admin_login|
          ::User.find_by(login: admin_login)
        end

        # create organization
        organization = ::Organization.find_by(login: login)
        if organization.present?
          organization.admins = admins
          organization.save

          organization.teams.destroy_all
        else
          organization = ::Organization.create(login: login,
            billing_email: "#{login}@#{email_suffix}",
            plan: GitHub::Plan.business_plus,
            seats: 1000,
            admins: admins,
          )

          unless organization.persisted?
            puts "organization didn't create #{organization.errors.full_messages}"
            raise Objects::CreateFailed, "organization didn't create!"
          end

          organization.update profile_name: organization_data[:name]
        end

        create_provider(login, organization_data, organization, seed_data)

        return unless organization_data[:teams].present?

        organization_data[:teams].each do |team_name|
          # If we need a regular team, we can create one here and let it run
          organization.teams.create(name: team_name)
          GitHub::FeatureFlag.team_cache.clear
        end
      end

      def self.create_organization_for(organization_data, environment, business, slug, email_suffix, login)
        shortcode = business.shortcode

        org_login = "#{slug}-#{login}"
        if shortcode.present? && environment == "mt"
          org_login = ::Organization.standardize_login(org_login, suffix: shortcode)
        end

        puts "Creating organization #{org_login}"

        admins = organization_data[:admins].map do |admin_login|
          user_login = shortcode ? "#{admin_login}_#{shortcode}" : admin_login
          ::User.find_by(login: user_login)
        end

        # create organization
        organization = ::Organization.find_by(login: org_login)
        if organization.present?
          organization.admins = admins
          organization.save

          organization.teams.destroy_all
        else
          organization = ::Organization.create(login: org_login,
            billing_email: "#{login}@#{email_suffix}",
            plan: GitHub::Plan.business_plus,
            business: business,
            seats: 1000,
            admins: admins,
          )

          unless organization.persisted?
            puts "organization didn't create #{organization.errors.full_messages}"
            raise Objects::CreateFailed, "organization didn't create!"
          end

          organization.sync_default_repository_permission(actor: admins.first)
        end

        if organization_data[:teams].present?
          organization_data[:teams].each do |team_name|
            # If we need a regular team, we can create one here and let it run
            organization.teams.create(name: team_name)
            GitHub::FeatureFlag.team_cache.clear
          end
        end
      end

      # Public: Creates provider for a business.
      #
      # Returns nothing
      def self.create_provider(login, organization_data, organization, seed_data)
        # skip organization
        return if GitHub.single_business_environment?
        return if organization_data[:business].present?
        return unless organization_data[:provider].present?

        puts "Creating #{organization_data[:provider]} provider for #{login}"

        # create provider
        unless organization.saml_provider.present?
          if organization_data[:provider] == "saml"
            raw = File.read organization_data[:certificate]
            cert = OpenSSL::X509::Certificate.new raw

            provider = organization.create_saml_provider(
              sso_url: organization_data[:sso_url],
              issuer: organization_data[:issuer],
              idp_certificate: cert,
              enforced: true,
              recovery_codes_viewed: true,
            )
          end

          if organization_data[:scim]
            # need to sleep for a bit to make sure the organization is "old" enough
            # to be able to create invitations
            sleep(12) unless Rails.env.test?
            organization = ::Organization.find_by(login: organization.login)

            seed_data.users_data.each do |external_id, user_data|
              login = user_data[:user_name]

              provision_user_for_organization(organization, login, external_id, user_data, organization_data)
            end
          end
        end

        def self.provision_user_for_organization(organization, login, external_id, user_data, organization_data)
          return if GitHub.single_business_environment?
          return unless user_data[:organization].present?
          return unless organization.present?

          puts "Provisioning external identities for #{login}"

          email_suffix = organization_data[:email_suffix]

          admin = organization.admins.first
          return unless admin.present?

          scim_data = ::Platform::Provisioning::ScimUserData.new
          scim_data.append "userName", "#{login}@#{email_suffix}"
          scim_data.append "name.givenName", user_data[:given_name]
          scim_data.append "name.familyName", user_data[:family_name]
          scim_data.append "externalId", external_id
          scim_data.append "active", "true"
          scim_data.append "emails", "#{login}@#{email_suffix}", metadata = { "primary" => true, "type" => "work" }

          result = ::Platform::Provisioning::OrganizationIdentityProvisioner.provision_and_invite \
            organization_id: organization.id,
            user_data: ::Platform::Provisioning::AttributeMappedUserData.new(scim_data),
            inviter_id: admin.id,
            mapper: ::Platform::Provisioning::ScimMapper

          unless result.success?
            puts result.error_messages.join("\n")
            raise Objects::CreateFailed, result.error_messages.join("\n")
          end
        end

        private_class_method :create_organization_for_business, :create_organization, :create_provider,
          :provision_user_for_organization
      end
    end
  end
end
