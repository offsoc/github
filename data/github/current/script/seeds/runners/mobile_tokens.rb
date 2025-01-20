# typed: true
# frozen_string_literal: true

require_relative "../runner"
require "securerandom"

module Seeds
  class Runner
    class MobileTokens < Seeds::Runner
      class << self
        def help
          <<~HELP
            Create and output Oauth access tokens for Android and iOS mobile applications
          HELP
        end

        def run(options = {})
          if options[:clean]
            ::OauthApplication.where(name: ["GitHub iOS", "GitHub Android"]).destroy_all
          end

          user = if options[:user]
            # Creates user only if the login doesn't exist
            Seeds::Objects::User.create(login: options[:user])
          else
            Seeds::Objects::User.monalisa
          end

          github = Seeds::Objects::Organization.github
          Seeds::Objects::Organization.trusted_oauth_apps_owner

          # All grantable scopes.
          scopes = ::Api::AccessControl.scopes.select { |_name, scope| scope.grantable? && scope.parent.nil? }.keys
          scopes = scopes.reject { |scope| scope == "site_admin" } if GitHub.enterprise? || user.gh_role != "staff"

          puts "Generating OAuth tokens to authorize as #{user.login} using a mobile device."
          puts

          {
            "Android" => ::Apps::Internal::Mobile::GITHUB_MOBILE_ANDROID_CLIENT_ID,
            "iOS" => ::Apps::Internal::Mobile::GITHUB_MOBILE_IOS_CLIENT_ID,
          }.each do |platform, client_id|
            app_name = "GitHub #{platform}"
            user_token = create_token(user, platform)
            hashed_token = T.unsafe(::OauthAccess).hash_token(user_token)

            unless (oauth_app = ::OauthApplication.find_by_key(client_id))
              oauth_app = ::OauthApplication.new(
                user: github,
                name: app_name,
                key: client_id,
                url: "http://github.localhost",
                callback_url: "github://com.github.#{platform.downcase}",
                domain: "github.com"
              )

              # Avoiding validation errors from non-standard callback_url.
              oauth_app.save!(validate: false)
            end

            unless (access = user.oauth_accesses.find_by_hashed_token(hashed_token))
              access = user.oauth_accesses.new(
                application: oauth_app,
                description: "Seeded dev mobile oauth token for #{platform} #{user_token}",
                scopes: ::OauthAccess.normalize_scopes(scopes, visibility: :all)
              )

              # Skipping validation because we manually update the new records values below.
              access.save!(validate: false)
            end

            if access
              update_args = {
                id: access.id,
                hashed_token: T.unsafe(::OauthAccess).hash_token(user_token),
                token_last_eight: user_token.last(8),
                expires_at_timestamp: 1.year.from_now.to_i
              }

              # Manual update to set a known token and long expiry.
              ActiveRecord::Base.connected_to(role: :writing) do
                OauthAccess.connection.update(Arel.sql(<<-SQL, **update_args))
                  UPDATE oauth_accesses
                  SET
                    hashed_token = :hashed_token,
                    token_last_eight = :token_last_eight,
                    updated_at = now(),
                    expires_at_timestamp = :expires_at_timestamp
                  WHERE id = :id
                SQL
              end

              puts "#{platform}:".ljust(11) + user_token
              puts
            end
          end

          puts "Please stop/restart the dev server to use these new tokens. ✨"
        end

        private

        def create_token(user, platform)
          token = if user.login == "monalisa"
            "gho_Mobile#{platform}DevToken#{("A"..).take(26).join}"
          else
            "gho_Mobile#{platform}DevToken#{SecureRandom.hex(26).upcase}"
          end.first(40)
        end
      end
    end
  end
end
