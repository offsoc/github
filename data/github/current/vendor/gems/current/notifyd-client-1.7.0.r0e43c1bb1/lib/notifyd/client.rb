# typed: true
# frozen_string_literal: true

require "uri"
require "faraday"
require "notifyd/proto"
require "notifyd/builder"

module Notifyd
  class Client
    # Set a timeout of 5 seconds - same as timeout for Notifyd API
    CLIENT_TIMEOUT_IN_SECONDS = 5

    # Initialize a new client using the provided Faraday::Connection
    # This connection must do it's own HMAC signing
    def self.with_conn(conn)
      # .allocate bypasses the #initialize method
      allocate.tap do |client|
        client.instance_variable_set(:@connection, conn)
        client.after_initialize
      end
    end

    # Initialize a new Notifyd client
    # Provide a url and hmac_key to use the default faraday config
    # You can then further modify this connection through a block yielding a Notifyd::Builder
    #
    # @example:
    #   client = Notifyd::Client.new(url: "https://notifyd", hmac_key: "abc") do |build|
    #     build.use_retry stats: DogStats.new
    #     build.conn.use SomeMiddleware
    #   end
    #
    # To provide your own faraday connection (which must do its own hmac signing) use the method
    # .with_conn
    #
    # This object is essentially a collection of clients for each twirp API service
    # Twirp API clients usually follow the following name convention:
    #
    #   Notifyd::Proto::Subscriptions::SubscriptionsClient
    #
    # Given this convention, it's possible to access a client by using the namespace
    # (i.e Subscriptions) in underscore form as a method name
    #
    #   client.subscriptions #=> #<Notifyd::Proto::Subscriptions::SubscriptionsClient>
    #
    # This client instance is built automatically following the name convention
    #
    # NOTE: If a client has a different name, define a specific method for it
    def initialize(url:, hmac_key:, &block)
      # NOTE: If you are updating the method's signature, don't forget to
      #   update the file rbi/notifyd/client.rbi with the typed version
      block ||= ->(_) {}
      @connection = Faraday.new(url: append_twirp_to_url(url)) do |conn|
        conn.options.timeout = CLIENT_TIMEOUT_IN_SECONDS

        builder = Notifyd::Builder.new(conn:)

        # Mandatory plugs
        builder.use_hmac_auth key: hmac_key

        # Setup default adapter. This can be overriden in the builder block
        builder.use_adapter *Faraday.default_adapter

        builder.tap(&block).build
      end

      after_initialize
    end

    def device_tokens
      @device_tokens_client ||= Notifyd::Proto::DeviceTokensClient.new(connection)
    end

    # Automatically build clients that follow the name convention:
    # Notifyd::Proto::Namespace::NamespaceClient
    #
    # Where Namespace can be: Subscriptions, RoutingSettings or any other service
    #
    # Example:
    #   client.subscriptions
    #   #=> #<Notifyd::Proto::Subscriptions::SubscriptionsClient>
    #   client.routing_settings
    #   #=> #<Notifyd::Proto::RoutingSettings::RoutingSettingsClient>
    def method_missing(symbol, *args, &block)
      return super if has_mark?(symbol)
      return @clients[symbol] if @clients.key?(symbol)

      name = client_name(symbol)
      return super unless client_exists?(name)

      # Return the client and cache it
      client_builder(name).new(connection).tap { |cl| @clients[symbol] = cl }
    end

    def respond_to_missing?(symbol, *)
      return super if has_mark?(symbol)
      return true if @clients.key?(symbol)
      return true if client_exists?(client_name(symbol))

      super
    end

    private

    attr_reader :connection

    def after_initialize
      @clients = {}
    end

    def append_twirp_to_url(base_url)
      uri = URI(base_url)
      uri.path = "#{uri.path}/twirp"

      uri.to_s
    end

    def has_mark?(symbol)
      symbol.match?(/[\?!]$/)
    end

    # Clients are usually namespaced and suffixed with Client
    # They live inside the Notifyd::Proto module
    #
    # Example: routing_settings => RoutingSettings::RoutingSettingsClient
    def client_name(symbol)
      # Camelize the name
      mod = symbol.to_s.split("_").map(&:capitalize).join("")
      return "#{mod}::#{mod}Client"
    end

    def client_exists?(name)
      Notifyd::Proto.const_defined?(name)
    end

    def client_builder(name)
      Notifyd::Proto.const_get(name)
    end
  end
end
