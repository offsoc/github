# typed: true
# frozen_string_literal: true

require "notifyd/retry_plug"
require "notifyd/hmac_auth_plug"
require "notifyd/adapter_plug"

module Notifyd
  # The Builder setups a given Faraday::Connection with a set of plugs.
  # It also exposes the connection so any client can add their own Faraday
  # middlewares.
  class Builder
    attr_reader :plugs, :conn

    def initialize(conn:)
      @conn = conn
      @plugs = []
      @adapter_plug = nil
    end

    # Use RetryPlug
    def use_retry(stats: nil)
      use RetryPlug.new(stats:)
    end

    # Use HMACAuthPlug
    def use_hmac_auth(key:)
      use HMACAuthPlug.new(key:)
    end

    # Use AdapterPlug
    def use_adapter(key, *args, &block)
      @adapter_plug = AdapterPlug.new(key, args, block)
    end

    # Use a given plug
    def use(plug)
      plugs.push plug
    end

    def build
      plugs.each do |plug|
        plug.inject(conn)
      end

      # The adapter has to be setup after any other middleware,
      # that's why this is another step in the build process
      @adapter_plug.inject(conn) if @adapter_plug
    end
  end
end
