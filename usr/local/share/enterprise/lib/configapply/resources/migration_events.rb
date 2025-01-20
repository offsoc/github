# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Resources
      module MigrationEvents
        def with_db_migration_events(migration_name)
          logger.info "Starting database migrations [name=#{migration_name} status=running]"
          start_time = Time.now

          event = {
            "version" => apply.release_version,
            "name" => migration_name,
            "event_version" => "v1"
          }

          write_db_migration_event(event.merge(
            "start_time" => start_time.utc.iso8601(3),
            "event_type" => "migrate_start"
          ))

          cmd = yield

          end_time = Time.now

          write_db_migration_event(event.merge(
            "end_time" => end_time.utc.iso8601(3),
            "event_type" => cmd.success? ? "migrate_end" : "migrate_error",
          ))

          status = cmd.success? ? "success" : "failed"
          elapsed = end_time - start_time

          write_db_migration_stats({
            "migration_run_id" => migration_run_id,
            "release_version" => apply.release_version,
            "name" => migration_name,
            "exitcode" => cmd.exitstatus,
            "duration" => elapsed
          })

          logger.info "Completed database migrations [name=#{migration_name} status=#{status} exitcode=#{cmd.exitstatus} elapsed=#{elapsed}s]"
        end

        def logger
          Enterprise::ConfigApply.logger
        end

        def migration_log_dir
          @migration_log_dir ||= build_migration_log_dir(apply, migration_run_id)
        end

        def write_db_migration_list(migration_name)
          File.open("#{migration_log_dir}/migrations-list.txt", "a") do |file|
            file.puts(migration_name)
          end
        end

        def write_db_migration_event(event)
          File.open("#{migration_log_dir}/group-migration-events.json", "a") do |file|
            file.puts(event.to_json)
          end
        end

        def write_db_migration_stats(stats)
          File.open("#{migration_log_dir}/migrations.json", "a") do |file|
            file.puts(stats.to_json)
          end
        end

        def need_schema_update?
          !!@need_schema_update
        end

        module_function

        def build_migration_log_dir(apply, migration_run_id)
          "/var/log/dbmigration/#{apply.release_version}/#{migration_run_id}"
        end
      end
    end
  end
end
