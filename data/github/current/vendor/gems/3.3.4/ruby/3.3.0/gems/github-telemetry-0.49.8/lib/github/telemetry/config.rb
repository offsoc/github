# frozen_string_literal: true

module GitHub
  module Telemetry
    # Encapsulates configuration for the GitHub::Telemetry library.
    # There are several options that can be configured, but the defaults should be sufficient for most use cases.
    # All Boolean options default to `true`, and all other options default to `nil` or an empty Enumerable.
    #
    # @!attribute [rw] enable_rack_github_request_id
    #  @return [Boolean] Whether or not to enable the Rack middleware that sets the `X-GitHub-Request-Id` header.
    # @!attribute [rw] enable_span_event_log_exporter
    #  @return [Boolean] Whether or not to enable the span event log exporter.
    # @!attribute [rw] install_exit_handler
    #  @return [Boolean] Whether or not to install an exit handler that will shutdown the Global Tracer Provider.
    # @!attribute [rw] instrumentation
    #  @return [Hash] A hash of instrumentation class names to configuration options defaults and any overrides.
    # @!attribute [rw] exporter
    #  @return [OpenTelemetry::SDK::Trace::Export::SpanExporter] The exporter to use for spans. (Advanced configuration option)
    # @!attribute [rw] statsd
    #  @return [Datadog::Statsd|Statsd::Instrument] The statsd client to use for metrics.
    # @!attribute [rw] logger
    #  @return [SemanticLogger::Logger] The logger to use for SDK diagnostic ouput.
    # @!attribute [r] logs
    #  @return [GitHub::Telemetry::Config::Logs] The configuration for Rails log subscriber instrumentation.
    #
    # @example Overriding the default configuration
    #  config = GitHub::Telemetry::Config.new(
    #   statsd: Datadog::Statsd.new('localhost', 8125),
    #   exporter: OpenTelemetry::SDK::Trace::Export::InMemorySpanExporter.new(recording: true),
    #   enable_span_event_log_exporter: false,
    #   install_exit_handler: false
    #  )
    #  GitHub::Telemetry.configure(config)
    #
    # @example Disable ActiveJob log subscriber
    #   # config/initializers/github_telemetry.rb
    #   config.logs.active_job.enabled = false
    class Config
      INSTRUMENTATION_DEFAULTS = {
        "OpenTelemetry::Instrumentation::Rack" => {
          record_frontend_span: false,
          untraced_endpoints: [
            "/status", # LBCheck-GLB
            "/_ping", # Kubernetes probe
            "/_chatops", # Hubot polling for latest chatops
          ],
          use_rack_events: true,
        },
        "OpenTelemetry::Instrumentation::ActiveJob" => {
          force_flush: true,
          span_naming: :queue,
          propagation_style: :child,
        },
        "OpenTelemetry::Instrumentation::ActionPack" => {},
        "OpenTelemetry::Instrumentation::ActiveRecord" => {},
        "OpenTelemetry::Instrumentation::ActionView" => {},
        "OpenTelemetry::Instrumentation::Dalli" => { db_statement: :obfuscate },
        "OpenTelemetry::Instrumentation::Ethon" => {},
        "OpenTelemetry::Instrumentation::Excon" => {},
        "OpenTelemetry::Instrumentation::Faraday" => { span_kind: :internal},
        "OpenTelemetry::Instrumentation::Graphql" => {},
        "OpenTelemetry::Instrumentation::PG" => { db_statement: :obfuscate },
        "OpenTelemetry::Instrumentation::Net::HTTP" => {},
        "OpenTelemetry::Instrumentation::Rails" => {},
        "OpenTelemetry::Instrumentation::Redis" => { db_statement: :obfuscate },
        "OpenTelemetry::Instrumentation::Mysql2" => { db_statement: :obfuscate },
        "OpenTelemetry::Instrumentation::Trilogy" => { db_statement: :obfuscate },
      }.freeze

      class Base
        attr_writer :enabled

        def initialize(enabled: false)
          @enabled = (enabled == true)
        end

        def enabled?
          @enabled == true
        end
      end

      # Encapsulates Rails log subscriber configurations
      # @!attribute [r] active_job
      #  @return [GitHub::Telemetry::Config::Base] The configuration for the ActiveJob log subscriber.
      class Logs
        attr_reader :active_job

        def initialize
          @active_job = Base.new
        end
      end

      attr_accessor :instrumentation, :exporter, :statsd, :logger
      attr_reader :logs
      attr_writer :enable_rack_github_request_id, :enable_span_event_log_exporter, :install_exit_handler

      def initialize(
        enable_span_event_log_exporter: true,
        enable_rack_github_request_id: true,
        instrumentation: {},
        logger: nil,
        statsd: nil,
        exporter: nil,
        install_exit_handler: true
      )
        @enable_span_event_log_exporter = enable_span_event_log_exporter
        @enable_rack_github_request_id = enable_rack_github_request_id
        @instrumentation = instrumentation
        @logger = logger
        @statsd = statsd
        @exporter = exporter
        @install_exit_handler = install_exit_handler == true
        @logs = Logs.new
      end

      def enable_rack_github_request_id?
        @enable_rack_github_request_id == true
      end

      def enable_span_event_log_exporter?
        @enable_span_event_log_exporter == true
      end

      def install_exit_handler?
        @install_exit_handler == true
      end

      def instrumentations_to_install
        INSTRUMENTATION_DEFAULTS.each_with_object(instrumentation) do |(i_name, i_opts), accum|
          accum[i_name] = i_opts.merge(instrumentation.fetch(i_name, {}))
        end
      end
    end
  end
end
