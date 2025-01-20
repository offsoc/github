# frozen_string_literal: true
# Stubs for monitoring platforms
module MonitoringHelpers
  module Skylight
    INSTRUMENTS = []
    CURRENT_TRACE = OpenStruct.new(endpoint: nil)

    module Instrumenter
      def self.instance
        self
      end

      def self.current_trace
        CURRENT_TRACE
      end
    end

    module_function

    def instrument(opts)
      INSTRUMENTS << opts
      yield if block_given?
    end

    def done(trace)
    end
  end

  module NewRelic
    MESSAGES = []
    module Agent
      def self.add_custom_attributes(attrs)
        MESSAGES << attrs
      end

      def self.set_transaction_name(name)
        MESSAGES << name
      end

      module MethodTracerHelpers
        def self.trace_execution_scoped(name)
          MESSAGES << name
          yield
        end
      end
    end
  end

  module ScoutApm
    MESSAGES = []
    module Layer
      def self.new(scope, name)
        MESSAGES << [scope, name]
        self
      end

      def self.subscopable!
      end
    end

    module RequestManager
      def self.lookup; self; end

      def self.start_layer(layer)
        MESSAGES << "start_layer"
      end

      def self.stop_layer
        MESSAGES << "stop_layer"
      end
    end

    module Context
      def self.add(opts)
        MESSAGES << opts
      end
    end

    module Tracer
      module ClassMethods
        def instrument(type, name, opts)
          MESSAGES << [type, name, opts]
          yield
        end
      end
    end
  end

  module Appsignal
    MESSAGES = []
    module_function

    def instrument(name, title = nil, body = nil)
      MESSAGES << ["instrument", name, title, body]
      yield
    end

    def start_event
      MESSAGES << ["start_event"]
    end

    def finish_event(name, title, body)
      MESSAGES << ["finish_event", name, title, body]
    end

    def tag_request(tags)
      MESSAGES << ["tag_request", tags]
    end

    module Transaction
      module_function
      def current
        Appsignal
      end
    end
  end

  module Statsd
    MESSAGES = []
    module_function
    def time(name)
      MESSAGES << ["time", name]
      yield
    end

    def timing(name, time)
      MESSAGES << ["timing", name]
    end
  end

  module Datadog
    MESSAGES = []

    def self.tracer
      self
    end

    def self.trace(name, **rest)
      payload = { "trace" => name }.merge(rest)
      MESSAGES << payload
      span = Span.new(payload)
      if block_given?
        yield(span)
      else
        span
      end
    end

    class Span
      def initialize(payload)
        @payload = payload
      end

      def set_tag(key, value)
        @payload[key] = value
      end

      def span_type=(st)
      end

      def finish
      end

      def resource=(rt)
      end
    end
  end
end
