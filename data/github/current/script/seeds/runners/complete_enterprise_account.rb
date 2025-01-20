# frozen_string_literal: true

require_relative "../runner"

module Seeds
  class Runner
    class CompleteEnterpriseAccount < Seeds::Runner
      def self.help
        <<~HELP
        Seed enterprise account with organizations, members, repositories, and more.

        Business type must be one of: self_serve_business_monthly, self_serve_business_yearly,
        self_serve_rbi_payment_method, self_serve_locked_billing, self_serve_dunning, self_serve_no_payment_method,
        self_serve_declined_payment_method, self_serve_business_on_trial, self_serve_metered_business_on_trial,
        self_serve_metered_ghec_business

        HELP
      end

      def self.run(options = {})
        owner = Seeds::Objects::User.monalisa
        organization_count = options[:organization_count] || 1

        reset!(options) if options[:reset]
        if options[:shared_users]
          shared_admin = Seeds::Objects::User.create(login: "#{Seeds::DataHelper.random_username}-shared", email: Seeds::DataHelper.random_email)
          shared_member = Seeds::Objects::User.create(login: "#{Seeds::DataHelper.random_username}-shared", email: Seeds::DataHelper.random_email)
        end

        # Extra organizations aside from the default one that is created with the business seed
        organizations = []
        (2..organization_count).each do |i|
          org_login = "#{business_name(options[:business_type]).truncate(33)}-org-#{i - 1}".gsub("_", "-").parameterize
          organization = Seeds::Objects::Organization.create(login: org_login, admin: owner)
          organizations << organization
          puts "Created organization #{org_login}"

          add_shared_users_to_organization(organization, shared_admin, shared_member) if options[:shared_users]
          create_repositories(organization) if options[:repositories]
          invite_to_organization(organization, owner) if options[:organization_invitations]
        end

        business = create_business!(options)
        organizations.each { |org| business.add_organization(org) }

        invite_to_business(business, owner) if options[:business_invitations]
      end

      def self.create_repositories(organization)
        Seeds::Objects::Repository.create(
          is_public: true,
          owner_name: organization.login,
          repo_name: Seeds::DataHelper.random_username,
          setup_master: true
        )

        Seeds::Objects::Repository.create(
          is_public: false,
          owner_name: organization.login,
          repo_name: Seeds::DataHelper.random_username,
          setup_master: true
        )
        puts "Added 2 repositories (1 public, 1 private) to organization #{organization.login}"
      end

      def self.invite_to_organization(organization, owner)
        invitation_user = Seeds::Objects::User.create(login: Seeds::DataHelper.random_username, email: Seeds::DataHelper.random_email)
        organization.invite(invitation_user, inviter: owner, role: :admin)

        puts "Invited user #{invitation_user.login} to organization #{organization.login} as admin"
      end

      def self.add_shared_users_to_organization(organization, shared_admin, shared_member)
        if shared_admin
          organization.add_admin(shared_admin)
          puts "Added user #{shared_admin.login} as admin to organization #{organization.login}"
        end

        if shared_member
          organization.add_member(shared_member)
          puts "Added user #{shared_member.login} as member to organization #{organization.login}"
        end
      end

      def self.reset!(options = {})
        business = Business.find_by(name: business_name(options[:business_type]))
        return unless business

        if business
          business.organizations.each do |org|
            org.members.each do |member|
              org.remove_member(member) unless member == owner
            end
            org.repositories.each do |repo|
              repo.delete
            end
            org.delete
          end
        end
      end

      def self.invite_to_business(business, owner)
        # Invitations to Business
        invitation_user_1 = Seeds::Objects::User.create(login: Seeds::DataHelper.random_username, email: Seeds::DataHelper.random_email)
        BusinessAdministratorInvitation.create!(role: :owner, business: business, inviter: owner, invitee: invitation_user_1)
        puts "Invited user #{invitation_user_1.login} to business #{business.name} as owner"

        invitation_user_2 = Seeds::Objects::User.create(login: Seeds::DataHelper.random_username, email: Seeds::DataHelper.random_email)
        BusinessAdministratorInvitation.create!(role: :billing_manager, business: business, inviter: owner, invitee: invitation_user_2)
        puts "Invited user #{invitation_user_2.login} to business #{business.name} as billing manager"
      end

      def self.create_business!(options = {})
        require_relative "../factory_bot_loader"

        business_options = {
          self_serve_business_monthly: false,
          self_serve_business_yearly: false,
          self_serve_rbi_payment_method: false,
          self_serve_locked_billing: false,
          self_serve_dunning: false,
          self_serve_no_payment_method: false,
          self_serve_declined_payment_method: false,
          self_serve_business_on_trial: false,
          self_serve_metered_business_on_trial: false,
          self_serve_metered_ghec_business: false,
          reset: options[:reset] || false
        }
        business_options[options[:business_type].to_sym] = true
        Seeds::Runner::BillingBusinessPersonas.run(business_options)

        Business.find_by!(name: business_name(options[:business_type]))
      end

      def self.business_name(business_type)
        case business_type
        when "self_serve_business_monthly"
          "self-serve-business-month"
        when "self_serve_business_yearly"
          "self-serve-business-year"
        when "self_serve_rbi_payment_method"
          "self-serve-business-rbi-payment-method"
        when "self_serve_locked_billing"
          "self-serve-business-locked-billing"
        when "self_serve_dunning"
          "self-serve-business-dunning"
        when "self_serve_no_payment_method"
          "self-serve-business-no-payment-method"
        when "self_serve_declined_payment_method"
          "self-serve-business-declined-payment-method"
        when "self_serve_business_on_trial"
          "self-serve-business-on-trial"
        when "self_serve_metered_business_on_trial"
          "self-serve-metered-business-on-trial"
        when "self_serve_metered_ghec_business"
          "self-serve-metered-ghec-business"
        else
          raise "Invalid business type: #{business_type}"
        end
      end
    end
  end
end
