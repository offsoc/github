# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ProximaThirdPartyApps < Seeds::Runner
      def self.help
        <<~EOF
        Create third-party GitHub and Oauth apps in multi-tenant environments
        that are owned by an integrator on Dotcom.
        EOF
      end

      def self.run(options = {})
        local_owner = Objects::Organization.proxima_third_party_apps_owner
        integration = Objects::Integration.create(
          owner: local_owner,
          app_name: "Third Party GitHub App"
        )
        oauth_app = Objects::OauthApplication.create(
          owner: local_owner,
          name: "Third Party OAuth App"
        )

        dotcom_owner = Objects::Organization.create(login: "canonical-dotcom-app-owner", admin: Objects::User.monalisa)

        [integration, oauth_app].each do |app|
          ::ProximaAppSynchronization.where(local_app: app, dotcom_global_id: app.global_relay_id).delete_all
          ::ProximaAppSynchronization.create(
            local_app: app,
            dotcom_global_id: app.global_relay_id,
            canonical_avatar_url: app.preferred_avatar_url
          )

          ::DotcomAppOwnerMetadata.where(local_app: app).delete_all
          ::DotcomAppOwnerMetadata.create(
            local_app: app,
            dotcom_id: dotcom_owner.id,
            dotcom_type: dotcom_owner.class.name,
            dotcom_node_id: dotcom_owner.global_relay_id,
            login: dotcom_owner.login,
            display_login: dotcom_owner.display_login,
            url: "https://github.com/#{dotcom_owner.to_param}",
            avatar_url: dotcom_owner.primary_avatar_url
          )
        end
      end
    end
  end
end
