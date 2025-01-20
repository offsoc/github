require "openssl"

module Octolytics
  # Abstract superclass that exposes some common methods expected to be implemented by subclasses.
  class Collector
    # Private: The algorithm used for generating an authorization signature
    SHA256 = OpenSSL::Digest::SHA256.new

    # Public: The app all events will be created for.
    attr_reader :app_id

    # Private: The application's secret for generating authorization tokens
    attr_reader :secret

    # Private: The environment of the app using octolytics. Determines which
    # octolytics environment should receive the event.
    attr_reader :environment

    def initialize(app_id, options)
      @app_id = app_id
      @secret = options[:secret]

      @environment = options.fetch(:environment) { default_environment }.to_s

      if @secret.nil? || @secret.empty?
        raise ArgumentError, "secret was blank"
      end

      if @app_id.nil? || @app_id.empty?
        raise ArgumentError, "app_id was blank"
      end
    end

    def record!(*args)
      @instrumenter.instrument("collector.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :record

        raise ArgumentError, "event_type or list of events must be specified" unless args.any?

        if Array === args[0]
          defaults = {
            dimensions:  {},
            measures:    {},
            context:     {},
            timestamp:   Time.now.to_i,
          }

          events = args[0].map { |event|
            event = defaults.merge(event)
            event[:timestamp] = event[:timestamp].to_i
            event
          }

          body = {events: events}
        else
          event_type, dimensions, measures, context, timestamp = *args
          body = {events: [{
            event_type:  event_type,
            dimensions:  dimensions || {},
            measures:    measures || {},
            context:     context || {},
            timestamp:   (timestamp || Time.now).to_i,
          }]}
        end

        post_events(body)
      end
    end

    def record(*args)
      begin
        return record!(*args)
      rescue => boom
        FailedResponse.new(boom)
      rescue Object => boom
        # We don't expect this to happen (catching something
        # that isn't a subclass of StandardError) and would
        # like to know about it.
        @instrumenter.instrument("collector.unexpected_exception.#{Instrumentation::Namespace}") do |payload|
          payload[:error] = boom
          FailedResponse.new(boom)
        end
      end
    end

    private

    def post_events(body)
      raise "Not implemented - implement in your subclass!"
    end

    def local_environment?
      @environment == "development" || @environment == "test"
    end

    def default_environment
      ENV["RAILS_ENV"] || ENV["RACK_ENV"] || ENV["APP_ENV"] || "development"
    end

    # Private: Generates an HMAC signature for the serialized JSON request
    # body. An HMAC is required for server-side events to ensure event data
    # comes from a client holding a secret.
    def generate_authorization_signature(request_body)
      OpenSSL::HMAC.hexdigest(SHA256, @secret, request_body)
    end
  end
end
