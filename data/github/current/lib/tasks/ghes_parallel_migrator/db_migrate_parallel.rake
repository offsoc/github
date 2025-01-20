# frozen_string_literal: true

# db:migrate:parallel is a GHES specific rake task that will be used to run database migrations in parallel to speed up customer upgrade times.
# This works by digesting a file in the GHES project containing metadata about all GitHub monolith migrations and what tables they affect in the database.
# When this job is run we read the metadata file contents in and build a relationship tree which will be used to control the order in which migrations are run.
# The tree is then traversed and migrations are run in parallel as long as their dependencies are met. If a migration has unmet dependencies it will be skipped and retried later.
# This job will run until all migrations are in an "up" state according to active record.

require "instruction_serializer"
require "ghes_parallel_migrator"

namespace :db do
  namespace :migrate do
    task parallel: :load_config do
      puts "Running db:migrate:parallel"
      ActiveRecord::Base.logger.level = Logger::INFO
      migration_metadata_file = ENV["MIGRATION_METADATA_FILE_PATH"]
      worker_count = ENV["ENTERPRISE_NUM_PARALLEL_DATABASE_MIGRATION_WORKERS"].to_i

      raise "ENTERPRISE_NUM_PARALLEL_DATABASE_MIGRATION_WORKERS environment variable is required" if worker_count.nil?
      raise "MIGRATION_METADATA_FILE_PATH environment variable must be set" if migration_metadata_file.nil?
      raise "ENTERPRISE_MYSQL_ADVISORY_LOCKS environment variable must be set to false to run migration in parallel" if ENV["ENTERPRISE_MYSQL_ADVISORY_LOCKS"] != "false"
      raise "ENTERPRISE_NUM_PARALLEL_DATABASE_MIGRATION_WORKERS must be greater than 0" if worker_count <= 0

      debug = false
      if ENV["DEBUG"] && %w[true TRUE 1].include?(ENV["DEBUG"])
        debug = true
      end

      metadata_json = JSON.parse(File.read(migration_metadata_file))

      begin
        GHES::DB::ParallelMigrator.run(metadata_json, worker_count, debug)
      rescue => e
        abort "Error running db:migrate:parallel: #{e.message}"
      end

      puts "db:migrate:parallel complete"
    end

    # this rake task is intended to be run to gather metadata about all migrations/transitions
    # in a "down" state -- note that the QUERY_ANALYZER_SUB environmental variable is needed in
    # the environment of rake to provoke the subscription to "sql.active_record" in the QueryDuplicator
    # initializer
    task profile: :load_config do
      # Build a map from the current state of the migrations
      migration_context = ActiveRecord::MigrationContext.new(Rails.root.join("db", "migrate"))
      migrations = migration_context.migrations_status

      # create an array of all Rails migrations
      migration_files = Dir[Rails.root.join("db", "migrate", "*.rb")]

      # build an array of down migrations
      down_migrations = []
      migrations.each do |migration|
        if migration[0] == "down"
          down_migrations.push(migration[1].to_i)
        end
      end

      # try to find
      migration_to_file = {}
      down_migrations.each do |migration|
        res = migration_files.select { |f| f =~ /#{migration}_.*\.rb$/ }
        if res.length != 1
          raise "Error: found #{res.length} files for migration #{migration}"
        end
        migration_to_file[migration] = { "file" => res[0], "is_transition" => false }

        File::open(res[0]) { |file|
          unless file.grep(/GitHub::Transition/).empty?
            migration_to_file[migration]["is_transition"] = true
          end
        }
      end

      migration_to_file.each do |migration_id, _migration_data|
        ENV["TRANSITION_ID"] = migration_id.to_s
        puts "Running migration #{migration_id}"
        migration_context.run(:up, migration_id)
      end
      ENV.delete("TRANSITION_ID")

      flush = 0 # yes, do flush
      flush_url = ENV["FLUSH_URL"] || "http://localhost:8081/agent/v1/shutdown?flush=#{flush}"

      command = "curl --silent --show-error --output /dev/null -H \"Connection: close\" #{flush_url}"

      max_attempts = 10
      attempts = 0

      begin
        attempts += 1
        # Execute the command
        success = system(command)

        unless success
          raise "Flush failed on attempt #{attempts}"
        end

      rescue => e
        puts "#{e.message}"
        sleep 1 # Sleep for 1 second before retrying

        retry if attempts < max_attempts
      end

      if success
        puts "Flush executed successfully after #{attempts} attempts."
      else
        puts "Failed to execute flush after #{max_attempts} attempts."
      end

    end
  end
end
