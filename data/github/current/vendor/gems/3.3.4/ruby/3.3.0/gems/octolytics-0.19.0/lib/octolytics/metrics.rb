require "cgi/util"
require "octolytics/instrumentation"
require "octolytics/adapters/net_http"
require "octolytics/authorization_token"
require "octolytics/instrumenters/noop"
require "octolytics/version"

module Octolytics
  class Metrics
    # Private: How long an authorization token will remain valid. 3 minutes.
    TOKEN_EXPIRATION_LENGTH = 60 * 3

    # Private: The secret for generating authorization tokens.
    attr_reader :secret

    # Private: The url where metrics should be sent and received from.
    attr_reader :url

    # Private: The host where metrics should be sent. Combines with scheme to
    # create the url.
    attr_reader :host

    # Private: The environment of metrics-api you wish to use.
    attr_reader :environment

    # Private: The adapter used to talk to metrics api.
    attr_reader :adapter

    # Private: The instrumenter that all instrumentation runs through.
    attr_reader :instrumenter

    # Public: Create a new instance of a metrics api client.
    #
    # options - The Hash of options.
    #           secret - The String secret used to generate auth tokens.
    #           environment - The String environment of the metrics-api service
    #                         you want to talk to. Defaults to "development".
    #           host - The String host of where metrics-api lives. Defaulted
    #                  based on environment.
    #           timeout - The Integer number of seconds before a connect or read
    #                     timeout should raise.
    def initialize(options = {})
      @secret = options[:secret] || ENV["METRICS_API_SECRET"]
      @environment = options.fetch(:environment) { default_environment }.to_s
      @host = options.fetch(:host) { default_host }
      @instrumenter = options.fetch(:instrumenter) { Octolytics::Instrumenters::Noop }

      if @secret.nil? || @secret.empty?
        raise ArgumentError, "secret was blank"
      end

      if @host.nil? || @host.empty?
        raise ArgumentError, "host was blank"
      end

      @url = "#{scheme}://#{@host}"

      @adapter = options.fetch(:adapter) { Adapters::NetHttp.new }

      if options[:timeout] && @adapter.respond_to?(:timeout=)
        @adapter.timeout = options[:timeout]
      end

      if options[:logger] && @adapter.respond_to?(:logger=)
        @adapter.logger = options[:logger]
      end

      @token = AuthorizationToken.new(@secret)
    end

    # Public: Get a list of all metrics from the api.
    #
    # params - The Hash of extra query string params to send to metrics-api.
    #
    # Returns Array of Hashes.
    # Raises Octolytics::ServerError if server fails.
    # Raises Octolytics::ClientError if auth fails.
    def metrics(params = {})
      @instrumenter.instrument("metrics.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :metrics

        url = "#{@url}/metrics"
        token = generate_token(params)

        @adapter.get(url, params, headers(token))
      end
    end

    # Public: Find a metric by name.
    #
    # name - The String or Symbol name of the metric you would like to find.
    # params - The Hash of extra query string params to send to metrics-api.
    #
    # Returns a Hash of Metric meta data.
    # Raises Octolytics::ServerError if server fails.
    # Raises Octolytics::ClientError if metric not found or auth fails.
    def find(name, params = {})
      @instrumenter.instrument("metrics.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :find

        url = build_url("metrics", name)
        token = generate_token(params)

        @adapter.get(url, params, headers(token))
      end
    end

    # Public: Create a metric.
    #
    # metric_params - The Hash of attributes for the metric.
    #                 name - The String name of the metric (ie: new_organizations). Required.
    #                 label - The String label of the metric (ie: New Organizations). Required.
    #                 source - The String source of where more info can be found about metric. Optional.
    #                 prose - The String prose describing what the metric is. Optional.
    #                 units - The String units that describes the measurement values. Optional, but highly encouraged.
    #
    # Returns nothing.
    # Raises Octolytics::ServerError if server fails.
    # Raises Octolytics::ClientError if metric already exists or auth fails.
    def create(metric_params = {})
      @instrumenter.instrument("metrics.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :create

        metric_params.fetch(:name) { raise ArgumentError, "name is required" }
        metric_params.fetch(:label) { raise ArgumentError, "label is required" }

        url = build_url("metrics")
        token = generate_token(metric_params)

        @adapter.post(url, metric_params, headers(token))
      end
    end

    # Public: Update one or more metric attributes by metric name.
    #
    # name - The String name of the metric.
    # metric_params - The Hash of attributes to update for the metric.
    #                 See #create for a list of available attributes.
    #
    # Returns nothing.
    # Raises Octolytics::ServerError if server fails.
    # Raises Octolytics::ClientError if metric not found or auth fails.
    def update(name, metric_params = {})
      @instrumenter.instrument("metrics.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :update

        url = build_url("metrics", name)
        token = generate_token(metric_params)

        @adapter.put(url, metric_params, headers(token))
      end
    end

    # Public: Load one or more data points for one or more metrics all at once.
    #
    # measurements - An Array of Hashes of metrics, timestamps and values.
    #
    # Metric must be created before loading data. timestamp must be UTC day aligned
    # milliseconds since epoch.
    #
    # Returns nothing.
    # Raises Octolytics::ServerError if server fails.
    # Raises Octolytics::ClientError if metric not found or auth fails.
    def load(measurements)
      @instrumenter.instrument("metrics.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :load

        url = build_url("load")
        token = generate_token(measurements: measurements)

        @adapter.post(url, measurements, headers(token))
      end
    end

    # Public: Query data for one or more metrics during a time frame.
    # You receive one metric per week, where the week starts on the
    # day_of_week value you pass (or uses the default).
    #
    # metrics - An Array of metric names to query data for.
    # options - A Hash of options for tweaking what is queried.
    #           from - The Integer milliseconds since epoch of where the api
    #                  should start when returning data. Can also be a String
    #                  similar to graphite's time formatting (ie: -14d, -6w).
    #           to - Same as from, but represents where the api should stop when
    #                querying data.
    #           day_of_week - The Integer representation of the day of week that
    #                         measurements should be queried for. 0 for Sunday
    #                         and 6 for Saturday. Default is Sunday.
    #
    # Returns Hash of metric measurements and meta data.
    # Raises Octolytics::ServerError if server fails.
    # Raises Octolytics::ClientError if auth fails.
    def query_weekly(metrics, options = {})
      @instrumenter.instrument("metrics.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :query_weekly

        url = "#{@url}/metrics/weekly/q"

        options = options.dup
        options[:dow] = options.delete(:day_of_week) if options[:day_of_week]

        params = options.merge(metrics: metrics)
        token = generate_token(params)

        @adapter.get(url, params, headers(token))
      end
    end

    # Public: Query data for one or more metrics during a time frame.
    #
    # metrics - An Array of metric names to query data for.
    # options - A Hash of options for tweaking what is queried.
    #           from - The Integer milliseconds since epoch of where the api
    #                  should start when returning data. Can also be a String
    #                  similar to graphite's time formatting (ie: -14d, -6w).
    #           to - Same as from, but represents where the api should stop when
    #                querying data.
    #
    # Returns Hash of metric measurements and meta data.
    # Raises Octolytics::ServerError if server fails.
    # Raises Octolytics::ClientError if auth fails.
    def query_daily(metrics, options = {})
      @instrumenter.instrument("metrics.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :query_daily

        url = "#{@url}/metrics/q"

        params = options.merge(metrics: metrics)
        token = generate_token(params)

        @adapter.get(url, params, headers(token))
      end
    end

    # Public: Return a list of recent measurements for a metric.
    #
    # metrics - A metric name.
    # options - A Hash of options.
    #           number_of_items - The number of recent items to return. Defaults to
    #                             50.
    #
    # Returns Array of metric measurements and meta data.
    # Raises Octolytics::ServerError if server fails.
    # Raises Octolytics::ClientError if auth fails.
    def recent_data(metric, options = {})
      @instrumenter.instrument("metrics.#{Instrumentation::Namespace}") do |payload|
        payload[:method] = :recent_data

        url = "#{@url}/metrics/#{metric}/recent"

        options = options.dup
        options[:n] = options.delete(:number_of_items) if options[:number_of_items]
        token = generate_token(options)

        @adapter.get(url, options, headers(token))
      end
    end

    private

    def local_environment?
      @environment == "development" || @environment == "test"
    end

    def default_environment
      ENV["RAILS_ENV"] || ENV["RACK_ENV"] || ENV["APP_ENV"] || "development"
    end

    def scheme
      @scheme ||= local_environment? ? "http" : "https"
    end

    def default_host
      ENV.fetch("METRICS_API_HOST") {
        case @environment
        when "production"
          "metrics-api.githubapp.com"
        when "staging"
          "metrics-api-staging.githubapp.com"
        else
          "127.0.0.1:7080"
        end
      }
    end

    def headers(token)
      {
        "Accept" => "application/json",
        "Content-Type" => "application/json",
        "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
        "Authorization" => "Token #{token}",
      }
    end

    def generate_token(token_params)
      @token.generate(Time.now.to_i + TOKEN_EXPIRATION_LENGTH, token_params)
    end

    def build_url(*args)
      "#{@url}/#{args.map { |arg| CGI.escape(arg) }.join('/')}"
    end
  end
end
