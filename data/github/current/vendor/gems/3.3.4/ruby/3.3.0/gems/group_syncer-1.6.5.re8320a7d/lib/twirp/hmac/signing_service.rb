# frozen_string_literal: true

require "openssl"

module Twirp
  module HMAC
    # Service for computing HMAC signatures for Twirp requests.
    #
    # Used by Twirp backend Service and Client.
    class SigningService
      def initialize(key:, digest: OpenSSL::Digest::SHA256.new)
        @hmac = OpenSSL::HMAC.new(key, digest)
      end

      # Public: Generate an HMAC signature for the given request parameters.
      #
      # Returns a String base64 hexdigest of the HMAC signature.
      def generate_signature(service:, rpc_method:, content_type:, body:)
        @hmac.reset
        @hmac << service
        @hmac << rpc_method
        @hmac << content_type
        @hmac << body
        @hmac.hexdigest
      end

      # Public: Validates a Twirp request to the service.
      #
      # Returns Boolean whether the request is signed correctly or not.
      def valid_request?(service, rack_env, env)
        request_signature = rack_env["HTTP_X_SIGNATURE"]

        # HACK: Twirp has already decoded the body, so reencode it to compute signature
        body = Twirp::Encoding.encode(env[:input], env[:input_class], env[:content_type])

        expected_signature = generate_signature(
          service: service,
          rpc_method: env[:rpc_method].to_s,
          content_type: env[:content_type],
          body: body,
        )

        # always perform `secure_compare` so that we don't leak timing information
        equivalent = Rack::Utils.secure_compare(expected_signature.to_s, request_signature.to_s)
        equivalent && !request_signature.to_s.empty? && !expected_signature.to_s.empty?
      end
    end
  end
end
