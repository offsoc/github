# typed: true
# frozen_string_literal: true

require "net/http"
require "uri"
require "json"
require "kusto/auth"

module Kusto
  module Auth
    class AppAuth < Auth::AuthBase
      sig { params(tenant_id: String, client_id: String, client_secret: String).void }
      def initialize(tenant_id, client_id, client_secret)
        super tenant_id, client_id

        raise ArgumentError, "client_secret cannot be empty" if client_secret.empty?

        @client_secret = client_secret
      end

      sig { override.params(cluster_url: String).returns(T::Hash[String, T.untyped]) }
      def get_access_token(cluster_url)
        token_request = Net::HTTP::Post.new(token_uri)
        token_request.set_form_data(
          grant_type: "client_credentials",
          client_id: client_id,
          client_secret: @client_secret,
          scope: "#{cluster_url}/.default"
        )

        token_response = Net::HTTP.start(token_uri.hostname, token_uri.port, use_ssl: token_uri.scheme == "https") do |http|
          http.request(token_request)
        end

        raise Errors.create_error("An error occurred while acquiring an access token.", token_response) if token_response.code.to_i != 200

        JSON.parse(token_response.body)
      end
    end
  end
end
