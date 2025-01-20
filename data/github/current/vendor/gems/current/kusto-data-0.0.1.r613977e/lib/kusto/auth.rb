# typed: true
# frozen_string_literal: true

module Kusto
  module Auth
    class AuthBase
      extend T::Sig
      extend T::Helpers

      abstract!

      sig { params(tenant_id: String, client_id: String).void }
      def initialize(tenant_id, client_id)
        raise ArgumentError, "tenant_id cannot be empty" if tenant_id.empty?
        raise ArgumentError, "client_id cannot be empty" if client_id.empty?

        @tenant_id = tenant_id
        @client_id = client_id

        @token_uri = T.let(URI.parse("#{oauth_base_url}/token"), URI::Generic)
        @token = nil
        @expiry = nil
      end

      sig(:final) { params(cluster_url: String, force_refresh: T::Boolean).returns(String) }
      def access_token(cluster_url, force_refresh: false)
        return @token if @token && @expiry && Time.now.utc < @expiry && !force_refresh

        token_hash = get_access_token cluster_url

        @token = token_hash["access_token"]
        @expiry = Time.now.utc + token_hash["expires_in"].to_i

        return @token
      end

      protected

      sig { returns(String) }
      def tenant_id
        @tenant_id
      end

      sig { returns(String) }
      def client_id
        @client_id
      end

      sig { returns(String) }
      def oauth_base_url
        "https://login.microsoftonline.com/#{@tenant_id}/oauth2/v2.0"
      end

      sig { returns(URI::Generic) }
      def token_uri
        @token_uri
      end

      sig { abstract.params(cluster_url: String).returns(T::Hash[String, T.untyped]) }
      def get_access_token(cluster_url); end
    end
  end
end
