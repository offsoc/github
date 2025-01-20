# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Resources
      class MySQL
        class QueryFailedError < StandardError; end

        extend Enterprise::ConfigApply::Resources::Decorators
        extend Forwardable

        SCHEMA_MIGRATION_CHECK_MAX_ATTEMPTS = 30

        attr_reader :apply

        def_delegators :@apply, :config_diff, :trace_event, :logger

        def initialize(apply:)
          @apply = apply
        end

        def client
          @client ||= ::Mysql2::Client.new(
            host:     "127.0.0.1",
            port:     3307,
            database: "github_enterprise",
            username: apply.mysql_username,
            password: apply.mysql_password,
          )
        end

        def query(query)
          retries ||= 0
          client.query(query)
        rescue ::Mysql2::Error::ConnectionError => e
          # Attempting to reconnect to the MySQL by nullifying the memoized client.
          @client = nil
          retry if (retries += 1) < 2

          apply.logger.error "Failed to run MySQL query: #{query}. Error: #{e}"
          raise QueryFailedError, e
        rescue ::Mysql2::Error => e
          apply.logger.error "Failed to run MySQL query: #{query}. Error: #{e}"
          raise QueryFailedError, e
        end

        # Reseed the MySQL database from /data/github/shared/seed.sql if the schema_migrations table is missing.
        def reseed
          reseed_database unless schema_migrations_exist?
        end

        instrument "configapply.migrations.mysql.reseed_database_check"
        def schema_migrations_exist?(delay: 1)
          # Multiple retries are essential because the MySQL service may not be ready when this method is called.
          # https://github.com/github/enterprise-releases/issues/2235
          SCHEMA_MIGRATION_CHECK_MAX_ATTEMPTS.times do |i|
            begin
              return query("SHOW TABLES LIKE 'schema_migrations'").count > 0
            rescue QueryFailedError
              if i == SCHEMA_MIGRATION_CHECK_MAX_ATTEMPTS - 1
                raise QueryFailedError, "Failed to access 'schema_migrations'"
              end
            end

            sleep(delay)
          end

          return false
        end

        instrument "configapply.migrations.mysql.reseed_database"
        def reseed_database
          apply.logger.info "Re-seeding MySQL database"
          Command.new(%{/usr/local/share/enterprise/github-mysql -f "/data/github/shared/seed.sql"}).run!
        end
      end
    end
  end
end
