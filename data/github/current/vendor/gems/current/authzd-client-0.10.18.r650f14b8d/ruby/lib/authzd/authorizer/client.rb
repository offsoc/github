# frozen_string_literal: true

# Define the Authzd namespace for generated Ruby
module Authzd; end

require_relative "../proto/proto_extensions"
require_relative "../proto/authorizer_pb"
require_relative "../proto/authorizer_twirp"
require_relative "../proto/enumerator_pb"
require_relative "../proto/enumerator_twirp"
require_relative "../proto/decision_extensions"
require_relative "../proto/batch_extensions"
require_relative "../proto/request_extensions"
require_relative "../decoratable"
require_relative "../errors"
require_relative "../response"
require_relative "../batch_response"
require_relative "../middleware/instrumenters/noop"
require_relative "../middleware/base"
require_relative "../middleware/retry"
require_relative "../middleware/circuit_breaker"
require_relative "../middleware/response_wrapper"
require_relative "../middleware/timing"

module Authzd
  module Authorizer
    class Client
      include Authzd::Decoratable

      EmptyBatchRequestError = Class.new(StandardError)

      # changes Faraday timeout by this factor for the provided request
      # wont be forwarded as header
      METADATA_TIMEOUT_FACTOR = "__timeout_factor__"

      attr_reader :twirp_stub, :conn

      # Initializes a new Client
      # - conn: the Faraday::Connection or the server address.
      #         If passed as String, the Faraday::Connection will be created with default configuration
      # - block: (optional) a block receiving this same instance that is used to initialize
      #   the middleware stack for this class services
      #
      def initialize(conn)
        @conn = conn
        @twirp_stub = ::Authzd::Proto::AuthorizerClient.new(conn)
        yield self if block_given?
      end

      # Sends the given Authzd::Request to the server and returns a
      # Authzd::Proto::Decision denoting the result of evaluating the authorization
      # request.
      #
      # Params:
      # - request: an Authzd::Proto::Request describing the authorization check that
      # has to be performed by authzd.
      #
      # Retuns Authzd::Proto::Decision
      def authorize(request, metadata = {})
        with_timeout_factor(metadata) do
          twirp_response = @twirp_stub.authorize(request, { headers: metadata })
          twirp_error_to_indeterminate(twirp_response)
        end
      end

      # Sends the given Authzd::Proto::BatchRequest to the server and returns a
      # Authzd::Proto::BatchDecision denoting the result of evaluating the multiple
      # Authzd::Proto::Request
      #
      # Params:
      # - batch_request: an Authzd::Proto::BatchRequest describing the multiple authorization
      # checks that have to be performed by authzd.
      #
      # Retuns Authzd::Proto::BatchDecision
      def batch_authorize(batch_request, metadata = {})
        raise EmptyBatchRequestError.new("batch_request is empty") if batch_request.requests.empty?
        with_timeout_factor(metadata) do
          twirp_response = @twirp_stub.batch_authorize(batch_request, { headers: metadata })
          twirp_error_to_indeterminate(twirp_response)
        end
      end

      private

      def twirp_error_to_indeterminate(twirp_response)
        if twirp_response.error
          Authzd::Proto::Decision.indeterminate(reason: twirp_response.error.msg)
        else
          twirp_response.data
        end
      end

      # changes Faraday timeout using a factor passed through metadata
      # unfortunately Ruby Twirp implementation does not allow
      # passing request specific parameters
      #
      # this is not thread safe
      def with_timeout_factor(metadata)
        timeout_factor = metadata.delete(METADATA_TIMEOUT_FACTOR)
        return yield unless timeout_factor
        return yield unless @conn.is_a? Faraday::Connection

        begin
          timeout = @conn.options[:timeout]
          open_timeout = @conn.options[:open_timeout]
          @conn.options[:timeout] = timeout_factor * timeout if timeout
          @conn.options[:open_timeout] = timeout_factor * open_timeout if open_timeout

          yield
        ensure
          @conn.options[:timeout] = timeout if timeout
          @conn.options[:open_timeout] = open_timeout if open_timeout
        end
      end
    end
  end
end
