# typed: false
# frozen_string_literal: true
namespace :ghes do
  # Output a list of migrations that have been run and those that have not been run as JSON
  # This is the same format as the output of `db:migrate:status`
  task :migration_status => Rake::Task["db:load_config"] do
    statuses = ActiveRecord::Tasks::DatabaseTasks.migration_connection_pool.migration_context.migrations_status
    result = GitHub::GHES::Stats.create_structured_list_of_migration_statuses(statuses)
    output = File.open(ENV.fetch("MIGRATION_LISTS_FILE", "/dev/stdout"), "w")
    GitHub::GHES::Stats::EventWriter.new(output).write(result)
  end
end
