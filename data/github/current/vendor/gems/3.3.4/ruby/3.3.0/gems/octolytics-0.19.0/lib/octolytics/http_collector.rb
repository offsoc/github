require "octolytics/instrumentation"
require "octolytics/collector"
require "octolytics/adapters/net_http"
require "octolytics/instrumenters/noop"
require "octolytics/version"
require "json"

module Octolytics
  class HttpCollector < Collector
    # Public: The host that events should be sent to.
    attr_reader :host

    # Public: The url that events should be sent to.
    attr_reader :url

    # Public: The host the javascript should be loaded from.
    attr_reader :script_host

    # Public: The url of where the javascript is located.
    attr_reader :script_url

    # Private: The content type to send with all requests to record an event.
    attr_reader :content_type

    # Private: The adapter being used to record events.
    attr_reader :adapter

    # Private: The instrumenter that all instrumentation runs through.
    attr_reader :instrumenter

    def initialize(app_id, options = {})
      options ||= {}
      super(app_id, options)

      @host = options.fetch(:host) { default_host }
      @script_host = options.fetch(:script_host) { default_script_host }

      @url = "#{scheme}://#{@host}"
      @script_url = "#{scheme}://#{@script_host}/assets/api.js"

      @content_type = options.fetch(:content_type) { default_content_type }

      if @host.nil? || @host.empty?
        raise ArgumentError, "host was blank"
      end

      if @content_type.nil? || @content_type.empty?
        raise ArgumentError, "content_type was blank"
      end

      @instrumenter = options.fetch(:instrumenter) { Octolytics::Instrumenters::Noop }
      @adapter = options.fetch(:adapter) { Adapters::NetHttp.new }
      @adapter.timeout = options[:timeout] if options[:timeout] && @adapter.respond_to?(:timeout=)
    end

    private

    def post_events(body)
      json_body = JSON.dump(body)
      headers = {
        "Content-Type"  => @content_type,
        "User-Agent"    => "Octolytics v#{Octolytics::VERSION}",
        "Authorization" => "Octolytics #{generate_authorization_signature(json_body)}",
      }

      @adapter.post("#{@url}/#{@app_id}/events", json_body, headers)
    end

    def scheme
      @scheme ||= local_environment? ? "http" : "https"
    end

    def default_host
      ENV.fetch("OCTOLYTICS_HOST") {
        case @environment
        when "production"
          "collector.githubapp.com"
        when "staging"
          "collector-staging.githubapp.com"
        else
          "collector.dev"
        end
      }
    end

    def default_script_host
      ENV.fetch("OCTOLYTICS_SCRIPT_HOST") {
        if @environment == "production"
          "collector-cdn.github.com" # use cdn for prod
        else
          default_host
        end
      }
    end

    def default_content_type
      ENV.fetch("OCTOLYTICS_CONTENT_TYPE") {
        "application/vnd.github-octolytics.batch+json"
      }
    end
  end
end
