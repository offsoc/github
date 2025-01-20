# frozen_string_literal: true

require "openssl"
require_relative "base"

module Authzd
  module Middleware
    class HmacSignature < Base

      ALGORITHM = "sha256"
      HMAC_HEADER = "Request-HMAC"

      # Initializes a new instance of the middleware
      #
      def initialize(key:, instrumenter: Instrumenters::Noop)
        super()
        @instrumenter = instrumenter
        @hmac_key = key
      end

      # Generates and adds the HMAC header based on the passed in key
      #
      def perform(req, metadata = {})
        metadata[HMAC_HEADER] = request_hmac
        request.perform(req, metadata)
      end

      protected

      def middleware_name
        :hmac_signature
      end

      private

      def request_hmac
        hmac = OpenSSL::HMAC.hexdigest(ALGORITHM, @hmac_key, header_timestamp)
        "#{header_timestamp}.#{hmac}"
      end

      def header_timestamp
        Time.now.to_i.to_s
      end
    end
  end
end
