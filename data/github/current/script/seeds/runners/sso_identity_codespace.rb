# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SsoIdentityCodespace < Seeds::Runner
      def self.help
        <<~HELP
        Creates SAML business and seeds external identities for enterprise codespace
        Seeding
        - Creates business (ghes-saml-azure)
        - Creates users and external identities for users in the seed data file
        - Creates organizations for each organization in the seed data file
        For GitHub Enterprise Server without SCIM seeding use --no_scim flag
        HELP
      end

      def self.run(options = {})
        data = Seeds::Objects::SsoIdentityCodespaceData.load

        Seeds::Objects::SsoIdentityCodespaceBusiness.update(data.businesses_data, no_scim: options[:no_scim])

        return if options[:no_scim]

        Seeds::Objects::SsoIdentityCodespaceUser.create(data.users_data, data)

        Seeds::Objects::SsoIdentityCodespaceOrganization.create(data.organizations_data, data)

        Seeds::Objects::SsoIdentityCodespaceExternalGroup.create(data.external_groups_data, data)

        puts "Done Seeding SSO data!"
      end
    end
  end
end
