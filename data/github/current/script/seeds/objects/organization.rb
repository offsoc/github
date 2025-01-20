# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Organization
      def self.github(admin: Objects::User.monalisa)
        org = create(login: GitHub.trusted_oauth_apps_org_name, admin: admin, plan: "business_plus")
        GitHub.trusted_apps_owner_id = nil # De-memoize the ID of the github organization
        org
      end

      def self.trusted_oauth_apps_owner
        Seeds::Objects::Organization.github
        GitHub.trusted_oauth_apps_owner
      end

      def self.proxima_third_party_apps_owner(admin: Objects::User.monalisa)
        org = create(login: GitHub.proxima_third_party_apps_owner_login, admin: admin)
        GitHub.proxima_third_party_apps_owner_id = nil
        org
      end

      def self.create(login:, admin:, plan: "business_plus")
        org = ::Organization.find_by(login: login)

        # In multi-tenant enterprise, if the org already exists, just return it.
        # Since this org (github-enterprise) is external, the validations below are failing
        # with either missing admins, or inability to grant EMU a control over the external org.
        return org if org && GitHub.multi_tenant_enterprise?

        org ||= ::Organization.create(
          login: login,
          billing_email: "#{login}@github.test.com",
          plan: plan,
          seats: 1000,
          admin: admin
        )

        unless org.valid? && org.persisted?
          raise Objects::CreateFailed, "Organization failed to create: #{org.errors.full_messages.to_sentence}\n#{org.inspect}"
        end

        team = org.teams.find_by(name: "Employees")
        team ||= T.must(Seeds::Objects::Team.create!(org: org, name: "Employees"))
        team.add_member(admin)
        GitHub::FeatureFlag.team_cache.clear
        org
      end
    end
  end
end
