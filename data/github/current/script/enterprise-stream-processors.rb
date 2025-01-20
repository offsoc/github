#!/usr/bin/env ruby
# frozen_string_literal: true

PROCESSOR_TYPES = [
  # Audit Logging
  "GitHub::StreamProcessors::Audit::EnterpriseDriftwoodProcessor",
  # Code scanning
  "GitHub::StreamProcessors::CodeScanningAlertEvent",
  "GitHub::StreamProcessors::CodeScanningProcessedAnalysis",
  # Secret scanning
  "GitHub::StreamProcessors::SecretScanning::AlertEventsProcessor",
  "GitHub::StreamProcessors::SecretScanningNotificationsProcessor",
  # Security Center
  "GitHub::StreamProcessors::SecurityCenterRepositoryUpdateProcessor",
  # Packages Consumers
  "GitHub::StreamProcessors::PackageVersionDownloadedProcessor",
  "GitHub::StreamProcessors::PackageRegistry::DownloadActivityProcessor",
  "GitHub::StreamProcessors::PackageRegistry::PackageTransferredProcessor",
  "GitHub::StreamProcessors::PackageRegistry::PackageVersionDeletedProcessor",
  "GitHub::StreamProcessors::PackageRegistry::PackageFilePublishedProcessor",

  "GitHub::StreamProcessors::PackageRegistry::PackageVersionRestoreMigrationProcessor",
  "GitHub::StreamProcessors::PackageRegistry::SyncV1PackageVersionDeleteToV2Processor",
  "GitHub::StreamProcessors::RegistryMetadata::VersionMigrationStatusProcessor",
  "GitHub::StreamProcessors::RegistryMetadata::MigrationDataSyncEventProcessor",
  "GitHub::StreamProcessors::PackageRegistry::PackageDeleteSyncProcessor",
  "GitHub::StreamProcessors::PackageRegistry::PackageRestoreMigrationProcessor",
  # Aqueduct Bridge
  "GitHub::StreamProcessors::AqueductHydroMessageBridge",
  # Actions Cache Usage
  "GitHub::StreamProcessors::ActionsCacheUsageProcessor",
  # Check Suite Status Change
  "GitHub::StreamProcessors::CheckSuiteStatusChangeProcessor",
  # Pull Request Review Submissions
  "GitHub::StreamProcessors::PullRequestReviewSubmitProcessor",
  # Pages deployment status reporter
  "GitHub::StreamProcessors::PagesDeploymentStatusProcessor",
  # Memex live updates processor
  "GitHub::StreamProcessors::MemexLiveUpdatesProcessor",
  # Memex events processor
  "GitHub::StreamProcessors::MemexEventsProcessor",
  # Job Execution Processor
  ("GitHub::StreamProcessors::EnterpriseServerActionsUsageProcessor" if GitHub.environment.fetch("ENTERPRISE_ENABLE_ACTIONS_USAGE_STATS", false) == "true"),
  # PATsV2 Processor
  "GitHub::StreamProcessors::ProgrammaticAccessProcessor",
  # Dependabot Alerts
  "GitHub::StreamProcessors::ProgressProcessor",
  "GitHub::StreamProcessors::DependabotAlerts::AlertingProgressProcessor",
  "GitHub::StreamProcessors::DependabotAlerts::VulnerableDependencyProcessor",
].compact

if __FILE__ == $0
  # Each processor requires at least one connection that will be held open for the lifetime
  # of the application.
  # The default pool size is 5 which is not enough to do this so we need to increase it.
  # Give each processor its own pool of 5 connections.
  # Set the pool size before the require_relative below.
  ENV["ENTERPRISE_MYSQL_POOL"] = (PROCESSOR_TYPES.length * 5).to_s
  ENV["DEVELOPMENT_MYSQL_POOL"] = (PROCESSOR_TYPES.length * 5).to_s

  require_relative "../config/environment"
  require "ruby_kafka_monkey_patch"

  GitHub.logger.warn "Starting Enterprise stream processesors in threaded mode..."

  # The sole purpose of this thread is to try and prevent any other thread from blocking the main process from exiting by catching the exeception that tells it to die.
  # It does this by itself being a naughty thread that doesn't exit when told to, and then hard-killing the entire process after 10 seconds.
  # https://bugs.ruby-lang.org/issues/13882
  shutdown_enforcer = Thread.new do # rubocop:disable GitHub/ThreadUse
    begin
      loop do
        sleep 1
      end
    ensure
      GitHub.logger.info "Allowing up to 60 seconds for cleanup of resources."
      blocking_threads = []
      60.times do
        blocking_threads = Thread.list.filter { |thread| thread != Thread.main && thread != Thread.current }
        if blocking_threads.empty?
          break
        end
        sleep 1
      end
      if blocking_threads.empty?
        GitHub.logger.info "All other threads exited gracefully."
      else
        GitHub.logger.error("Threads were blocking exit. Exiting hard now.", "thread.pool" => blocking_threads)
        exit!(false)
      end
    end
  end
  shutdown_enforcer.name = "shutdown_enforcer"

  # A signal handler to allow for manually getting the current state of all threads.
  Signal.trap(:USR2) do
    STDERR.puts "Manually initiated thread dump:"
    Thread.list.each do |thread|
      STDERR.puts "Thread ##{thread.object_id}"
      STDERR.puts thread.backtrace.join("\n")
    end
  end

  queue = Queue.new

  PROCESSOR_TYPES.map(&:constantize).each do |processor_type|
    thread = Thread.new do # rubocop:disable GitHub/ThreadUse
      Rails.application.executor.wrap do
        GitHub.logger.with_named_tags("code.namespace" => processor_type.name) do
          GitHub.logger.info("Thread running")
          processor = processor_type.new
          begin
            topic_checker_client = Kafka.new(seed_brokers: GitHub.environment.fetch("HYDRO_KAFKA_BROKERS", GitHub::Config::HydroConfig::DEVELOPMENT_BROKER).split(","))
            subscribe_to = Array(processor.options[:subscribe_to])
            GitHub.logger.with_named_tags("messaging.destination" => subscribe_to) do
              GitHub.logger.info("Waiting on topics")
              sleep 1.second while subscribe_to.flat_map { |pattern| topic_checker_client.topics.grep(pattern) }.empty?
              GitHub.logger.info("Topics found")
            end
          ensure
            topic_checker_client.close
          end
          GitHub.logger.info "Starting Executor"
          consumer = GitHub.hydro_consumer(processor.options)
          executor = Hydro::Executor.new(processor: processor, consumer: consumer)
          executor.run
          GitHub.logger.info "Leaving Executor for"
          # push an item on the queue stop the main thread
          queue.push(true)
        end
      end
    end
    thread.abort_on_exception = true
    thread.name = processor_type.name.demodulize
  end

  # wait for any thread to push an item on the queue
  queue.pop
end
