# frozen_string_literal: true

module Twirp
  module HMAC
    # Faraday middleware to HMAC sign requests from Twirp.
    class RequestSigningMiddleware
      def initialize(app, signing_service)
        @app = app
        @hmac_service = signing_service
      end

      def call(env)
        _, _twirp, service, rpc_method = env.url.path.split("/")
        content_type = env.request_headers["Content-Type"]
        body = env.body
        if signature = @hmac_service.generate_signature(service: service, rpc_method: rpc_method, content_type: content_type, body: body)
          env[:request_headers]["X-Signature"] = signature
        end
        @app.call(env)
      end
    end

  end
end
