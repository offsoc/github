# frozen_string_literal: true

module BillingPlatform
  module Twirp
    module HMAC
      # Faraday middleware to HMAC sign requests from Twirp.
      class RequestSigningMiddleware
        HMAC_ALGORITHM = "sha256"
        HMAC_HEADER = "Request-HMAC"

        def initialize(app, key)
          @app = app
          @key = key
        end

        def call(env)
          env[:request_headers][HMAC_HEADER] = request_hmac(Time.now, @key)
          @app.call(env)
        end

        private

        def request_hmac(time, key)
          timestamp = time.to_i.to_s
          hmac = OpenSSL::HMAC.hexdigest(HMAC_ALGORITHM, key, timestamp)
          "#{timestamp}.#{hmac}"
        end
      end
    end
  end
end
