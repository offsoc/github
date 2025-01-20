# typed: true
# frozen_string_literal: true
# rubocop:disable GitHub/DoNotCallMethodsOnActiveRecordBase

require_relative "objects"
require "faker"
# Do not require anything else here. You can require new things in runners' run/objects' methods
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    RunnerError = Class.new(StandardError)
    GitHubServerError = Class.new(RunnerError)
    PendingMigrationsError = Class.new(RunnerError)

    class << self
      def run(_)
        raise NotImplementedError, "You must implement the run method in your runner"
      end

      def require_runners
        # Don't require above as these all require the Seeds::Runner class to be instantiated first
        Dir.glob(File.expand_path("../runners/*.rb", __FILE__)).each do |f|
          require_relative f
        end
      end

      def execute(options = {})
        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          setup unless ENV["NO_SETUP"].present?
          run(options)
        end
      end

      def allow_seeds?
        Rails.env.development? || Rails.env.test? || ENV["STAGING_LAB_ENVIRONMENT"].to_i.positive? || GitHub.enterprise?
      end

      def setup
        # Bring in the big environment
        require_relative "../../config/environment"
        unless allow_seeds?
          puts "[Fatal] This can only be run in the development environment!"
          failed!
        end

        # Run jobs inline for this script
        Rails.application.config.active_job.queue_adapter = :inline
        ensure_proper_setup!
        yield if block_given?
      rescue Objects::ObjectError => ex
        puts "[Fatal] Could not create an object. This might be because of broken code\n #{ex.message}"
      rescue GitRPC::ConnectionError => ex
        puts "[Fatal] Connecting to GitRPC failed. Is your GitHub server running?"
      end

      private

      def check_setup?
        !Rails.env.test? && !GitHub.enterprise?
      end

      def ensure_proper_setup!
        return unless check_setup?

        pending_migrations = ActiveRecord::Base.connection_pool.migration_context.open.pending_migrations
        if pending_migrations.any?
          puts "[Fatal] You have #{pending_migrations.size} pending #{pending_migrations.size > 1 ? 'migrations:' : 'migration:'}"
          pending_migrations.each do |pending_migration|
            puts "  %4d %s" % [pending_migration.version, pending_migration.name]
          end
          puts "[Info] Run `bin/rake db:migrate db:test:prepare` to update your databases then try again."
          failed!(PendingMigrationsError)
        end

        wait_for_server if ENV["WAIT_FOR_SERVER"]
        unless github_server_running?
          puts "[Fatal] Your server is not running. Please start it with ./script/server and try again."
          failed!(GitHubServerError)
        end
      end

      def failed!(error = StandardError)
        exit 1 unless Rails.env.test?
        raise error, "Failed"
      end

      def github_server_running?
        require "socket"
        s = TCPSocket.new "localhost", 8152
        true
      rescue Errno::ECONNREFUSED => ex
        puts "Failed to connect to GitRPC."
        false
      end

      def wait_for_server(timeout_seconds: 120)
        puts "Waiting for server..."
        start_time = Time.now
        while Time.now - start_time <= timeout_seconds
          break if github_server_running?
          sleep 1
        end
      end
    end
  end
end
