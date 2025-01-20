# frozen_string_literal: true

require_relative "../migration_events"
require_relative "../decorators"

module Enterprise
  module ConfigApply
    module Resources
      class GHESManage
        class Migration
          include Enterprise::ConfigApply::Resources::MigrationEvents
          extend Enterprise::ConfigApply::Resources::Decorators
          extend Forwardable

          def_delegators :apply, :config_diff, :trace_event
          def_delegators :command, :success?

          attr_reader :apply, :migration_run_id

          def initialize(apply:, migration_run_id:)
            @apply = apply
            @migration_run_id = migration_run_id
          end

          run_on_upgrade
          instrument "configapply.migrations.ghes_manage"
          def migrate
            Enterprise::ConfigApply::PreflightPage.set_message("Performing GHES Manage migrations")

            with_db_migration_events("ghes-manage-api") do
              # Do not fail the migration phase if ghes manage migrations fail
              command.run
            end

            unless success?
              logger.error("GHES Manage migration failed")
            end
          end

          def command
            @cmd ||= Command.new(
              "/usr/local/share/enterprise/ghes-manage -migrate",
              env_vars: {
                "ENTERPRISE_DB_USER" => apply.mysql_username,
                "ENTERPRISE_DB_PASS" => apply.mysql_password,
                "ENTERPRISE_DB_PORT" => "3307",
                "ENTERPRISE_DB_HOST" => "localhost",
              },
              logger: logger,
            )
          end

          run_on_upgrade
          def add_to_migration_list
            write_db_migration_list("ghes-manage-api")
          end

          private

          def logger
            @logger ||= Enterprise::ConfigApply::Logger.new(
              Enterprise::ConfigApply.logger,
              "#{migration_log_dir}/ghes-manage-api.log"
            )
          end
        end
      end
    end
  end
end
