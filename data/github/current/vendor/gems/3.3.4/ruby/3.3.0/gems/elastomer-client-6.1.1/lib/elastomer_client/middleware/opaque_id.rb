# frozen_string_literal: true

require "securerandom"

module ElastomerClient
  module Middleware

    # This Faraday middleware implements the "X-Opaque-Id" request / response
    # headers for Elasticsearch. The X-Opaque-Id header, when provided on the
    # request header, will be returned as a header in the response. This is
    # useful in environments which reuse connections to ensure that cross-talk
    # does not occur between two requests.
    #
    # The SecureRandom lib is used to generate a UUID string for each request.
    # This value is used as the content for the "X-Opaque-Id" header. If the
    # value is different between the request and the response, then an
    # `ElastomerClient::Client::OpaqueIdError` is raised. In this case no response
    # will be returned.
    #
    # See [Elasticsearch "X-Opaque-Id"
    # header](https://github.com/elasticsearch/elasticsearch/issues/1202)
    # for more details.
    class OpaqueId < ::Faraday::Middleware
      X_OPAQUE_ID = "X-Opaque-Id".freeze
      COUNTER_MAX = 2**32 - 1

      # Faraday middleware implementation.
      #
      # env - Faraday environment Hash
      #
      # Returns the environment Hash
      def call(env)
        uuid = generate_uuid.freeze
        env[:request_headers][X_OPAQUE_ID] = uuid

        @app.call(env).on_complete do |renv|
          response_uuid = renv[:response_headers][X_OPAQUE_ID]
          # Don't raise OpaqueIdError if the response is a 5xx
          if !response_uuid.nil? && uuid != response_uuid && renv.status < 500
            raise ::ElastomerClient::Client::OpaqueIdError,
                  "Conflicting 'X-Opaque-Id' headers: request #{uuid.inspect}, response #{response_uuid.inspect}"
          end
        end
      end

      # Generate a UUID using the built-in SecureRandom class. This can be a
      # little slow at times, so we will reuse the same UUID and append an
      # incrementing counter.
      #
      # Returns the UUID string.
      def generate_uuid
        t = Thread.current

        unless t.key? :opaque_id_base
          t[:opaque_id_base]    = (SecureRandom.urlsafe_base64(12) + "%08x").freeze
          t[:opaque_id_counter] = -1
        end

        t[:opaque_id_counter] += 1
        t[:opaque_id_counter] = 0 if t[:opaque_id_counter] > COUNTER_MAX
        t[:opaque_id_base] % t[:opaque_id_counter]
      end

    end  # OpaqueId
  end  # Middleware

  # Error raised when a conflict is detected between the UUID sent in the
  # 'X-Opaque-Id' request header and the one received in the response header.
  Client::OpaqueIdError = Class.new Client::Error

end  # ElastomerClient

Faraday::Request.register_middleware \
  opaque_id: ElastomerClient::Middleware::OpaqueId
