# typed: true
# frozen_string_literal: true

require "notifyd/plug"
require "notifyd/hmac_auth_middleware"

module Notifyd
  # The HMACAuthPlug ensures that the Faraday::Connection uses HMAC Auth in every request
  # @see HMACAuthMiddleware
  class HMACAuthPlug
    include Plug

    attr_reader :key

    def initialize(key:)
      @key = key
    end

    def inject(conn)
      conn.use HMACAuthMiddleware, hmac_key: key
    end
  end
end
