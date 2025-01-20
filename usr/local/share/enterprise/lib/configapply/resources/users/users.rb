# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Resources
      class Users
        class MissingEnterpriseOrgId < StandardError; end

        extend Forwardable

        def_delegators :@apply, :mysql

        def initialize(apply:)
          @apply = apply
        end

        def enterprise_org_id
          res = mysql.query("SELECT id FROM users WHERE login='github-enterprise' LIMIT 1")
          return res.first["id"] if res.count > 0

          raise MissingEnterpriseOrgId, "Could not find the enterprise org id"
        end

        class Migration
          extend Enterprise::ConfigApply::Resources::Decorators
          extend Forwardable

          def_delegators :@apply, :config_diff, :trace_event, :logger, :mysql

          attr_reader :apply

          def initialize(apply:)
            @apply = apply
          end

          instrument "configapply.migrations.users"
          run_on_upgrade
          def migrate
            set_ghost_user
            set_trusted_oauth_apps_owner

            # Catch for older installs that don't have the created_at fields populated
            mysql.query("UPDATE users SET created_at = NOW() WHERE login='ghost' AND created_at IS NULL LIMIT 1")
            mysql.query("UPDATE users SET created_at = NOW() WHERE login='github-enterprise' AND created_at IS NULL LIMIT 1")
            mysql.query("UPDATE email_roles SET created_at= NOW(),updated_at= NOW() WHERE role='primary'")

            # Catch for installs where email_roles has null created_at and updated_at values
            mysql.query("UPDATE email_roles SET created_at= NOW() where created_at='0000-00-00 00:00:00'")
            mysql.query("UPDATE email_roles SET updated_at= NOW() where updated_at='0000-00-00 00:00:00'")
          end

          instrument "configapply.users.migration.set_ghost_user"
          def set_ghost_user
            return if mysql.query("SELECT login from users where login='ghost'").count > 0

            mysql.query(%{
              INSERT IGNORE INTO users (login, display_login, plan, type, created_at)
              VALUES ("ghost", "ghost", "free", "User", NOW())
            })
          end

          instrument "configapply.users.migration.set_trusted_oauth_apps_owner"
          def set_trusted_oauth_apps_owner
            return if mysql.query("SELECT login from users where login='github-enterprise'").count > 0

            mysql.query(%{
              INSERT IGNORE INTO users (login, display_login, plan, type, organization_billing_email, created_at)
              VALUES ("github-enterprise", "github-enterprise", "free", "Organization", "ghost-org@github.com", NOW())
            })
          end

          run_when_config "expire-sessions", :changes, to: "true"
          instrument "configapply.migrations.expire_user_sessions"
          def expire_sessions
            apply.logger.info "Expiring user sessions that have been accessed in the last 2 weeks."

            # Deal with a change in authentication mode.
            mysql.query(%{
              UPDATE user_sessions
              SET revoked_at=NOW(), revoked_reason='authentication_switch'
              WHERE revoked_at IS NULL AND accessed_at > DATE_SUB(NOW(), INTERVAL 2 WEEK)
            })

            GheConfig.new.set_config("expire-sessions", "false")

            # Run the enterprise:disable_two_factor_requirement task if the
            # authentication mode has changed, in case the 2FA requirement on the
            # global business and orgs needs to be disabled.
            Command.new("/usr/local/bin/github-env bin/rake --trace enterprise:disable_two_factor_requirement").run!
          end
        end
      end
    end
  end
end
