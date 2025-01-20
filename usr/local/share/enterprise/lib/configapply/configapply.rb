# frozen_string_literal: true

require "digest"
require "openssl"
require "erb"
require "fileutils"
require "resolv"
require "json"
require "net/http"
require "optparse"
require "set"
require "socket"
require "time"
require "timeout"
require "pathname"
require "open3"
require "/data/enterprise-manage/current/lib/ghe-config"
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "mysql2"
require "securerandom"
require "forwardable"

# Require all Ruby files under ./configapply/, providing the ConfigApply module
dir_glob = File.expand_path(File.join("..", "**", "*.rb"), __FILE__)
Dir[dir_glob].reject { |f| f =~ /configapply.rb/ }.sort.each { |f| require f }

# Status file
STATUS_FILE = '/data/user/config-apply/status.json'.freeze

module Enterprise
  # Enterprise::ConfigApply is the meat of the `ghe-config-apply` command.  Previously,
  # all these methods were defined at the top level of `config.rb`.
  # As a result, the methods of ConfigApply still pull data from global
  # constants in `config.rb` and various files on disk.
  module ConfigApply
    extend self
    attr_accessor :logger, :event_logger

    ISO8601_FORMAT = "%Y-%m-%dT%H:%M:%S%z"

    file_logger = Enterprise::ConfigApply::Logger.new(ENV.fetch('LOGFILE', STDOUT), level: ::Logger::Severity::INFO)
    console_logger = Enterprise::ConfigApply::Logger.new(STDERR, level: ::Logger::Severity::WARN)

    self.logger = Enterprise::ConfigApply::Logger.new(file_logger, console_logger)
    self.event_logger = Enterprise::ConfigApply::EventLogger.new

    # Run includes all sub-modules of ConfigApply to unify them into the same
    # namespace.
    # The primary way to invoke this is `Enterprise::ConfigApply::Run.main`
    class Run
      include Enterprise::ConfigApply::Actions
      include Enterprise::ConfigApply::Alambic
      include Enterprise::ConfigApply::AutoUpdateCheck
      include Enterprise::ConfigApply::Budgets
      include Enterprise::ConfigApply::Cluster
      include Enterprise::ConfigApply::CodeScanning
      include Enterprise::ConfigApply::ConfigDiff
      include Enterprise::ConfigApply::ConfigFiles
      include Enterprise::ConfigApply::Consul
      include Enterprise::ConfigApply::Checks
      include Enterprise::ConfigApply::Dependabot
      include Enterprise::ConfigApply::DependencyGraph
      include Enterprise::ConfigApply::Driftwood
      include Enterprise::ConfigApply::Elasticsearch
      include Enterprise::ConfigApply::Eap
      include Enterprise::ConfigApply::ExternalMySQL
      include Enterprise::ConfigApply::Deprecated
      include Enterprise::ConfigApply::FileServers
      include Enterprise::ConfigApply::Firewall
      include Enterprise::ConfigApply::GitRPCd
      include Enterprise::ConfigApply::HAProxy
      include Enterprise::ConfigApply::HighAvailability
      include Enterprise::ConfigApply::Http2Hydro
      include Enterprise::ConfigApply::Instrumentation
      include Enterprise::ConfigApply::Lariat
      include Enterprise::ConfigApply::LocalStorage
      include Enterprise::ConfigApply::ExportMigrations
      include Enterprise::ConfigApply::Migrations
      include Enterprise::ConfigApply::Minio
      include Enterprise::ConfigApply::ModeHelpers
      include Enterprise::ConfigApply::MySQL
      include Enterprise::ConfigApply::Nes
      include Enterprise::ConfigApply::NodeIPs
      include Enterprise::ConfigApply::NodeRoles
      include Enterprise::ConfigApply::Orchestrator
      include Enterprise::ConfigApply::ClusterRebalance
      include Enterprise::ConfigApply::Nomad
      include Enterprise::ConfigApply::Packages
      include Enterprise::ConfigApply::Pages
      include Enterprise::ConfigApply::PhaseAppServices
      include Enterprise::ConfigApply::PhaseHelpers
      include Enterprise::ConfigApply::PhaseMigrations
      include Enterprise::ConfigApply::PhaseSystemServices
      include Enterprise::ConfigApply::PhaseValidation
      include Enterprise::ConfigApply::Postfix
      include Enterprise::ConfigApply::PtArchiver
      include Enterprise::ConfigApply::Redis
      include Enterprise::ConfigApply::Resque
      include Enterprise::ConfigApply::Chatops
      include Enterprise::ConfigApply::SecretScanning
      include Enterprise::ConfigApply::ServiceState
      include Enterprise::ConfigApply::Spokesd
      include Enterprise::ConfigApply::Status
      include Enterprise::ConfigApply::Ernicorn
      include Enterprise::ConfigApply::SystemSize
      include Enterprise::ConfigApply::Telegraf
      include Enterprise::ConfigApply::ViewHelpers
      include Enterprise::ConfigApply::WriteLogs
      include Enterprise::ConfigApply::HookshotGo
      include Enterprise::ConfigApply::Validate
      include Enterprise::ConfigApply::Prometheus
      include Enterprise::ConfigApply::NUMA
      include Enterprise::ConfigApply::SecurityConfigurations

      extend Forwardable
      def_delegators "Enterprise::ConfigApply", :logger, :event_logger

      attr_accessor :mysql

      # main is the primary entrypoint to support `ghe-config-apply`,
      # and can be run as `Enterprise::ConfigApply::Run.new.main`.
      #
      # Formerly #main was a top-level method in `config.rb` and
      # called by `update-system-config`.  That script still calls
      # the #main method in config.rb, which proxies to this after
      # creating a `Enterprise::ConfigApply::Run` object first.
      #
      # Configuration is applied in 4 phases:
      #   1. base system services configuration
      #   2. data migrations
      #   3. application services configuration
      #   4. validate services (warning on failure)
      #
      # Running config-apply with phase 0 means run all phases.
      # Running phase "0" does not run any config updates but resets the config-apply status.
      # Running phase "4" does validation only.
      #
      # For single node, config-apply always does a phase 0 run (all phases after each other),
      # but for clustering we need to wait for each node to complete a phase before continuing
      # with the next, for example because otherwise some services might not be fully started
      # on other cluster nodes.
      def main
        OptionParser.new do |o|
          # Leaving this here as a placeholder for future arguments/flags.
        end.parse!

        ["github", "secrets"].each do |scope|
          if Enterprise::ConfigApply::ConfigDiff.latest_archive_file("#{scope}").nil?
            logger.info "Latest config apply archive of the #{scope}.conf file does not exist"
            ENV["GHE_CONFIG_APPLY_FORCE"] = "1"
          end
        end

        # Lightweight config apply is behind a feature flag in GHES 3.15.
        # When it becomes GA, this checking is no longer required.
        if !!raw_config.dig("config-apply", "lightweight", "enabled")
          unless ENV.fetch("GHE_CONFIG_APPLY_FORCE", "").empty?
            logger.info "Config Apply is running in force mode."
          end
        end

        self.mysql = Resources::MySQL.new(apply: self)

        @service_sockets = Set.new
        @failures = {}

        # "phases" is a mixed-in method that returns a Phases object (a collection of 1 or 4 Phase objects)
        phases.each do |phase|
          # This is where the root span for each phase is generated, IE:
          # We put it here instead of in the calling config.rb since it's only
          # here where we have all of the Modules mixed in
          attributes = {
            "description" => phase.description,
            "phase" => phase.number.to_i,
          }
          trace_event("#{phase.span_name}", attributes) do |span|
            run_config_phase(phase.run_method)
          end
        end

        run_description = phases.single_phase? ? "Config apply run: phase #{phases.number}" : "Config apply run: all phases"
        log_time(run_description, T0)

        if @failures.empty?
          if phases.numbers.include?(3)
            log_status "Reloading application services", :done
          end

          if phases.number == 3 && cluster_rebalance_enabled?
            current_span.add_event("force cluster-rebalance job")
            system_log("nomad job periodic force cluster-rebalance")
          end

          FileUtils.touch("/var/log/ghe-configuration/enterprise_success.log")
          logger.warn "Done!"
        else
          if phases.numbers.include?(3)
            log_status "Reloading application services", :failed
          elsif phases.number == 1
            log_status "Reloading system services", :failed
          elsif phases.number == 2
            log_status "Running migrations", :failed
          end
          failure_msg = "some failures occurred:\n#{JSON.pretty_generate(@failures)}"
          exit_status = 1
          exception = ConfigApplyException.new(failure_msg, exit_status: exit_status)
          current_span.record_exception(exception, attributes: { "exit_status" => exit_status})
          raise exception
        end

      end # main method

      def run_config_phase(method)
        self.public_send("#{method}")
      rescue => e
        current_span.status = OpenTelemetry::Trace::Status.error(e.message)
        exit_status = e.respond_to?(:exit_status) ? e.exit_status : 1
        current_span.record_exception(e, attributes: { "exit_status" => exit_status })
        raise ConfigApplyException.new(e.message, exit_status: exit_status)
      end

      # Phase 0
      # This is not a phase per se — it only gets called directly by
      # ghe-single-config-apply --setup-status
      def run_phase_setup
        reset_status
      end

      # Phase 1
      def run_phase_system_services
        reset_status

        if es_need_to_backup_old_data?
          instrument_call("es_backup_old_data!", "Backing up old Elasticsearch data")
          current_span.add_event("Touch /data/user/elasticsearch/.cluster file")
          FileUtils.touch("/data/user/elasticsearch/.cluster")
        end

        @changed_app_services = config_phase_system_services

        current_span.add_event("Writing to /tmp/changed_app_services file")
        FileUtils.rm_rf("/tmp/changed_app_services")
        File.open("/tmp/changed_app_services", "w") do |f|
          f.write(JSON.dump(@changed_app_services))
        end

        enable_enterprise_target
      end

      # Phase 2
      def run_phase_migrations
        enable_enterprise_target
        config_phase_migrations
      end

      # Phase 3
      def run_phase_application_services
        enable_enterprise_target
        config_phase_app_services(get_changed_app_services)
      ensure
        FileUtils.rm_rf("/tmp/changed_app_services")
      end

      # Phase 4
      def run_phase_validation
        enable_enterprise_target
        config_phase_validation
      end

      # Called by phase 2
      # If phase 1 is run, then @changed_app_services is set (and written to disk) there
      def get_changed_app_services
        @changed_app_services || JSON.parse(File.read("/tmp/changed_app_services"))
      rescue Errno::ENOENT, JSON::ParserError
        []
      end

      def enable_enterprise_target
        current_span.add_event("enabling github-enterprise.target")
        system_log("/bin/systemctl enable github-enterprise.target")
      end
    end # Run class
  end # ConfigApply module
end # Enterprise module
