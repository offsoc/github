# typed: true
# frozen_string_literal: true

require "openssl"
require "faraday"

module Notifyd
  # Faraday middleware that inserts an HMAC Authentication header into requests.
  # Copied from https://github.com/github/github/blob/c644054df984b64bde6d4ceebd3821458db8bf0e/lib/github/faraday_middleware.rb
  class HMACAuthMiddleware < ::Faraday::Middleware
    HMAC_AUTH_HEADER = "Request-HMAC".freeze

    # Public: Initialize the middleware with an HMAC key
    #
    # app      - The faraday application/middlewares stack.
    # hmac_key - String HMAC secret key.
    # hmac_header - (Optional) String HTTP header to send the HMAC token in.
    def initialize(app, options = {})
      super(app)
      @hmac_key = options[:hmac_key]
      @hmac_header = options.fetch(:header, HMAC_AUTH_HEADER).freeze
    end

    def call(env)
      env.request_headers[@hmac_header] = hmac_token
      @app.call(env)
    end

    private

    def hmac_token
      return "" if @hmac_key.strip.empty?
      timestamp = Time.now.to_i.to_s
      digest = OpenSSL::Digest::SHA256.new
      hmac = OpenSSL::HMAC.new(@hmac_key, digest)
      hmac << timestamp
      "#{timestamp}.#{hmac}"
    end
  end
end
