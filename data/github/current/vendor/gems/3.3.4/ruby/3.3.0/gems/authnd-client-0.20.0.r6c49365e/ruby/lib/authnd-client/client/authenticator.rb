# frozen_string_literal: true

require "active_support"
require "active_support/core_ext"
require_relative "./service_client_base"

module Authnd
  module Client
    class Authenticator < ServiceClientBase
      def authenticate(request, headers: {})
        with_timeout_factor(headers) do
          Authnd::Client::CredentialValidator.new.validate(request.credentials)

          twirp_resp = @twirp_client.authenticate(request, headers: headers)
          raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

          Authnd::Response.from_twirp(twirp_resp.data)
        end
      end

      protected

      def create_twirp_client(connection)
        Authnd::Proto::AuthenticatorClient.new connection
      end

      private

      # changes Faraday timeout using a factor passed through headers
      # unfortunately Ruby Twirp implementation does not allow
      # passing request specific parameters
      #
      # this is not thread safe
      def with_timeout_factor(headers)
        timeout_factor = headers.delete(Authnd::Client::Middleware::Retry::METADATA_TIMEOUT_FACTOR)
        return yield unless timeout_factor

        begin
          timeout = @connection.options[:timeout]
          open_timeout = @connection.options[:open_timeout]
          @connection.options[:timeout] = timeout_factor * timeout if timeout
          @connection.options[:open_timeout] = timeout_factor * open_timeout if open_timeout

          yield
        ensure
          @connection.options[:timeout] = timeout if timeout
          @connection.options[:open_timeout] = open_timeout if open_timeout
        end
      end
    end
  end
end
