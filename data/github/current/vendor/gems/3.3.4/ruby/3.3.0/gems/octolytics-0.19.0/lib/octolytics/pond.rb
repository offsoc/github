require "octolytics/instrumentation"
require "octolytics/adapters/net_http"
require "octolytics/authorization_token"
require "octolytics/instrumenters/noop"
require "octolytics/version"

module Octolytics
  # Wraps communication with Pond's API.
  class Pond
    # Public: Where is the API endpoint?
    attr_reader :url

    # Private: The application's secret for generating authorization tokens
    attr_reader :secret

    # Private: What environment should we send things to.
    attr_reader :environment

    # Private: What should be used to perform requests.
    attr_reader :adapter

    # Private: The instrumenter that all instrumentation runs through.
    attr_reader :instrumenter

    # Private: How long an authorization token will remain valid.
    # 3 minutes by default.
    TOKEN_EXPIRATION_LENGTH = 60 * 3

    def initialize(options = {})
      options ||= {}

      @secret = options[:secret]
      @environment = options.fetch(:environment) { default_environment }.to_s
      @url = options.fetch(:url) { default_url }

      if @secret.nil? || @secret.empty?
        raise ArgumentError, "secret was blank"
      end

      if @url.nil? || @url.empty?
        raise ArgumentError, "url was blank"
      end

      @instrumenter = options.fetch(:instrumenter) { Octolytics::Instrumenters::Noop }
      @adapter = options.fetch(:adapter) { Adapters::NetHttp.new }
      @adapter.timeout = options[:timeout] if options[:timeout] && @adapter.respond_to?(:timeout=)
    end

    # Public: Get top referrers per repo.
    def referrers(repository_id, options = {})
      @instrumenter.instrument("pond.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :referrers

        options = options.dup
        token = generate_token(options)

        url = build_url_from_path_components(
          'repositories', repository_id, 'referrers'
        )

        @adapter.get(url, options, headers(token))
      end
    end

    # Public: get top paths for a given referrer.
    def referrer_paths(repository_id, referrer, options = {})
      @instrumenter.instrument("pond.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :referrer_paths

        options = options.dup
        token = generate_token(options)

        url = build_url_from_path_components(
          'repositories', repository_id, 'referrers', referrer, 'top_paths'
        )

        @adapter.get(url, options, headers(token))
      end
    end

    # Public: get top content per repository.
    def content(repository_id, options = {})
      @instrumenter.instrument("pond.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :content

        options = options.dup
        token = generate_token(options)

        url = build_url_from_path_components(
          'repositories', repository_id, 'content')

        @adapter.get(url, options, headers(token))
      end
    end

    # Public: Get repository hourly counts for supported event types.
    def counts(repository_id, event_type, bucket = 'hour', options = {})
      @instrumenter.instrument("pond.#{Instrumentation::Namespace}") do |payload|
        case event_type
        when 'clone'
          endpoint = 'clones'
        else
          endpoint = 'views'
        end

        payload[:method] = :counts

        options = options.dup
        token = generate_token(options)

        url = build_url_from_path_components(
          'repositories', repository_id, endpoint, bucket)

        @adapter.get(url, options, headers(token))
      end
    end

    # Private: Builds a URL by joining components together with forward slashes
    def build_url_from_path_components(*components)
      [@url].concat(components).compact.join('/')
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
      ENV.fetch("OCTOLYTICS_POND_URL") {
        case @environment
        when "production"
          "https://pond.githubapp.com"
        when "staging"
          "https://pond-staging.githubapp.com"
        else
          "http://pond.dev"
        end
      }
    end
 end
end
