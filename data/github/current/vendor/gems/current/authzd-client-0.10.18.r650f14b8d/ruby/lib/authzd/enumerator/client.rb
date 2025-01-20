# frozen_string_literal: true

# Define the Authzd namespace for generated Ruby
module Authzd; end

require_relative "../proto/enumerator_pb"
require_relative "../proto/enumerator_twirp"
require_relative "../decoratable"
require_relative "../middleware/base"
require_relative "../middleware/hmac_signature"

module Authzd
  module Enumerator
    class Client
      include Authzd::Decoratable

      attr_reader :twirp_stub, :conn

      # Initializes a new Client
      # - conn: the Faraday::Connection or the server address.
      #         If passed as String, the Faraday::Connection will be created with default configuration
      # - block: (optional) a block receiving this same instance that is used to initialize
      #   the middleware stack for this class services
      #
      def initialize(conn)
        @conn = conn
        @twirp_stub = ::Authzd::Enumerator::EnumeratorClient.new(conn)
        yield self if block_given?
      end

      # Forwards the actor's subject enumeration request to the server.
      #
      # Params:
      # - request: an Authzd::Enumerator::ForActorRequest describing the
      #            types of subjects that we want to enumerate for the actor.
      #
      # Retuns Authzd::Enumerator::ForActorResponse
      def for_actor(request, metadata = {})
        @twirp_stub.for_actor(request, { headers: metadata })
      end

      # Forwards the subject's actor enumeration request to the server.
      #
      # Params:
      # - request: an Authzd::Enumerator::ForSubjectRequest describing the
      #            types of actors that we want to enumerate for the subject.
      #
      # Retuns Authzd::Enumerator::ForSubjectResponse
      def for_subject(request, metadata = {})
        @twirp_stub.for_subject(request, { headers: metadata })
      end
    end
  end
end
