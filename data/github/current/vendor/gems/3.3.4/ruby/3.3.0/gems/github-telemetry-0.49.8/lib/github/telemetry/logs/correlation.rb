# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      # Adds trace context correlation to log lines as named tags
      class Correlation
        EMPTY_ATTRS = {}.freeze
        DEFAULT_RESOURCE_ATTRIBUTES = [
          "gh.sdk.name",
          "gh.sdk.version",
          OpenTelemetry::SemanticConventions::Resource::SERVICE_NAME,
          OpenTelemetry::SemanticConventions::Resource::SERVICE_VERSION,
          OpenTelemetry::SemanticConventions::Resource::DEPLOYMENT_ENVIRONMENT,
        ].freeze

        def initialize(resources = GitHub::Telemetry.resources)
          include_resource_attributes = DEFAULT_RESOURCE_ATTRIBUTES + Array(ENV[GitHub::Telemetry::Logs::INCLUDE_RESOURCE_ATTRIBUTES]&.split(","))
          @resource_attributes = resources.attribute_enumerator.to_h.slice(*include_resource_attributes)
        end

        # Amends trace context to a log event as named tags
        #
        # @param log [SemanticLogger::Log] to add context
        def call(log)
          otel_context = {
            resource_attributes: @resource_attributes,
            span_context: current_span_context,
          }
          log.set_context(:otel_context, otel_context)
        end

        private

        def current_span_context
          span = OpenTelemetry::Trace.current_span
          return EMPTY_ATTRS unless span.recording? && span.context.valid?

          context = span.context
          correlation_data = {
            "trace_id" => context.hex_trace_id,
            "span_id" => context.hex_span_id,
            "trace_flags" => context.trace_flags.sampled? ? "01" : "00",
          }

          if span.parent_span_id == OpenTelemetry::Trace::INVALID_SPAN_ID
            correlation_data["parent_span_id"] = span.hex_parent_span_id
          end

          correlation_data
        end
      end
    end
  end
end
