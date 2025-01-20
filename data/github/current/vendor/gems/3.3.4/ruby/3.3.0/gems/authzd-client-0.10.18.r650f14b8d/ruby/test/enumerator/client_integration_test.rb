# frozen_string_literal: true

require_relative "../test_helper"
require_relative "../authzd_server_helper"

module Authzd
  module Enumerator
    class ClientIntegrationTest < Minitest::Test
      include Minitest::Hooks

      def before_all
        start_server(SERVER_ADDR, out: $stdout)
      end

      def after_all
        stop_server
      end

      def setup
        ::Resilient::CircuitBreaker::Registry.default.reset
      end

      def test_valid_hmac
        client = create_enumerator_client

        resp = client.for_actor(for_actor_request)
        assert_nil resp.error
        assert_empty resp.data.result_ids

        resp = client.for_subject(for_subject_request)
        assert_nil resp.error
        assert_empty resp.data.result_ids
      end

      def test_invalid_hmac
        client = create_enumerator_client(hmac_secret: "foobar")

        resp = client.for_actor(for_actor_request)
        assert resp.error
        assert_match /HMAC .* is invalid/, resp.error.msg

        resp = client.for_subject(for_subject_request)
        assert resp.error
        assert_match /HMAC .* is invalid/, resp.error.msg
      end

      def test_twirp_methods
        client = create_enumerator_client
        response = client.for_actor(for_actor_request)
        refute response.error, "unexpected Twirp error: #{response.error&.msg}"
        assert_empty response.data.result_ids

        response = client.for_subject(for_subject_request)
        refute response.error, "unexpected Twirp error: #{response.error&.msg}"
        assert_empty response.data.result_ids
      end

      def test_invalid_scope
        response = create_enumerator_client.for_actor(for_actor_request(scope: "a_scope"))
        assert response.error, "expected Twirp error"
        assert_equal :invalid_argument, response.error.code
        assert_equal "invalid_scope", response.error.meta["enumerator_error_code"]
      end

      def test_invalid_relationship
        response = create_enumerator_client.for_actor(for_actor_request(relationship: "a_rel"))
        assert response.error, "expected Twirp error"
        assert_equal :invalid_argument, response.error.code
        assert_equal "invalid_relationship", response.error.meta["enumerator_error_code"]
      end

      def test_invalid_actor_id
        response = create_enumerator_client.for_actor(for_actor_request(actor_id: 0))
        assert response.error, "expected Twirp error"
        assert_equal :invalid_argument, response.error.code
        assert_equal "invalid_origin", response.error.meta["enumerator_error_code"]
      end

      # The Enumerator client is currently compatible with the Timing, CircuitBreaker, and
      # HmacSignature middlewares, so testing for all of those here. The remaining middlewares
      # are Retry (to be updated later, so it can be compatible with Enumerator and will then
      # add it to this test) and ResponseWrapper (which is not designed to be used with the
      # Enumerator client).
      def test_all_middleware_smoke_test
        client = Authzd::Enumerator::Client.new(TWIRP_ADDR) do |client|
          client.use :for_actor, with: [
            Authzd::Middleware::Timing.new(instrumenter: Debug),
            Authzd::Middleware::CircuitBreaker.new(instrumenter: Debug),
            Authzd::Middleware::HmacSignature.new(instrumenter: Debug, key: "authzdhmac")
          ]

          client.use :for_subject, with: [
            Authzd::Middleware::Timing.new(instrumenter: Debug),
            Authzd::Middleware::CircuitBreaker.new(instrumenter: Debug),
            Authzd::Middleware::HmacSignature.new(instrumenter: Debug, key: "authzdhmac")
          ]
        end

        response = client.for_actor(for_actor_request)
        refute response.error, "unexpected Twirp error: #{response.error&.msg}"
        assert_empty response.data.result_ids

        response = client.for_subject(for_subject_request)
        refute response.error, "unexpected Twirp error: #{response.error&.msg}"
        assert_empty response.data.result_ids
      end
    end
  end
end
