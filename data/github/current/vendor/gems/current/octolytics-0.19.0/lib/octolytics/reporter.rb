require "octolytics/instrumentation"
require "octolytics/adapters/net_http"
require "octolytics/authorization_token"
require "octolytics/instrumenters/noop"
require "octolytics/gzipped_stream"
require "octolytics/version"

module Octolytics
  class Reporter
    # Public: Which app are the events for.
    attr_reader :app_id

    # Public: Where should all the events be sent.
    attr_reader :url

    # Private: The application's secret for generating authorization tokens
    attr_reader :secret

    # Private: What environment should we send things too.
    attr_reader :environment

    # Private: What should be used to perform requests.
    attr_reader :adapter

    # Private: The instrumenter that all instrumentation runs through.
    attr_reader :instrumenter

    # Private: How long an authorization token will remain valid.
    # 3 minutes
    TOKEN_EXPIRATION_LENGTH = 60 * 3

    def initialize(app_id, options = {})
      options ||= {}

      @app_id = app_id
      @secret = options[:secret]
      @environment = options.fetch(:environment) { default_environment }.to_s
      @url = options.fetch(:url) { default_url }

      if @secret.nil? || @secret.empty?
        raise ArgumentError, "secret was blank"
      end

      if @app_id.nil? || @app_id.empty?
        raise ArgumentError, "app_id was blank"
      end

      if @url.nil? || @url.empty?
        raise ArgumentError, "url was blank"
      end

      @instrumenter = options.fetch(:instrumenter) { Octolytics::Instrumenters::Noop }
      @adapter = options.fetch(:adapter) { Adapters::NetHttp.new }
      @adapter.timeout = options[:timeout] if options[:timeout] && @adapter.respond_to?(:timeout=)
    end

    # See Octolytics::Client#referrers
    def referrers(options = {})
      @instrumenter.instrument("reporter.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :referrers

        options = options.dup
        token = generate_token(options)
        url = build_url_from_path_components(
          options.delete(:event_type), options.delete(:dimension), options.delete(:dimension_value), 'referrers'
        )

        @adapter.get(url, options, headers(token))
      end
    end

    # See Octolytics::Client#referrer_paths
    def referrer_paths(options = {})
      @instrumenter.instrument("reporter.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :referrer_paths

        options = options.dup
        token = generate_token(options)
        raise ArgumentError, "referrer is required" unless options[:referrer]

        url = build_url_from_path_components(
          options.delete(:event_type), options.delete(:dimension), options.delete(:dimension_value), 'referrer_paths'
        )

        @adapter.get(url, options, headers(token))
      end
    end

    # See Octolytics::Client#content
    def content(options = {})
      @instrumenter.instrument("reporter.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :content

        options = options.dup
        token = generate_token(options)
        url = build_url_from_path_components(
          options.delete(:event_type), options.delete(:dimension), options.delete(:dimension_value), 'content')

        @adapter.get(url, options, headers(token))
      end
    end

    # See Octolytics::Client#counts
    def counts(options = {})
      @instrumenter.instrument("reporter.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :counts

        # Defaults
        options = { bucket: 'hourly' }.merge(options)
        token = generate_token(options)

        url = build_url_from_path_components(
          options.delete(:event_type), options.delete(:dimension), options.delete(:dimension_value), options.delete(:bucket), 'counts')

        @adapter.get(url, options, headers(token))
      end
    end

    # See Octolytics::Client#top
    def top(options = {})
      @instrumenter.instrument("reporter.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :top

        options = options.dup
        token = generate_token(options)

        url = build_url_from_path_components(
          options.delete(:event_type), options.delete(:dimension), options.delete(:dimension_value), 'top', options.delete(:grouped_dimension))

        @adapter.get(url, options, headers(token))
      end
    end

    # See Octolytics::Client#raw_events
    def raw_events(options = {}, &block)
      @instrumenter.instrument("reporter.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :raw_events

        options = options.dup
        decompress = options.delete(:decompress)
        token = generate_token(options)
        headers = headers(token).merge("Accept" => "application/x-gzip")

        url = build_url_from_path_components(
          options.delete(:event_type), 'events'
        )

        stream_handler = (decompress ? GzippedStream.new(block) : block)
        request_options = {
          streaming_response: true,
          streaming_response_handler: stream_handler,
        }
        response = @adapter.get(url, options, headers, request_options)

        stream_handler.close if stream_handler.respond_to?(:close)
        response
      end
    end

    # Private: Builds a URL by joining components together with forward slashes
    def build_url_from_path_components(*components)
      [@url, "apps", @app_id].concat(components).compact.join('/')
    end

    # Private: Generates common HTTP headers used for all requests
    #
    # token - Authorization token (see #generate_token)
    def headers(token)
      {
        "Accept" => "application/json",
        "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
        "Authorization" => "Token #{token}",
      }
    end

    # Private: Generates a token suitable to authorize a future request
    def generate_token(token_params)
      token = AuthorizationToken.new(@secret)
      token.generate(Time.now.to_i + TOKEN_EXPIRATION_LENGTH, token_params)
    end

    # Private: Figures out what environment we are dealing with based on some
    # common ones.
    def default_environment
      ENV["RAILS_ENV"] || ENV["RACK_ENV"] || ENV["APP_ENV"] || "development"
    end

    # Private: Figures out where to send events based on environment.
    def default_url
      ENV.fetch("OCTOLYTICS_REPORTER_URL") {
        case @environment
        when "production"
          "https://analytics-app.service.private-us-east-1.github.net"
        when "staging"
          "https://analytics-app-staging.service.private-us-east-1.github.net"
        else
          "http://analytics.dev"
        end
      }
    end
  end
end
