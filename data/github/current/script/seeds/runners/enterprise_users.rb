# typed: true
# frozen_string_literal: true

require_relative "../runner"

# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

# This runner is intended to assist with development of enterprise memberships.
# It will create business users with server installations attached.
module Seeds
  class Runner
    class EnterpriseUsers < Seeds::Runner
      def self.help
        <<~EOF
        Seed Enterprise Users with server installations to the GitHub business and Github org.

        Run `bin/seed help enterprise_users` for documentation.
        EOF
      end

      def self.run(options = {})
        @enterprise_installation = options[:enterprise_installation]
        @vss_bundle = options[:vss_bundle]
        @standalone_business = options[:standalone_business]
        @standalone_organization = options[:standalone_organization]
        @github_inc = !@enterprise_installation && !@vss_bundle && !@standalone_business && !@standalone_organization

        @user_counts = {
          invites: options[:invites],
          failed_invites: options[:failed_invites],
          org_members: options[:org_members],
          suspended_users: options[:suspended_users],
          outside_collaborators: options[:outside_collaborators],
        }

        @mona = Seeds::Objects::User.monalisa

        # These are used to ensure unique names for users and orgs between business types
        @description = []
        @user_identifier = []

        if @standalone_business
          @business = Seeds::Objects::Business.create(owner: @mona, name: "business without server or vss")
          @description.push("standalone", "business")
          @user_identifier << "sb"
          @common_org = Seeds::Objects::Organization.create(login: suffix("common-org", @description, "-"), admin: @mona)
        elsif @enterprise_installation
          @description << "server"
          @user_identifier << "si"
          @business = Seeds::Objects::Business.create(owner: @mona, name: "business with enterprise installations")
          @common_org = Seeds::Objects::Organization.create(login: suffix("common-org", @description, "-"), admin: @mona)
        elsif @vss_bundle
          @description << "vssbundle"
          @user_identifier << "vs"
          @business = Seeds::Objects::Business.create(owner: @mona, name: "business with vss bundles")
          @common_org = Seeds::Objects::Organization.create(login: suffix("common-org", @description, "-"), admin: @mona)
        elsif @standalone_organization
          @description.push("standalone", "organization")
          @user_identifier << "so"
          @common_org = Seeds::Objects::Organization.create(login: @standalone_organization, plan: "free", admin: @mona)
        else # Enterprise with NO VSS or Enterprise Installations
          @business = Seeds::Objects::Business.github(admin: @mona)
          @description = []
          @user_identifier = []
          @common_org = Seeds::Objects::Organization.github(admin: @mona)
        end

        if @enterprise_installation || @github_inc
          @server_installations = create_server_installations(@description.join("-"))
        end

        if @vss_bundle || @github_inc
          @agreement = create_enterprise_agreement(suffix("vss-bundle", @description, "-"))
        end

        if @standalone_organization
          @orgs = [@common_org]
          create_standalone_org_users
        else
          @orgs = []

          @one_off_org = Seeds::Objects::Organization.create(login: suffix("one-off-org", @description, "-"), admin: @mona)
          @one_off_repo = Seeds::Objects::Repository.create(owner_name: @one_off_org.login, repo_name: suffix("one-off-repo", @description, "-"), setup_master: true)
          @business.add_organization(@one_off_org)

          @business.add_organization(@common_org)
          @orgs << @common_org

          create_user_array

          if @enterprise_installation
            create_enterprise_installation_users
          end

          if @vss_bundle || @github_inc
            create_vss_users
          end
        end
      end

      # Create Users
      # - Should have a variety of users with:
      # - Org membership or not
      # - Org ownership or not
      # - Server installations or not
      # - VSS licensing
      def self.create_user_array
        create_users("unaffiliated")

        add_users_to_orgs(
          create_users("user-org-member", count: @user_counts[:org_members])
        )

        add_users_to_orgs(
          add_users_to_orgs(
            create_users("user-org-owner", count: 1),
            orgs: @common_org,
            owner: true
          )
        )

        add_users_to_orgs(
          add_users_to_orgs(
            create_users("user-org-owner-invite", count: 1),
            orgs: @common_org,
            owner: true,
            invite_only: true
          )
        )

        add_users_to_orgs(
          create_users("org-owner-invite-only", count: 1),
          orgs: @common_org,
          owner: true,
          invite_only: true
        )

        add_users_to_orgs(
          add_users_to_orgs(
            create_users("user-with-org-invites", count: 1)
          ),
          invite_only: true
        )

        add_users_to_repos(
          add_users_to_orgs(
            create_users("user-with-repo-direct-access", count: 1)
          ),
          repos: @one_off_repo
        )


        add_users_to_repos(
          add_users_to_orgs(
            create_users("user-with-repo-invites", count: 1)
          ),
          repos: @one_off_repo,
          invite_only: true
        )

        add_enterprise_admins(
          create_users("enterprise-admin", count: 1)
        )

        suspend_users(
          add_enterprise_admins(
            create_users("enterprise-admin-suspended", count: 1)
          )
        )

        add_enterprise_admins(
          create_users("enterprise-admin-invited", count: 1),
          invite_only: true
        )

        add_enterprise_admins(
          add_users_to_orgs(
            create_users("enterprise-admin-with-orgs", count: 1)
          )
        )

        add_enterprise_admins(
          create_users("enterprise-billing", count: 1),
          billing_manager: true
        )

        add_enterprise_admins(
          create_users("enterprise-billing-invited", count: 1),
          billing_manager: true,
          invite_only: true
        )

        add_enterprise_admins(
          add_users_to_orgs(
            create_users("enterprise-billing-with-orgs", count: 1)
          ),
          billing_manager: true
        )

        # Create other users - outside collaborators and user invitations
        suspend_users(
          add_users_to_orgs(
            create_users("suspended-user", count: @user_counts[:suspended_users])
          )
        )

        add_users_to_repos(
          create_users("outside-collaborator", business: nil, count: @user_counts[:outside_collaborators])
        )

        add_users_to_repos(
          create_users("outside-collaborator-2fa", business: nil, two_factor: true, count: 1)
        )

        add_failed_invites(
          create_users("failed-invite-user-expired", count: @user_counts[:failed_invites])
        )

        add_failed_invites(
          create_users("failed-invite-admin-expired", count: 1),
          owner: true,
        )

        add_failed_invites(
          create_users("failed-invite-user-seats", count: 1),
          failed_reason: :no_more_seats,
        )

        add_failed_invites(
          create_users("failed-invite-scim-seats", count: 1),
          invitation_source: :scim,
          failed_reason: :no_more_seats,
        )

        add_failed_invites(
          create_users("failed-invite-admin-seats", count: 1),
          owner: true,
          failed_reason: :no_more_seats,
        )

        add_failed_invites(
          create_users("failed-invite-user-trade", count: 1),
          failed_reason: :trade_controls,
        )

        add_failed_invites(
          create_users("failed-invite-admin-trade", count: 1),
          owner: true,
          failed_reason: :trade_controls,
        )

        failed_email = "#{suffix('failed-invite-email-user-expired', @user_identifier, '-')}@github.com"
        add_failed_invites(
          nil,
          email: failed_email,
        )

        failed_email = "#{suffix('failed-invite-email-admin-expired', @user_identifier, '-')}@github.com"
        add_failed_invites(
          nil,
          email: failed_email,
          owner: true,
        )

        failed_email = "#{suffix('failed-invite-email-user-seats', @user_identifier, '-')}@github.com"
        add_failed_invites(
          nil,
          email: failed_email,
          failed_reason: :no_more_seats,
        )

        failed_email = "#{suffix('failed-invite-email-admin-seats', @user_identifier, '-')}@github.com"
        add_failed_invites(
          nil,
          email: failed_email,
          owner: true,
          failed_reason: :no_more_seats,
        )

        failed_email = "#{suffix('failed-invite-email-user-trade', @user_identifier, '-')}@github.com"
        add_failed_invites(
          nil,
          email: failed_email,
          failed_reason: :trade_controls,
        )

        failed_email = "#{suffix('failed-invite-email-admin-trade', @user_identifier, '-')}@github.com"
        add_failed_invites(
          nil,
          email: failed_email,
          owner: true,
          failed_reason: :trade_controls,
        )

        add_failed_collaborator_invites(
          create_users("failed-collab-invite", business: nil, count: 1)
        )

        add_users_to_orgs(
          create_users("invited-user-with-bua", count: 1),
          invite_only: true
        )

        add_users_to_orgs(
          create_users("invited-user-no-bua", business: nil, count: @user_counts[:invites]),
          invite_only: true
        )

        add_users_to_orgs(
          create_users("invited-owner-no-bua", business: nil, count: 1),
          owner: true,
          invite_only: true
        )

        email = "#{suffix('invited-email-user', @user_identifier, '-')}@github.com"
        add_users_to_orgs(
          nil,
          email: email,
          invite_only: true
        )

        add_users_to_repos(
          create_users("invited-collab", business: nil, count: 1),
          invite_only: true
        )

        add_users_to_repos(
          add_users_to_orgs(
            create_users("invited-collab-orgs-repos", business: nil, count: 1),
            invite_only: true
          ),
          repos: @one_off_repo,
          invite_only: true
        )
      end

      def self.create_enterprise_installation_users
        add_user_to_enterprise_installation(
          add_users_to_orgs(
            create_users("user-orgs-servers", count: 1),
            orgs: @common_org
          )
        )

        # Notice this is using create_business_user_accounts instead of create_users
        add_user_to_enterprise_installation(
          create_business_user_accounts("user-servers-only", count: 1)
        )

        add_user_to_enterprise_installation(
          add_enterprise_admins(
            add_users_to_orgs(
              create_users("enterprise-admin-orgs-servers", count: 1)
            )
          )
        )
      end

      def self.create_vss_users
        add_user_to_vss_bundle(
          add_users_to_orgs(
            create_users("user-vss-bundle", count: 1)
          )
        )

        create_unattached_vss_bundle("bla-unattached", count: 1)

        add_user_to_vss_bundle(
          add_enterprise_admins(
            add_users_to_orgs(
              create_users("enterprise-admin-vss-bundle", count: 1)
            )
          )
        )
      end

      def self.create_standalone_org_users
        add_users_to_orgs(
          create_users("user-org-member", business: nil, count: @user_counts[:org_members])
        )
      end

      # Create users
      # - Base Name is the prefix for all users
      # - Count is how many users to create. Defaults to 1
      # - Business is the business to add these users into. Pass nil to not add to a business.
      # Returns users
      def self.create_users(base_name, count: 1, business: @business, suffix: @user_identifier, two_factor: false)
        count ||= 1
        users = []
        login = suffix(base_name, suffix, "-")

        (1..count).each do |i|
          puts "Creating user #{login}-#{i}"
          user = Seeds::Objects::User.create(login: "#{login}-#{i}")
          unless business.nil?
            business.add_user_accounts([user.id])
          end
          if two_factor
            Seeds::Objects::User.two_factor_enable!(user: user)
          end
          users << user
        end
        users
      end

      # Create business user accounts without creating a user
      # - Base Name is the prefix for all users
      # - Count is how many users to create. Defaults to 1
      # Returns business user accounts
      def self.create_business_user_accounts(base_name, suffix: @user_identifier, count: 1)
        count ||= 1
        business_user_accounts = []
        login = suffix(base_name, suffix, "-")

        (1..count).each do |i|
          begin
            business_user_account = @business.user_accounts.find_by!(login: "#{login}-#{i}")
          rescue ActiveRecord::RecordNotFound
            business_user_account = ::BusinessUserAccount.create(business: @business, login: "#{login}-#{i}")
          end
          business_user_accounts << business_user_account
        end
        business_user_accounts
      end

      # Adds users to organizations
      # - user is whether to add/invite user as org owner
      # - invite_only will create an invitation instead of adding user to org
      # Returns users so this can be daisy chained with other functions
      def self.add_users_to_orgs(users, email: nil, orgs: @orgs, owner: false, invite_only: false, invitation_source: :member)
        unless orgs.is_a?(Array)
          orgs = [orgs]
        end
        orgs.each do |org|
          # Handle scenario that users are passed in
          unless users.nil?
            users.each do |user|
              if invite_only
                if OrganizationInvitation.find_by(organization: org,
                  invitee_id: user.id).nil?
                  Seeds::Objects::OrganizationInvitation.create!(
                    org: org,
                    invitee: user,
                    inviter: @mona,
                    role: owner ? "admin" : "direct_member",
                    invitation_source: invitation_source
                  )
                end
              else
                if owner
                  org.add_admin user
                else
                  org.add_member user
                end
              end
            end
          end
          unless email.nil?
            # Not searching for an existing invite because it will find a revoked invite
            Seeds::Objects::OrganizationInvitation.create!(
              org: org,
              email: email,
              inviter: @mona,
              role: owner ? "admin" : "direct_member",
            )
          end
        end
        users
      end

      # Adds failed invitations to orgs
      # Returns users so this can be daisy chained with other functions
      def self.add_failed_invites(
        users,
        email: nil,
        orgs: @orgs,
        owner: false,
        invitation_source: :member,
        failed_reason: :expired
      )
        unless orgs.is_a?(Array)
          orgs = [orgs]
        end
        orgs.each do |org|
          # Handle scenario that users are passed in
          unless users.nil?
            users.each do |user|
              if OrganizationInvitation.find_by(organization: org,
                invitee_id: user.id).nil?
                invite = Seeds::Objects::OrganizationInvitation.create!(
                  org: org,
                  invitee: user,
                  inviter: @mona,
                  role: owner ? "admin" : "direct_member",
                  invitation_source: invitation_source
                )
                invite.update(failed_at: Time.now, failed_reason: failed_reason)
                invite.save!
              end
            end
          end
          unless email.nil?
            # Not searching for an existing invite because it will find a revoked invite
            invite = Seeds::Objects::OrganizationInvitation.create!(
              org: org,
              email: email,
              inviter: @mona,
              role: owner ? "admin" : "direct_member",
              invitation_source: invitation_source
            )
            invite.update(failed_at: Time.now, failed_reason: failed_reason)
            invite.save!
          end
        end
        users
      end

      # Adds failed invitations to repos
      # Returns users so this can be daisy chained with other functions
      def self.add_failed_collaborator_invites(
        users,
        email: nil,
        repos: @one_off_repo
      )
        unless repos.is_a?(Array)
          repos = [repos]
        end
        repos.each do |repo|
          # Handle scenario that users are passed in
          unless users.nil?
            users.each do |user|
              if RepositoryInvitation.find_by(invitee_id: user.id,
                repository_id: repo.id).nil?
                invite = Seeds::Objects::RepositoryInvitation.create(
                  repository: repo,
                  invitee: user,
                  inviter: @mona
                )

                invite.update!(created_at: Time.zone.now - GitHub.invitation_expiry_period.days - 7.days)
              end
            end
          end
          unless email.nil?
            puts "Email collaborator failed invites is not implemented yet"
          end
        end
        users
      end

      # Adds enterprise admins to the business
      # - billing manager will set the user as a billing manager
      # Returns users so this can be daisy chained with other functions
      def self.add_enterprise_admins(users, business: @business, billing_manager: false, invite_only: false)
        users.each do |user|
          if invite_only
            business.invite_admin(user: user, role: billing_manager ? :billing_manager : :owner, inviter: @mona)
          else
            business.add_owner(user, actor: @mona)
            if billing_manager
              business.change_admin_role(user, new_role: :billing_manager, actor: @mona, send_notification: false)
            end
          end
        end
        users
      end

      # Adds users to repos
      # - invite_only will only create an invitation
      # Returns users so this can be daisy chained with other functions
      def self.add_users_to_repos(users, repos: @one_off_repo, invite_only: false)
        unless repos.is_a?(Array)
          repos = [repos]
        end
        users.each do |user|
          repos.each do |repo|
            if invite_only
              invite = Seeds::Objects::RepositoryInvitation.create(repository: repo, invitee: user, inviter: @mona)
            else
              repo.add_member user
            end
          end
        end
        users
      end

      # Adds users to enterprise installations
      # Should be able to pass in users or business user accounts
      # Returns users so this can be daisy chained with other functions
      def self.add_user_to_enterprise_installation(users, server_installations: @server_installations)
        users.each do |user|
          case user
          when ::User
            business_user_account = user.business_user_account
          when ::BusinessUserAccount
            business_user_account = user
          end
          enterprise_installation_account = {
            user_id: 12345 + T.cast(T.must(business_user_account).id, Integer),
            business_user_account_id: T.must(business_user_account).id,
            login: T.must(business_user_account).login,
            profile_name: T.must(business_user_account).login,
            site_admin: false,
            emails: [{
              email: "#{T.must(business_user_account).login}@github.com",
              primary: true
            }]
          }

          server_installations.each do |server|
            import_user_accounts(enterprise_installation_account, server[:installation_id])
          end
        end
        users
      end

      # Adds VSS bundle to users
      # Returns users so this can be daisy chained with other functions
      def self.add_user_to_vss_bundle(users)
        users.each do |user|
          if Licensing::BundledLicenseAssignment.find_by(subscription_id: "some-sub-id-#{user.id}").nil?
            Licensing::BundledLicenseAssignment.create!(
              enterprise_agreement_number: @agreement.agreement_id,
              business_id: @business.id,
              email: user.email,
              revoked: false,
              subscription_id: "some-sub-id-#{user.id}"
            )
          end
        end
        users
      end

      # Creates VSS bundles not attached to a User
      # Returns users so this can be daisy chained with other functions
      def self.create_unattached_vss_bundle(email_base, suffix: @user_identifier, count: 1)
        (1..count).each do |i|
          email_user = suffix(email_base, suffix + [i], "-")
          email_full = "#{email_user}@test.github.com"
          puts "Going to create #{email_full} VSS unattached user"

          if Licensing::BundledLicenseAssignment.find_by(subscription_id: email_user).nil?
            Licensing::BundledLicenseAssignment.create!(
              enterprise_agreement_number: @agreement.agreement_id,
              business_id: @business.id,
              email: email_full,
              revoked: false,
              subscription_id: email_user
            )
          end
        end
      end

      # Suspends users
      # Returns users so this can be daisy chained with other functions
      def self.suspend_users(users)
        users.each do |user|
          user.suspend("suspended reasons")
        end
        users
      end

      # Creates a few server installations
      # Returns array of hashes with installation ID added
      def self.create_server_installations(suffix)
        if suffix.empty?
          suffix = "this-installation"
        end
        server_installations = [
          {
            name: "Modest Gamer",
            id: "#{suffix}",
            hostname: "modest.gamer.com"
          },
          {
            name: "Octo Anosmiacs",
            id: "#{suffix}",
            hostname: "anosmia.hubbers.com"
          },
        ]

        license_public_key = Rails.root.join("test/fixtures/enterprise_installations/public_key").read

        server_installations.each do |server|
          if installation = @business.enterprise_installations.find_by(server_id: server[:id])
            server[:installation_id] = installation.id
          else
            installation = EnterpriseInstallation.create! \
            owner: @business,
            server_id: server[:id],
            host_name: server[:hostname],
            customer_name: server[:name],
            license_hash: Digest::SHA256.base64digest("owHsuVmu9EyaHlaydJWGrnR..."),
            http_only: true,
            version: "2.16.4",
            license_public_key: license_public_key
          end
          server[:installation_id] = installation.id
        end

        server_installations
      end

      def self.create_enterprise_agreement(agreement_id)
        agreement = Licensing::EnterpriseAgreement.find_by(agreement_id: agreement_id)
        if agreement.nil?
          agreement = ::Licensing::EnterpriseAgreement.create!(
            agreement_id: agreement_id,
            status: :active,
            category: :visual_studio_bundle,
            seats: 50,
            business: @business
          )
        end
        agreement
      end

      # Add installation_id to the enterprise_installation_account account
      def self.import_user_accounts(enterprise_installation_account, installation_id)

        accounts_sql = Arel.sql(<<-SQL)
          INSERT INTO enterprise_installation_user_accounts (
            `enterprise_installation_id`,
            `remote_user_id`,
            `remote_created_at`,
            `login`,
            `profile_name`,
            `site_admin`,
            `business_user_account_id`,
            `created_at`,
            `updated_at`
          ) VALUES
        SQL

        #user_account = Seeds::Objects::User.create(login: enterprise_installation_account[:login])
        values = {
            enterprise_installation_id: installation_id,
            remote_user_id: enterprise_installation_account[:user_id],
            login: enterprise_installation_account[:login],
            profile_name: enterprise_installation_account[:profile_name],
            site_admin: enterprise_installation_account[:site_admin] || false,
            business_user_account_id: enterprise_installation_account[:business_user_account_id],
          }
        accounts_sql += Arel.sql(<<-SQL, **values)
          (
            :enterprise_installation_id,
            :remote_user_id,
            NOW(),
            :login,
            :profile_name,
            :site_admin,
            :business_user_account_id,
            NOW(),
            NOW()
          )
        SQL

        accounts_sql += Arel.sql(<<-SQL)
          ON DUPLICATE KEY UPDATE
            `remote_created_at` = VALUES(`remote_created_at`),
            `login` = VALUES(`login`),
            `profile_name` = VALUES(`profile_name`),
            `site_admin` = VALUES(`site_admin`),
            `business_user_account_id` = VALUES(`business_user_account_id`),
            `updated_at` = NOW()
        SQL

        EnterpriseInstallationUserAccount.connection.insert(accounts_sql)
      end

      ## Helper method to prefix a string with a descriptor
      def self.prefix(base_name, descriptor, combinator)
        if descriptor.nil?
          return base_name
        end
        login = descriptor | [base_name]
        login.join(combinator)
      end

      ## Helper method to suffix a string with a descriptor
      def self.suffix(base_name, descriptor, combinator)
        if descriptor.nil?
          return base_name
        end
        login = [base_name] | descriptor
        login.join(combinator)
      end
    end
  end
end
