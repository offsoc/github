# frozen_string_literal: true

require "openssl"
require "time"

module S4 
  module V1
    class Client
      class HMACNotConfiguredError < StandardError
        def message
          "HMAC is not configured correctly, please set the HMAC_KEY environment variable"
        end
      end

      class HMACMiddleware < Faraday::Middleware
        def initialize(app, hmac_key)
          @hmac_key = hmac_key
          super(app)
        end

        def hmac_token
          return "" if @hmac_key.empty?
          timestamp = Time.now.to_i.to_s
          digest = OpenSSL::Digest::SHA256.new
          hmac = OpenSSL::HMAC.new(@hmac_key, digest)
          hmac << timestamp
          "#{timestamp}.#{hmac}"
        end

        def call(env)
          if @hmac_key.empty?
            raise HMACNotConfiguredError.new
          end
          env.request_headers["Request-HMAC"] = hmac_token
          @app.call(env)
        end
      end
    end
  end
end
