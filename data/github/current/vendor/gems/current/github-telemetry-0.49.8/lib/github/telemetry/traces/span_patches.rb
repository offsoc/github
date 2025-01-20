# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      # Contains workarounds for missing OTel API Features
      # The logger may be initialized and emit log statements _before_ the SDK has been initialized,
      # and that causes errors to occur during the correlation check.
      module SpanPatches
        # Attribute readers are present on the SDK span but not API spans.
        # This seems like an oversight but the specification does not seem to specify that noop spans should return empty attributes
        def attributes
          nil
        end

        def parent_span_id
          OpenTelemetry::Trace::INVALID_SPAN_ID
        end

        def hex_parent_span_id
          parent_span_id.unpack1("H*")
        end
      end

      # Contains workarounds for missing OTel SDK Features
      module ReadWriteSpanPatches
        # Patches the upstream SDK that records exceptions as Span Events types
        # This allows us to keep track of the original exception and process it for reporting to OTel Backends including applying scrubbing and backtrace truncation rules
        def record_exception(exception, attributes: nil)
          begin
            attributes ||= {}
            filter = StacktraceFilter.new_instance

            # Avoid circular exception references where causes refer to themselves.
            all_causes = Set.new
            all_causes << exception

            cause = exception
            while (cause = cause.cause) && !all_causes.include?(cause)
              all_causes << cause
            end

            all_causes.each do |e|
              attrs = attributes.dup
              attrs["exception.type"] = e.class.name if e.class.name
              attrs["exception.message"] = e.message if e.message
              begin
                cleansed_backtrace = filter.clean(e)&.join("\n")&.encode("UTF-8", invalid: :replace, undef: :replace, replace: "�")
                attrs["exception.stacktrace"] = cleansed_backtrace if cleansed_backtrace
              rescue StandardError => se
                OpenTelemetry.handle_error(exception: se)
              end
              add_event("exception", attributes: attrs)
            end
          rescue StandardError => ae
            OpenTelemetry.handle_error(exception: ae)
          end

          self
        end
      end

      module ProxyTracerProviderPatches
        def force_flush; end
      end
    end
  end
end

OpenTelemetry::Trace::TracerProvider.prepend(GitHub::Telemetry::Traces::ProxyTracerProviderPatches)
OpenTelemetry::Trace::Span.prepend(GitHub::Telemetry::Traces::SpanPatches)
OpenTelemetry::SDK::Trace::Span.prepend(GitHub::Telemetry::Traces::ReadWriteSpanPatches)
