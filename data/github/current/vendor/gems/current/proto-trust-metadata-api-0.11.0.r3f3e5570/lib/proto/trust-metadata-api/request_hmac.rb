# frozen_string_literal: true
# typed: strict

# Faraday Middleware to sign Request-HMAC headers with the client's HMAC key.
#
# See https://lostisland.github.io/faraday
require 'base64'
require 'openssl'
require 'faraday'

module Proto
  module TrustMetadataApi
    class RequestHMAC < Faraday::Middleware
      extend T::Sig
      ALGORITHM = T.let("sha256".freeze, String)

      # Internal: Configure the middleware instance.
      #
      # app            - A Faraday::Adapter::NetHttp instance.
      # hmac_key       - HMAC key
      # hmac_client_id - HMAC Client ID
      sig { params(app: T.untyped, hmac_key: String, hmac_client_id: String).void }
      def initialize(app, hmac_key, hmac_client_id)
        super(app)

        @app       = T.let(app, T.untyped)
        @hmac_key  = T.let(hmac_key, String)
        @client_id = T.let(hmac_client_id, String)
      end

      # Internal: Execute the middleware logic.
      #
      # Used by Faraday's Rack-inspired middleware stack.
      sig { params(env: T.untyped).returns(T.any(T::Array[Integer], Faraday::Response)) }
      def call(env)
        env[:request_headers]["X-HMAC-Client-Id"]  = @client_id
        env[:request_headers]["Request-Body-HMAC"] = generate_body_hmac(@hmac_key, env[:body])
        env[:request_headers]["Request-HMAC"]      = generate_hmac_header(@hmac_key)

        @app.call(env)
      end

      private

      # Private: Generate the HMAC body value.
      #
      # hmac_key - the HMAC key.
      # body     - the request body.
      #
      # Returns a String.
      sig { params(hmac_key: String, body: String).returns(String) }
      def generate_body_hmac(hmac_key, body)
        hmac = OpenSSL::HMAC.digest(ALGORITHM, hmac_key, body)
        Base64.strict_encode64(hmac)
      end

      # Private: Generate the HMAC header value.
      #
      # hmac_key - the HMAC key.
      #
      # Returns a String.
      sig { params(hmac_key: String).returns(String) }
      def generate_hmac_header(hmac_key)
        timestamp = Time.now.to_i.to_s
        hmac      = OpenSSL::HMAC.hexdigest(ALGORITHM, hmac_key, timestamp)

        "#{timestamp}.#{hmac}"
      end
    end
  end
end
