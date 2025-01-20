# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Resources
      class Packages
        class Migration
          include Enterprise::ConfigApply::Resources::MigrationEvents

          def initialize(apply:, migration_run_id:)
            @apply = apply
            @migration_run_id = migration_run_id
          end

          def command
            @cmd ||= Command.new(
              %{
                docker run
                  --network host
                  --entrypoint="./migratorctl"
                  "registry-metadata:#{image_tag}"
                  migrate
                  --host 127.0.0.1
                  --port 3307
                  --name github_enterprise
                  --user $MYSQL_USERNAME
                  --password $MYSQL_PASSWORD
                  --source "db/enterprise/migrations"
              }.gsub!(/[[:space:]]+/, " "),
              env_vars: {
                "MYSQL_USERNAME" => apply.mysql_username,
                "MYSQL_PASSWORD" => apply.mysql_password,
              },
              logger: logger,
            )
          end

          def add_to_migration_list
            write_db_migration_list("packages") if should_migrate?
          end

          def migrate
            unless should_migrate?
              Enterprise::ConfigApply.logger.info "Skipping packages migration"
              return
            end

            msg = "Performing packages database migrations."
            Enterprise::ConfigApply::PreflightPage.set_message(msg)

            apply.trace_event("configapply.packages.migration", description: msg) do
              run_packages_migrations
            end

            unless success?
              raise MigrationError, "Packages migration failed. See #{migration_log_dir}/packages.log for more information."
            end
          end

          def should_migrate?
            !!apply.raw_config.dig("app", "packages", "enabled")
          end

          def success?
            command.success?
          end

          private

          attr_reader :apply, :migration_run_id

          def run_packages_migrations
            command.on_stdout do |line|
              if line.include?("SchemaUpdated=true")
                Enterprise::ConfigApply.logger.info "Packages migration ran successfully"
              end
            end

            with_db_migration_events("packages") do
              command.run
            end
          end

          def image_tag
            File.read("/data/docker-image-tags/registry_metadata_image_tag").strip
          end

          def logger
            @logger ||= Enterprise::ConfigApply::Logger.new(
              Enterprise::ConfigApply.logger,
              "#{migration_log_dir}/packages.log"
            )
          end
        end
      end
    end
  end
end
