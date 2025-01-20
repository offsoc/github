# frozen_string_literal: true
# typed: strict

require_relative "request_hmac"

module Proto
  module TrustMetadataApi
    module Client
      extend T::Sig
      # Public: Create a new client connection for use with the Trust Metadata API.
      #
      # twirp_api_url  - the URL of the Twirp API.
      # hmac_key       - HMAC key
      # hmac_client_id - HMAC client ID
      sig { params(twirp_api_url: String, hmac_key: String, hmac_client_id: String).returns(Faraday::Connection) }
      def self.connection(twirp_api_url, hmac_key, hmac_client_id)
        # setup the faraday connection using the Twirp API url and Request-HMAC middleware
        Faraday.new(url: twirp_api_url) do |conn|
          # use the Request-HMAC middleware
          conn.use Proto::TrustMetadataApi::RequestHMAC, hmac_key, hmac_client_id
          conn.adapter Faraday.default_adapter
        end
      end

      class Error < StandardError
        extend T::Sig
        sig { params(msg: String).void }
        def initialize(msg)
          super(msg)
        end

        # Public: Respond to error with the error message.
        sig { returns(String) }
        def error
          self.message
        end
      end
    end
  end
end
