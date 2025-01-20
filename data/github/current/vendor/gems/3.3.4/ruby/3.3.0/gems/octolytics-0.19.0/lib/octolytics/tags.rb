require "octolytics/util"

module Octolytics
  # Private: Should never need to be used directly. Just use the Client#tags
  # method instead.
  class Tags
    # Private: The client whose config should be used.
    attr_reader :client

    def initialize(client)
      @client = client
    end

    # Public: Output required meta tags for octolytics to work.
    #
    # Example:
    #
    #   <%= Octolytics::Client.new("github").tags.required %>
    #
    #   # would output:
    #   <meta name="octolytics-app-id" content="github" />
    #   <meta name="octolytics-host" content="collector.githubapp.com" />
    #   <meta name="octolytics-script-host" content="collector-cdn.githubapp.com" />
    def required
      meta_tag("app-id", @client.app_id) <<
      meta_tag("host", @client.collector_host) <<
      meta_tag("script-host", @client.collector_script_host)
    end

    # Public: Output the necessary actor tags if actor_id is not nil. Using this
    # method requires that the secret is set for the client.
    #
    # Example:
    #
    #   <%= Octolytics::Client.new("github", secret: "asdf").tags.actor(1) %>
    #
    #   # would output:
    #   <meta name="octolytics-actor-id" content="1" />
    #   <meta name="octolytics-actor-hash" content="387fd038f785331698bc2345968aa71d3852f972b996392f7b37df0c9005327b" />
    def actor(actor_id)
      return "" unless actor_id

      actor_hash = @client.generate_actor_hash(actor_id)
      meta_tag("actor-id", actor_id) << meta_tag("actor-hash", actor_hash)
    end

    # Public: Output dimension meta tag for each key/value pair.
    #
    # Example:
    #
    #   <%= Octolytics::Client.new("github").tags.dimension(repository_id: 234) %>
    #
    #   # would output:
    #   <meta name="octolytics-dimension-repository_id" content="234" />
    def dimension(dimensions = {})
      dimensions.map { |name, value|
        meta_tag("dimension-#{name}", value)
      }.join("")
    end
    alias_method :dimensions, :dimension

    # Public: Output measure meta tag for each key/value pair.
    #
    # Example:
    #
    #   <%= Octolytics::Client.new("github").tags.measure(latency: 22) %>
    #
    #   # would output:
    #   <meta name="octolytics-measure-latency" content="22" />
    def measure(measures = {})
      measures.map { |name, value|
        meta_tag "measure-#{name}", value
      }.join("")
    end
    alias_method :measures, :measure

    private

    def meta_tag(name, content)
      %Q(<meta name="octolytics-#{Util.html_escape name}" content="#{Util.html_escape content}" />)
    end
  end
end
