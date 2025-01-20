# frozen_string_literal: true

require_relative "../proto/authentication/v0/attributes_pb"
require_relative "../proto/authentication/v0/authentication_api_pb"
require_relative "../proto/authentication/v0/authentication_api_twirp"
require_relative "../proto/authentication/v0/credentials_pb"
require_relative "../credentials_extensions"
require_relative "../attribute_extensions"
require_relative "../response_extensions"
require_relative "../errors"
require_relative "../response"
require_relative "../version"
require_relative "./middleware/retry"
require_relative "./middleware/timing"
require_relative "./faraday_middleware/hmac_auth"
require_relative "./faraday_middleware/tenant_context"
require_relative "./decoratable"

module Authnd
  module Client
    class ServiceClientBase
      include Authnd::Client::Decoratable

      # Intializes a new Authenticator Client
      # - connection: the Faraday::Connection
      # - block: (optional) a block receiving this same instance that is used to initialize
      #   the middleware stack for this class services
      #
      def initialize(connection, catalog_service:)
        raise ArgumentError, "connection is not a Faraday::Connection" unless connection.is_a? Faraday::Connection

        @connection = connection
        @connection.headers["Catalog-Service"] = catalog_service
        @connection.headers["User-Agent"] = "authnd-ruby/#{Authnd::VERSION}"

        @twirp_client = create_twirp_client(@connection)
        yield self if block_given?
      end

      protected

      def create_twirp_client(_connection)
        raise "This must be implemented in a derived class"
      end
    end
  end
end
