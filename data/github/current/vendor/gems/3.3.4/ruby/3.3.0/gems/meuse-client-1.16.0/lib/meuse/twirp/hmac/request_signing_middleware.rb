# frozen_string_literal: true

module Meuse
  module Twirp
    module HMAC
      # Faraday middleware to HMAC sign requests from Twirp.
      class RequestSigningMiddleware
        def initialize(app, signing_service)
          @app = app
          @hmac_service = signing_service
        end

        def call(env)
          env[:request_headers]["X-Signature"] = @hmac_service.request_hmac(Time.current)
          @app.call(env)
        end
      end
    end
  end
end
