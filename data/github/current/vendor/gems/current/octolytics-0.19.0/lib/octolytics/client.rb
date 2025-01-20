require "octolytics/http_collector"
require "octolytics/reporter"
require "octolytics/tags"
require "openssl"

module Octolytics
  class Client
    # Private: The algorithm used for generating an actor hash
    SHA256 = OpenSSL::Digest::SHA256.new

    # Public: Which app are the events for.
    attr_reader :app_id

    def initialize(app_id, options = {})
      @app_id = app_id

      @options = options || {}
      @options[:secret] ||= default_secret
    end

    # Public: Easy generating of the necessary meta tags.
    def tags
      @tags ||= Tags.new(self)
    end

    # Public: The full url of where events should be sent.
    def collector_url
      collector.url
    end

    # Public: The host of where events should be sent.
    def collector_host
      collector.host
    end

    # Public: The full url of where the javascript should be loaded from.
    def collector_script_url
      collector.script_url
    end

    # Public: The host the javascript should be loaded from.
    def collector_script_host
      collector.script_host
    end

    # Public: What secret is the client using to verify stuff.
    def secret
      @options[:secret]
    end

    # Public: Given an actor_id it generates a hash based on the app secret for
    # use in validating that the actor_id has not been tampered with.
    def generate_actor_hash(actor_id)
      OpenSSL::HMAC.hexdigest(SHA256, secret, actor_id.to_s)
    end

    # Public: Send events to the analytics collector.
    #
    # event_type - A String or Symbol name for the event (ie: "tweet", "user_create", or "user.create")
    # dimensions - A Hash of String keys and String values that provide more context.
    # measures - A Hash of String keys and Integer values.
    # context - A Hash to pass along with the event. Can be nested multiple levels and use any types you like that work in JSON.
    # timestamp - A Time or Integer of when the event occurred. Defaults to now.
    #
    # Alternatively, multiple events can be sent at once by passing an array of hashes:
    #
    #     client.record([
    #       {event_type: "tweet", dimensions: {"user_id": 1234}, measures: {}, context: {}},
    #     ])
    #
    # Returns an Octolytics::Response. If an exception occurs while recording the given events,
    # it will be propagated to the caller.
    def record!(*args)
      collector.record!(*args)
    end

    # Public: Send events to the analytics collector.
    #
    # The parameters and return value of this method are identical to #record!. However,
    # if an exception occurs when recording the given events, the exception will be
    # caught and stored in the Octolytics::Response returned to the caller. The
    # Response will be marked as failed.
    def record(*args)
      collector.record(*args)
    end

    # Public: Retrieves a list of referring referrers
    #
    # options: A Hash of options
    #   - event_type: Event type (e.g., "page_view")
    #   - dimension: Dimension (e.g., "repository_id")
    #   - dimension_value: Value for dimension (e.g., 1234)
    #
    # Returns an Octolytics::Response.
    def referrers(options = {})
      reporter.referrers(options)
    end

    # Public: Retrieves a list of paths for a referrer
    #
    # options: A Hash of options
    #   - referrer: (required) referrer (e.g., "github.com")
    #   - event_type: Event type (e.g., "page_view")
    #   - dimension: Dimension (e.g., "repository_id")
    #   - dimension_value: Value for dimension (e.g., 1234)
    def referrer_paths(options = {})
      reporter.referrer_paths(options)
    end

    # Public: Retrieves a list of content
    #
    # options: A Hash of options
    #   - event_type: Event type (e.g., "page_view")
    #   - dimension: Dimension (e.g., "repository_id")
    #   - dimension_value: Value for dimension (e.g., 1234)
    def content(options = {})
      reporter.content(options)
    end

    # Public: Retrieves a list of counts, bucketed by time
    #
    # options: A Hash of options
    #   - bucket: Time bucket (e.g., "hourly")
    #   - event_type: Event type (e.g., "page_view")
    #   - dimension: Dimension (e.g., "repository_id")
    #   - dimension_value: Value for dimension (e.g., 1234)
    def counts(options = {})
      reporter.counts(options)
    end

    # Public: Retrieves a list of most frequent values for a target
    # grouped dimension when filtered by another dimension and value.
    #
    # options: A Hash of options
    #   - event_type: Event type (e.g., "page_view")
    #   - grouped_dimension: Dimension to be grouped, counted, and ranked (e.g., "repository_id")
    #   - dimension: Dimension (e.g., "actor_id")
    #   - dimension_Value: value for dimension (e.g., 1234)
    def top(options = {})
      reporter.top(options)
    end

    # Public: Retrieves raw event data from the analytics streaming endpoint.
    # You specify an event type and, optionally, 'from' and 'to' dates, which
    # can be Graphite-style relative values such as "-2w" for two weeks ago.
    #
    # Additionally, you provide a block that will be called with content from
    # the server as it is read, which may be potentially a large volume
    # of data.
    #
    # block: A block which will be called with data in chunks as it is read from
    #        the server.
    # options: A Hash of options
    #   - event_type: Event type (e.g., "page_view")
    #   - from:       A timestamp (in seconds since epoch) or relative date value to fetch
    #                 events from; server default is "-1d".
    #   - to:         A timestamp or relative date value to fetch events until; defaults to "now".
    #   - decompress: A boolean flag; whether to pass the block compressed data
    #                 directly from the server, or to decompress it on the fly.
    def raw_events(options = {}, &block)
      reporter.raw_events(options, &block)
    end

    # Private: Lazily-initialized collector instance
    def collector
      @collector ||= @options.fetch(:collector) {
        collector_options = @options.merge(@options[:collector_options] || {})
        HttpCollector.new(@app_id, collector_options)
      }
    end

    # Private: Lazily-initialized reporter instance
    def reporter
      @reporter ||= @options.fetch(:reporter) {
        reporter_options = @options.merge(@options[:reporter_options] || {})
        Reporter.new(@app_id, reporter_options)
      }
    end

    # Private: The default secret from the environment
    def default_secret
      ENV["OCTOLYTICS_SECRET"]
    end
  end
end
