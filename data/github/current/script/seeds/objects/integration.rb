# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Integration
      def self.create_slack_integration(
        owner: nil,
        integration_url: ENV.fetch("SLACK_INTEGRATION_URL", "http://localhost:4567"),
        force: ENV.fetch("FORCE", "false") == "true",
        print_app_info: ENV.fetch("SLACK_PRINT_APP_INFO", false) == "true",
        mt: ENV.fetch("MULTI_TENANT", "false") == "true"
      )
        if mt
          GitHub.multi_tenant_enterprise = true

          Objects::Organization.github

          GitHub::CurrentTenant.set Business.avocado_gmbh

          owner = Seeds::Objects::Organization.trusted_oauth_apps_owner
        else
          owner ||= Objects::Organization.github
        end

        integration = Apps::Internal.integration(:slack)
        if integration
          if force
            integration.destroy
          else
            return integration
          end
        end

        integration = Seeds::Objects::Integration.create(
          owner: owner,
          app_name: "slack",
          id: Apps::Internal::Slack::PRODUCTION[:id].call,
          permissions: Apps::Internal::Slack::PERMISSIONS,
          events: Apps::Internal::Slack::WEBHOOK_EVENTS,
          integration_url: integration_url,
          callback_path: [
            "/github/oauth/callback",
            "/github/v2/oauth/callback/both"
          ],
          webhook_path: "/github/events",
          setup_path: "/github/setup",
          user_token_expiration_enabled: false,
          install_automatically: false,
        )

        key = integration.generate_key(creator: owner)
        secret = integration.generate_client_secret(creator: owner)

        if print_app_info
          puts "APP_ID=#{integration.id}"
          puts "WEBHOOK_SECRET=#{integration.hook.secret}"
          puts "GITHUB_CLIENT_ID=#{integration.key}"
          puts "GITHUB_CLIENT_SECRET=#{secret.secret}"
          puts "PRIVATE_KEY=#{key.private_key.to_s.dump}"
        end

        integration
      end

      def self.create_msteams_integration(
        owner: nil,
        integration_url: ENV.fetch("TEAMS_INTEGRATION_URL", "http://localhost:4567"),
        force: ENV.fetch("FORCE", "false") == "true",
        print_app_info: ENV.fetch("TEAMS_PRINT_APP_INFO", false) == "true",
        mt: ENV.fetch("MULTI_TENANT", "false") == "true"
      )
        if mt
          GitHub.multi_tenant_enterprise = true

          Objects::Organization.github

          GitHub::CurrentTenant.set Business.avocado_gmbh

          owner = Seeds::Objects::Organization.trusted_oauth_apps_owner
        else
          owner ||= Objects::Organization.github
        end

        integration = Apps::Internal.integration(:msteams)
        if integration
          if force
            integration.destroy
          else
            return integration
          end
        end

        integration = Seeds::Objects::Integration.create(
          owner: owner,
          app_name: GitHub.msteams_github_app_name,
          id: Apps::Internal::Msteams::PRODUCTION[:id].call,
          permissions: Apps::Internal::Msteams::PERMISSIONS,
          events: Apps::Internal::Msteams::WEBHOOK_EVENTS,
          integration_url: integration_url,
          callback_path: [
            "/teams/github/oauth/callback",
            "/teams/github/oauth/callback/both",
          ],
          webhook_path: "/github/events",
          setup_path: "/teams/github/setup",
          user_token_expiration_enabled: false,
          install_automatically: false,
        )

        key = integration.generate_key(creator: owner)
        secret = integration.generate_client_secret(creator: owner)

        if print_app_info
          puts "TEAMS_APP_ID=#{integration.id}"
          puts "TEAMS_WEBHOOK_SECRET=#{integration.hook.secret}"
          puts "TEAMS_GITHUB_CLIENT_ID=#{integration.key}"
          puts "TEAMS_GITHUB_CLIENT_SECRET=#{secret.secret}"
          puts "TEAMS_PRIVATE_KEY=#{key.private_key.to_s.dump}"
        end

        integration
      end

      def self.create_chatops_unfurl_integration(
        owner: nil,
        integration_url: ENV.fetch("SLACK_INTEGRATION_URL", "http://localhost:4567"),
        force: ENV.fetch("FORCE", "false") == "true",
        mt: ENV.fetch("MULTI_TENANT", "false") == "true",
        print_app_info: ENV.fetch("SLACK_PRINT_APP_INFO", "false") == "true"
      )
        if mt
          GitHub.multi_tenant_enterprise = true

          GitHub::CurrentTenant.set Business.avocado_gmbh

          owner = Seeds::Objects::Organization.trusted_oauth_apps_owner
        else
          owner ||= Objects::Organization.github
        end

        integration = Apps::Internal.integration(:chatops_unfurl)
        if integration
          if force
            integration.destroy
          else
            return integration
          end
        end

        integration = Seeds::Objects::Integration.create(
          owner: owner,
          app_name: Apps::Internal::ChatopsUnfurl::APP_NAME,
          permissions: [],
          events: [],
          integration_url: integration_url,
          hook_attributes: {},
        )

        secret = integration.generate_client_secret(creator: owner)

        if print_app_info
          puts "UNFURL_APP_ID=#{integration.id}"
          puts "UNFURL_CLIENT_ID=#{integration.key}"
          puts "UNFURL_CLIENT_SECRET=#{secret.secret}"
        end

        integration
      end

      def self.create_team_sync_integration(
        owner: Objects::Organization.github,
        integration_url: ENV.fetch("TEAM_SYNC_INTEGRATION_URL", "http://example.com"),
        id: nil
      )
        integration = Apps::Internal.integration(:team_sync)
        if id.present? && integration.present? && integration.id != id
          raise Objects::CreateFailed, "Integration already existed with id #{integration.id}, which is not the supplied id #{id}"
        end
        return integration if integration

        Seeds::Objects::Integration.create(
          id: id,
          app_name: Apps::Internal::TeamSync::APP_NAME,
          owner: owner,
          permissions: default_permissions.merge({ "members" => :write }),
          integration_url: integration_url
        )
      end

      def self.create_code_scanning_integration(
        owner: Objects::Organization.trusted_oauth_apps_owner,
        integration_url: "https://github.com/features/security"
      )
        integration = Apps::Internal.integration(:code_scanning)
        return integration if integration.present?

        Seeds::Objects::Integration.create(
          app_name: Apps::Internal::CodeScanning::APP_NAME,
          owner: owner,
          integration_url: integration_url,
          skip_restrict_names_with_github_validation: true
        )
      end

      def self.create_og_image_integration(owner: Seeds::Objects::Organization.trusted_oauth_apps_owner)
        integration = Apps::Internal.integration(:opengraph)

        integration ||= Seeds::Objects::Integration.create(
          app_name: Apps::Internal::OpenGraph::APP_NAME,
          owner: owner,
          permissions: {},
          events: []
        )

        key = integration.generate_key(creator: owner)

        # write out these formatted like env variables, so these lines can just be
        # copied into the local .env file of custom-og-image
        puts "APP_ID=#{integration.id}"
        puts "PRIVATE_KEY=#{key.private_key.to_s.dump}"

        integration
      end

      def self.create(owner:, app_name:, **options)
        repo = options.fetch(:repo, [])
        id = options.fetch(:id, nil)

        permissions = options.fetch(:permissions, default_permissions)
        events = options.fetch(:events, default_events)

        integration_url = options.fetch(:integration_url, "http://localhost:4567")

        callback_path = options.fetch(:callback_path, "/github/callback")
        webhook_path = options.fetch(:webhook_path, "/github/events")
        setup_path = options.fetch(:setup_path, "/github/setup")

        skip_restrict_names_with_github_validation = options.fetch(:skip_restrict_names_with_github_validation, false)
        install_automatically = options.fetch(:install_automatically, true)
        user_token_expiration_enabled = options.fetch(:user_token_expiration_enabled, true)

        slug = app_name.parameterize

        integration = ::Integration.find_by(slug: slug)

        # Handle issues with integration alias
        if integration.nil? && (integration_alias = IntegrationAlias.find_by(slug: slug))
          integration = integration_alias.integration
          integration_alias.destroy if integration.nil?
        end

        # Make sure the owner of the integration we found is the id we specified.
        # If it isn't this means we have a conflict and we need to bail
        if id && integration_by_id = ::Integration.find_by(id: id)
          if integration_by_id != integration || integration_by_id.owner != owner
            raise Objects::CreateFailed, <<~EOF
            == What went wrong:
            Existing integration has the ID "#{integration&.id}"", the slug "#{integration&.slug}", and is owned by "#{integration&.owner}".
            Expecting integration to have ID #{id}, the slug #{slug}, and be owned by #{owner}.

            == How do I fix it?
            Make sure the ID, slug, and owner match the exiting integration, or choose a different option.
            EOF
          end
        end

        # Make sure the owner of the integration we found is the owner we specified.
        # If it isn't this means we have a conflict and we need to bail
        if integration && integration.owner != owner
          raise Objects::CreateFailed, <<~EOF
          == What went wrong:
          Existing integration has the slug #{slug}, but was not owned by #{owner}.
          It was owned by: #{integration.owner}.

          == How do I fix it?
          Choose a different slug or specify #{integration.owner} as the owner, not #{owner}
          EOF
        end

        installer = owner.is_a?(::Organization) ? owner.admins.first : owner
        if integration && install_automatically
          install(integration: integration, repo: repo, installer: installer, target: owner)
          return integration
        end

        # If we have integration associations already (from a previous integration), delete them
        if id
          ::ApplicationCallbackUrl.where(application_id: id, application_type: "Integration").delete_all
          ::IntegrationInstallation.where(integration_id: id).delete_all
          ::IntegrationInstallTrigger.where(integration_id: id).delete_all
          ::IntegrationKey.where(integration_id: id).delete_all
          ::IntegrationTransfer.where(integration_id: id).delete_all

          listings = ::IntegrationListing.where(integration_id: id)
          ::IntegrationListingFeature.where(integration_listing: listings).delete_all
          IntegrationListingLanguageName.where(integration_listing: listings).delete_all
          listings.delete_all

          requests = ::IntegrationInstallationRequest.where(integration_id: id)
          ::IntegrationInstallationRequestRepository.where(integration_installation_request: requests).delete_all
          requests.delete_all

          versions = ::IntegrationVersion.where(integration_id: id)
          ::IntegrationSingleFile.where(integration_version_id: versions.map(&:id)).delete_all
          ::IntegrationContentReference.where(integration_version: versions).delete_all
          versions.delete_all
        end

        hook_attributes = options.fetch(:hook_attributes, {
          url: File.join(integration_url, webhook_path),
          secret: "foo123",
          active: true,
        })

        callback_paths = Array(callback_path).map do |path|
          { url: File.join(integration_url, path) }
        end

        params = {
          owner: owner,
          name: app_name,
          slug: app_name.parameterize,
          url: integration_url,
          public: true,
          default_permissions: permissions,
          default_events: events,
          hook_attributes: hook_attributes,
          application_callback_urls_attributes: callback_paths,
          setup_url: File.join(integration_url, setup_path),
          skip_restrict_names_with_github_validation: skip_restrict_names_with_github_validation,
          user_token_expiration_enabled: user_token_expiration_enabled,
        }
        params[:id] = id if id

        # Make sure a bot is assigned if it exists already
        bot = ::Bot.find_by_slug(params[:slug])
        params[:bot] = bot if bot

        integration = ::Integration.create(params)
        raise Objects::CreateFailed, integration.errors.full_messages.to_sentence unless integration.persisted?

        if install_automatically
          install(integration: integration, repo: repo, installer: installer, target: owner)
        end

        integration
      end

      def self.default_events
        %w(pull_request check_suite check_run)
      end

      def self.default_permissions
        {
          "statuses" => :write,
          "contents" => :write,
          "pull_requests" => :write,
          "issues" => :write,
          "checks" => :write,
          "metadata" => :read,
        }
      end

      def self.install(integration:, repo:, target:, installer:)
        return if integration.installed_on?(target)
        result = integration.install_on(
          target,
          repositories: repo,
          installer: installer,
          version: integration.latest_version,
          entry_point: :seeds_objects_integrations_install
        )
        raise(Objects::CreateFailed, result.error) unless result.success?
        result.installation
      end
    end
  end
end
