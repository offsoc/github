# frozen_string_literal: true

require "opentelemetry-sdk"
require "opentelemetry-exporter-otlp"
require "opentelemetry-instrumentation-action_pack"
require "opentelemetry-instrumentation-active_job"
require "opentelemetry-instrumentation-faraday"
require "opentelemetry-instrumentation-graphql"
require "opentelemetry-instrumentation-net_http"
require "opentelemetry-instrumentation-rack"
require "opentelemetry-instrumentation-rails"
require "opentelemetry-instrumentation-ruby_kafka"
require "opentelemetry-instrumentation-trilogy"

require_relative "telemetry/config"
require_relative "telemetry/logs"
require_relative "telemetry/rack"
require_relative "telemetry/request_id_provider"
require_relative "telemetry/resource"
require_relative "telemetry/sem_conv"
require_relative "telemetry/statsd"
require_relative "telemetry/traces"
require_relative "telemetry/version"
require_relative "telemetry/utils"

require_relative "telemetry/railtie" if defined?(Rails::Railtie)

module GitHub
  # Top module for this gem
  module Telemetry
    RACK_REQUEST_ID_HEADER = "HTTP_X_GITHUB_REQUEST_ID"
    HTTP_REQUEST_ID_HEADER = "X-GitHub-Request-Id"
    REQUEST_ID_BAGGAGE_KEY = HTTP_REQUEST_ID_HEADER
    SHUTDOWN_TIMEOUT_SECONDS = "GITHUB_TELEMETRY_SHUTDOWN_TIMEOUT_SECONDS"

    class Error < StandardError; end

    class << self
      # Provides an opinionated way to configure the global OpenTelemetry instance.
      # Notably, we apply the following defaults:
      #
      # - We configure a {https://open-telemetry.github.io/opentelemetry-ruby/opentelemetry-sdk/latest/OpenTelemetry/SDK/Trace/Export/BatchSpanProcessor.html BatchSpanProcessor} by default.
      # - We set span attribute/event/link limits to 256 (rather than the default of 128) unless you have specified these limits in the `ENV`.
      # - We configure the tracecontext (W3C trace context) in order to propagate traces.
      #
      # @example Basic configuration
      #   GitHub::Telemetry.configure
      #   # later on...
      #   GitHub::Telemetry.tracer.start_span
      #
      # @example Further customization directly with OpenTelemetry
      #   GitHub::Telemetry.configure do |c|
      #     c.use_all # Instructing OpenTelemetry to use all available auto-instrumentation
      #   end
      #
      # @example Disabling the span limit overrides
      #   # These variables can be found here:
      #   # https://open-telemetry.github.io/opentelemetry-ruby/opentelemetry-sdk/latest/OpenTelemetry/SDK/Trace/Config/SpanLimits.html#initialize-instance_method
      #   ENV["OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT"] = 128
      #   GitHub::Telemetry.configure(service_name: "my_service")
      #
      # @param telemetry_config [GitHub::Telemetry::Config]
      #   An optional parameter of OTel SDK and Logger configurations.
      # @yieldparam c [Object] An {https://open-telemetry.github.io/opentelemetry-ruby/opentelemetry-sdk/latest/OpenTelemetry/SDK/Configurator.html OpenTelemetry::Configurator}
      #   object, which can be used to further customize configuration.
      # @return [nil]
      def configure(telemetry_config = GitHub::Telemetry::Config.new)
        if telemetry_config.logger
          OpenTelemetry.error_handler = lambda do |exception:, message:|
            telemetry_config.logger.error(message, exception)
          end
        end

        OpenTelemetry::SDK.configure do |c|
          c.logger =  telemetry_config.logger if telemetry_config.logger
          c.resource = resources

          reporter = new_metrics_reporter(telemetry_config.statsd)
          exporter = telemetry_config.exporter || new_exporter(reporter)
          processor = new_span_processor(exporter, metrics_reporter: reporter)

          c.add_span_processor(processor)

          if telemetry_config.enable_span_event_log_exporter?
            require_relative "telemetry/traces/export/span_event_log_exporter"
            c.add_span_processor(
              new_span_processor(
                ::GitHub::Telemetry::Traces::Export::SpanEventLogExporter.new
              )
            )
          end

          yield c if block_given?

          c.use_all telemetry_config.instrumentations_to_install
        end

        apply_trace_config_overrides

        if telemetry_config.install_exit_handler?
          at_exit { GitHub::Telemetry.shutdown }
        end

        return nil
      end

      # Returns an {https://open-telemetry.github.io/opentelemetry-ruby/opentelemetry-api/latest/OpenTelemetry/Trace/Tracer.html OpenTelemetry::Trace::Tracer} instance.
      #
      # @example Using the configured tracer
      #   GitHub::Telemetry.tracer("my_service").in_span("span_name") do |span|
      #     do_things
      #   end
      #
      # @param name [String] If provided, the tracer returned will be configured with this name.
      #   If not provided, the tracer returned will be configured with the current global OpenTelemetry service.name.
      # @param version [String] If provided, the tracer returned will be configured with this version.
      #   If not provided, the tracer returned will be configured with the current global OpenTelemetry service.version.
      # @return [Object] An {https://open-telemetry.github.io/opentelemetry-ruby/opentelemetry-api/latest/OpenTelemetry/Trace/Tracer.html OpenTelemetry::Trace::Tracer} instance.
      def tracer(name = nil, version = nil)
        if name.nil? || version.nil?
          attributes = resources.attribute_enumerator.to_h
          name ||= attributes[OpenTelemetry::SemanticConventions::Resource::SERVICE_NAME]
          version ||= attributes[OpenTelemetry::SemanticConventions::Resource::SERVICE_VERSION]
        end

        OpenTelemetry.tracer_provider.tracer(name, version)
      end

      # @api private
      # @param statsd [Object] An optional instance/derived type of {https://github.com/Shopify/statsd-instrument/blob/master/lib/statsd/instrument/client.rb StatsD::Instrument::Client}
      #   or {https://github.com/DataDog/dogstatsd-ruby/blob/master/lib/datadog/statsd.rb Datadog::Statsd}
      #   If provided, the OpenTelemetry Exporters are initialized with a metrics reporter.
      # @return [OpenTelemetry::SDK::Trace::Export::MetricsReporter, nil] return a MetricsReporter or nil if the statsd library is not supported
      def new_metrics_reporter(statsd)
        return unless statsd

        if defined?(::Datadog::Statsd) && statsd.is_a?(::Datadog::Statsd)
          require_relative "telemetry/datadog"
          GitHub::Telemetry::Datadog::MetricsReporter.new(statsd: statsd)
        elsif defined?(::StatsD::Instrument) && statsd.is_a?(::StatsD::Instrument::Client)
          GitHub::Telemetry::Statsd::MetricsReporter.new(statsd: statsd)
        else
          return
        end
      end

      # @api private
      # Provides access to resource attributes.
      #
      # There are cases, e.g. logging, where the SDK is not initialized but the code needs access to at least the default resource attributes.
      #
      # @return OpenTelemetry::SDK::Resources::Resource attributes extracted from environment variables
      def resources
        @resources ||= GitHub::Telemetry::Resource.build
      end

      # @api private
      #
      # Used for tests
      # @return [nil]
      def reset_resources
        @resources = nil
        ::OpenTelemetry::SDK::Resources::Resource.instance_variable_set("@default", nil)
      end

      # EXPERIMENTAL: Attempts to gracefully flush and shutdown the underlying OpenTelemetry SDK
      #
      # @param [optional Numeric] timeout An optional timeout in seconds. Default is 5.
      # @return [nil]
      def shutdown(timeout: nil)
        return unless OpenTelemetry.tracer_provider.respond_to?(:shutdown)

        begin
          OpenTelemetry::Trace
            .current_span
            .add_event("shutdown")
            .finish
        rescue StandardError => e
          OpenTelemetry.handle_error(
            message: "shutdown: Failed to finish current span",
            exception: e
          )
        end

        begin
          timeout ||= Integer(ENV.fetch(SHUTDOWN_TIMEOUT_SECONDS, "5"))

          OpenTelemetry.tracer_provider.send(:shutdown, timeout: timeout)
        rescue StandardError => e
          OpenTelemetry.handle_error(
            message: "shutdown: Failed to shutdown OpenTelemetry SDK",
            exception: e
          )
        end
        nil
      end

      private

      def apply_trace_config_overrides
        %w[OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT
           OTEL_SPAN_EVENT_COUNT_LIMIT
           OTEL_SPAN_LINK_COUNT_LIMIT
           OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT
           OTEL_LINK_ATTRIBUTE_COUNT_LIMIT].each do |key|
          ENV[key] = ENV.fetch(key, "256")
        end

        # We are forced to override it here because by default the tracer provider uses a singleton object instance
        # https://github.com/open-telemetry/opentelemetry-ruby/blob/cf01d9a9927e33e308fcf63665763089166a402e/sdk/lib/opentelemetry/sdk/trace/tracer_provider.rb#L33
        if OpenTelemetry.tracer_provider.respond_to?(:span_limits)
          OpenTelemetry.tracer_provider.span_limits = OpenTelemetry::SDK::Trace::SpanLimits.new
        else
          OpenTelemetry.logger.warn "Span Limits are not supported by the current tracer provider"
        end
      end

      def new_exporter(reporter)
        if ENV["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"] || ENV["OTEL_EXPORTER_OTLP_ENDPOINT"]
          OpenTelemetry::Exporter::OTLP::Exporter.new(metrics_reporter: reporter)
        else
          OpenTelemetry::SDK::Trace::Export::InMemorySpanExporter.new(recording: false)
        end
      end

      def new_span_processor(exporter, metrics_reporter: nil)
        ::GitHub::Telemetry::Traces::Export::SpanProcessorFactory.new_span_processor(exporter, metrics_reporter: metrics_reporter)
      end

      def enable_trace_correlation
        ::GitHub::Telemetry::Logs.enable_trace_correlation
      end
    end
  end
end
