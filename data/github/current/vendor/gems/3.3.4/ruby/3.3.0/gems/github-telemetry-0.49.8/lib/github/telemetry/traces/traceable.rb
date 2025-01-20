# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      # Wrapper around OpenTelemetry::Trace::Tracer
      #
      # Example:
      #
      #   class ExternalSupplier
      #     # Create class and instance methods to access a named tracer
      #     include ::GitHub::Telemetry::Traces::Traceable
      #
      #     def call_supplier(amount, name)
      #       attributes = { "gh.external_supplier.amount" => amount, "gh.external_supplier.name" => name }
      #       tracer.in_span("call_supplier", attributes: attributes) do |span|
      #       # ...
      #       end
      #     end
      #   end
      #
      module Traceable
        attr_reader :tracer

        def self.included(base)
          base.class_eval do
            def self.tracer
              @tracer ||= GitHub::Telemetry.tracer(name)
            end

            def tracer
              self.class.tracer
            end
          end
        end
      end
    end
  end
end
