# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Instrumentation
      # Otel instrumentation configuration
      def instrumentation_init
        if system("ghe-config --true config-apply.instrumentation.enabled")
          ENV['OTEL_TRACES_EXPORTER'] = 'otlp'
          unless system("netstat -tln | grep LISTEN | grep -q :4318")
            ENV['OTEL_TRACES_EXPORTER'] = 'console'
          end
        else
          ENV['OTEL_TRACES_EXPORTER'] = 'none'
        end

        resource = OpenTelemetry::SDK::Resources::Resource.create({
          "config_apply_run_id" => config_apply_run_id,
          "hostname" => Enterprise::ConfigApply::Instrumentation.hostname,
          "topology" => cluster_enabled? ? "multinode" : "standalone",
          "motd_mode" => Enterprise::ConfigApply::Instrumentation.motd
          })

        OpenTelemetry::SDK.configure do |c|
          c.service_name = "ghes-config-apply"
          c.resource = resource
          end

        @tracer_provider = OpenTelemetry.tracer_provider
        @tracer = @tracer_provider.tracer('config-apply-phase')

        @tracer_provider
      end

      def tracer_provider
        @tracer_provider
      end

      def tracer
        @tracer
      end

      # The name of the Otel Span will match that of the "command" argument —
      # you can override this by passing in a value for the "name" argument
      #
      # log_event is a boolean that determines if the span is output to the event log
      def instrument_system(command, description, log_event: true, name: nil, check_exit: false, parent_span_data: current_span_data)
        name = command if name.nil? # by default use the system call as the Span name

        tracer.in_span(name) do |span|
          # grabbing these separately as we need also them for logging the event
          attributes = build_span_attributes(parent_span_data, command, description, log_event)
          set_span_attributes(span, attributes)
          span_data = span.to_span_data
          env_vars = {
            "GHE_CONFIG_APPLY_TRACE_ID" => span_data.hex_trace_id.to_s,
            "GHE_CONFIG_APPLY_SPAN_ID" => span_data.hex_span_id.to_s,
            "GHE_CONFIG_APPLY_SPAN_ATTRIBUTES" => span_attributes_for_env_var(span)
          }

          log_event(attributes["description"], attributes["depth"], span_data, "start")
          _, exit_status = system_log(command, env_vars)

          if check_exit && exit_status > 0
            log_status description, :failed

            description = "Failure: #{description}"
            log_event(description, attributes["depth"], span_data, "error", exit_status)
            raise ConfigApplyException.new(description, exit_status: exit_status)
          end
          log_event(attributes["description"], attributes["depth"], span_data, "finish")
        end
      end

      # You can pass in kwargs which are bound to the eval call of the "code".
      #
      # For example, if you have a method with the prototype: "def sum(a:, b:)"
      # You could instrument it with "instrument_call" as follows:
      #   instrument_call("sum(a: n, b: m)", "calling sum method", n: 2, m: 3)
      # This will evaluate the following code (within the context of an Otel span):
      #   sum(a: 2, b: 3)
      #
      # The name of the Otel Span will match that of the "code" argument — you can
      # override this by passing in a value for the "name" argument
      #
      # log_event is a boolean that determines if the span is output to the event log
      def instrument_call(code, description, log_event: true, name: nil, **kwargs)
        name = code if name.nil? # by default use the executed code as the Span name

        binding = context.binding
        kwargs&.each { |k,v| binding.local_variable_set("#{k}", v) }
        parent_span_data = current_span_data

        ret = nil
        tracer.in_span(name) do |span|
          # grabbing these separately as we need also them for logging the event
          attributes = build_span_attributes(parent_span_data, code, description, log_event)
          set_span_attributes(span, attributes)
          span_data = span.to_span_data

          log_event(attributes["description"], attributes["depth"], span_data, "start")
          begin
            ret = eval(code, binding)
          ensure
            log_event_finish(attributes["description"], attributes["depth"], span.to_span_data, $!)
          end
        end
        ret
      end

      def context; Proc.new {}; end

      def set_span_attributes(span, attributes)
        span.add_attributes(attributes)
      end

      def build_span_attributes(span_data, command, description, log_event)
        depth = if span_data.attributes && !span_data.attributes["depth"].nil?
                  span_data.attributes["depth"].to_i + 1
                else
                  0
                end
        phase = if span_data.attributes && !span_data.attributes["phase"].nil?
                  span_data.attributes["phase"].to_i
                end

        attributes = {
          "command" => command,
          "description" => description,
          "depth" => depth,
        }
        if phase
          attributes = attributes.merge({
            "phase" => phase
          })
        end
        attributes = attributes.merge({
          "log_event" => log_event
        })
      end

      def span_attributes_for_env_var(span)
        span_attributes = span.to_span_data.attributes
        return "" if span_attributes["depth"].nil?
        depth = span_attributes["depth"].to_i + 1
        "depth=#{depth},hostname=#{hostname}"
      end

      def current_span_data
        return nil unless current_span.respond_to?(:to_span_data)
        current_span.to_span_data
      end

      def current_span
        OpenTelemetry::Trace.current_span
      end

      def trace_event(name, attributes = {})
        parent_span = OpenTelemetry::Trace.current_span
        if parent_span.respond_to?(:to_span_data)
          # TODO test for level?
          attributes = attributes.transform_keys(&:to_s).merge({
            "depth" => parent_span.to_span_data.attributes["depth"].to_i + 1
          })
          # the phase value is only set on the root span
          attributes["phase"] = parent_span.to_span_data.attributes["phase"].to_i if attributes["phase"].nil?
        end
        defaults = {
          "depth"     => 0,
          "log_event" => true
        }
        attributes = defaults.merge(attributes)

        tracer.in_span("#{name}", attributes: attributes) do |span|
          description = attributes["description"] || "No description"
          log_event(description, attributes["depth"], span.to_span_data, "start")
          begin
            yield span
          ensure
            log_event_finish(description, attributes["depth"], span.to_span_data, $!)
          end
        end
      end

      # defining these methods as class methods so they are not mixed into the "ConfigApply" namespace
      def self.hostname
        Socket.gethostname
      end

      def self.motd
        %x[/etc/update-motd.d/70-ha | cut -c7-].chomp
      end
    end
  end
end
