# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class SsoIdentityCodespaceUser < Seeds::Objects::SsoIdentityCodespaceAddMultiTenant
      def self.create(user_seed_data, seed_data)
        user_seed_data.each do |external_id, user_data|
          login = user_data[:user_name]

          puts "Creating/updating user and external identities for #{login}"

          create_user_for_business(login, external_id, user_data, seed_data)
          create_user_for_organization(login, user_data)
        end
      end

      def self.create_user_for_organization(login, user_data)
        return if GitHub.single_business_environment?
        return unless user_data[:organization].present?

        email_suffix = "contoso.org.com"

        user = ::User.find_by(login: login)

        if user.nil?
          # primary email
          email = "#{login}@#{email_suffix}"
          # provisioner will create a user with random password, for Seed data, we'll assign the default password to the emu user
          user = ::User.create_with_random_password(login, false, { "email" => email,
            :password => GitHub.default_password, :password_confirmation => GitHub.default_password })
          user.save

          primary_user_email, _ = user.emails.primary_first

          primary_user_email.mark_as_verified
          primary_user_email.save
        end
      end

      def self.create_user_for_business(login, external_id, user_data, seed_data)
        user_data[:business].each do |slug|
          business = ::Business.find_by(slug: slug)
          next unless business.present?

          email_suffix = seed_data.email_suffix(slug)
          environment = seed_data.businesses_data[slug][:environment]

          if environment == "mt"
            on_multi_tenant_enterprise(business) do
              create_user_for(user_data, environment, business, email_suffix, login, external_id)
            end
          else
            create_user_for(user_data, environment, business, email_suffix, login, external_id)
          end
        end
      end

      def self.create_user_for(user_data, environment, business, email_suffix, login, external_id)
        shortcode = business.shortcode

        admin = find_admin(business, environment)
        return unless admin.present?

        user_login = if shortcode
          "#{login}_#{shortcode}"
        else
          login
        end

        if !GitHub.single_business_environment? && user_data[:create_user]
          user = ::User.find_by(login: user_login)

          if user.nil?
            # primary email should be modified by the provisioner
            email = "#{login}+#{shortcode}@#{email_suffix}"
            # provisioner will create a user with random password, for Seed data, we'll assign the default password to the emu user
            default_opts = { "email" => email, "force_enterprise_managed" => true, "login_suffix" => shortcode,
              :password => GitHub.default_password, :password_confirmation => GitHub.default_password }
            default_opts["business_id"] = business.id if environment == "mt"

            user = ::User.create_with_random_password(login, false, default_opts)
            user.save

            business.add_user_accounts([user.id])

            primary_user_email, _ = user.emails.primary_first
            primary_user_email.mark_as_verified
            primary_user_email.save

            if user_data[:gh_role]
              user.update(gh_role: user_data[:gh_role])
              user.stafftools_roles << StafftoolsRole.new(name: user_data[:stafftools_role])
            end
          end
        end

        scim_data = ::Platform::Provisioning::ScimUserData.new
        scim_data.append "userName", "#{login}@#{email_suffix}"
        scim_data.append "name.givenName", user_data[:given_name]
        scim_data.append "name.familyName", user_data[:family_name]
        scim_data.append "externalId", external_id
        scim_data.append "active", "true"
        scim_data.append "emails", "#{login}@#{email_suffix}", metadata = { "primary" => true, "type" => "work" }
        scim_data.append "roles", user_data[:role] if user_data[:role].present?

        result = provisioner.provision_or_update \
          target: business,
          user_data: ::Platform::Provisioning::AttributeMappedUserData.new(scim_data),
          mapper: ::Platform::Provisioning::ScimMapper

        unless result.success?
          puts result.error_messages.join("\n")
          raise Objects::CreateFailed, result.error_messages.join("\n")
        end

        # Enable feature flags for the user
        if user_data[:feature_flags].present?
          user_data[:feature_flags].each do |flag_name|
            GitHub.flipper[flag_name].enable(result.external_identity.user)
          end
        end

        if user_data[:suspended]
          scim_data = ::Platform::Provisioning::ScimUserData.new
          scim_data.append "userName", "#{login}@#{email_suffix}"
          scim_data.append "externalId", external_id
          scim_data.append "active", "false"
          scim_data.append "emails", "#{login}@#{email_suffix}", metadata = { "primary" => true, "type" => "work" }

          result = provisioner.update \
            target: business,
            user_data: ::Platform::Provisioning::AttributeMappedUserData.new(scim_data),
            mapper: ::Platform::Provisioning::ScimMapper,
            user_id: result.external_identity.user_id,
            identity_guid: result.external_identity.guid,
            identity: result.external_identity,
            actor_id: admin.id

          unless result.success?
            puts result.error_messages.join("\n")
            raise Objects::CreateFailed, result.error_messages.join("\n")
          end
        end
      end

      def self.provisioner
        return ::Platform::Provisioning::EnterpriseServerSCIMIdentityProvisioner if GitHub.enterprise?
        ::Platform::Provisioning::EnterpriseManagedIdentityProvisioner
      end

      def self.find_admin(business, env)
        case env
        when "mt"
          GitHub::CurrentTenant.unscope { business.find_first_emu_owner }
        when "ghec"
          business.find_first_emu_owner
        else
          ::User.find_by(login: "monalisa")
        end
      end

      private_class_method :provisioner, :find_admin, :create_user_for_business,
        :create_user_for_organization
    end
  end
end
