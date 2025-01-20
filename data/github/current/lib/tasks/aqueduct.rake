# frozen_string_literal: true

require "github/aqueduct/resque_import"
require "github/aqueduct/timed_resque_import"

namespace :aqueduct do
  task :reset do #=> :environment do
    abort "aqueduct:reset is for development only!" unless Rails.env.development?

    %x(curl -s localhost:18081/admin/health)
    if $? == 0
      # echo the magic word, but since this doesn't capture it, re-run the command with %x too
      cmd = "curl -s -X POST localhost:18081/admin/reset | jq -r .magic_word"
      sh cmd
      magic_word = %x(#{cmd}).strip
      sh "curl -s -d magic_word=#{magic_word} localhost:18081/admin/reset"
    else
      puts "aqueduct-lite not running, can't reset"
    end
  end

  task import_resque_jobs: :environment do
    import_resque_jobs

    import_timed_resque_jobs
  end

  def import_resque_jobs
    imported = GitHub::Aqueduct::Import.run

    if imported.any?
      puts "\nResque import summary:"
      imported.sort.each do |queue, count|
        puts "#{queue}: #{count} job(s)"
      end
    end
  end

  def import_timed_resque_jobs
    result = GitHub::Aqueduct::TimedResqueImport.new(dry_run: false).run

    if result.general_failure? || (result.successes_count + result.failures_count) > 0
      puts "\nTimed resque import summary:"

      if result.general_failure?
        puts "There was an error (#{result.general_failure.class.name}: #{result.general_failure.message}) running the import - not all jobs were attempted to be imported."
        puts result.general_failure.backtrace
        puts ""
        puts ""
      end

      puts "Successfully imported: #{result.successes_count}"
      puts "Failed to import: #{result.failures_count}"

      if result.failures_count > 0
        puts "Failure details:"

        result.failures.group_by(&:category).each do |category, jobs|
          puts "- #{category}"
          jobs.each do |job|
            puts "  - #{job.guid}, #{job.schedule_at}"
          end
        end
      end
    end
  end
end
