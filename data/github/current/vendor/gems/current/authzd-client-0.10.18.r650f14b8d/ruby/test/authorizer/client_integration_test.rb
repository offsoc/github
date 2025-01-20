# frozen_string_literal: true

require_relative "../test_helper"
require_relative "../authzd_server_helper"

module Authzd
  module Authorizer
    class ClientIntegrationTest < Minitest::Test
      include Minitest::Hooks

      SERVER_ADDR = "127.0.0.1:18082"
      TWIRP_ADDR = "http://#{SERVER_ADDR}/twirp/"

      def before_all
        start_server(SERVER_ADDR, out: $stdout)
      end

      def after_all
        stop_server
      end

      def test_twirp_methods
        client = Authzd::Authorizer::Client.new(TWIRP_ADDR)

        request = Authzd::Proto::Request.new
        decision = client.authorize(request)
        assert_equal :DENY, decision.result

        request1 = Authzd::Proto::Request.new
        request2 = Authzd::Proto::Request.new
        batch_request_multi = Authzd::Proto::BatchRequest.new(requests: [request1, request2])
        batch_decision = client.batch_authorize(batch_request_multi)

        assert_equal 2, batch_decision.decisions.count
        assert_equal :DENY, batch_decision.decisions.first.result
      end

      def test_all_middleware_smoke_test
        ::Resilient::CircuitBreaker::Registry.default.reset
        conn = Faraday.new(url: TWIRP_ADDR) do |f|
          f.adapter(:net_http)
          f.options[:timeout] = 5
          f.options[:open_timeout] = 5
        end
        client = Authzd::Authorizer::Client.new(conn) do |client|
          client.use :authorize, with: [
              Authzd::Middleware::Timing.new(instrumenter: Debug),
              Authzd::Middleware::ResponseWrapper.new(instrumenter: Debug),
              Authzd::Middleware::Retry.new(instrumenter: Debug),
              Authzd::Middleware::CircuitBreaker.new(instrumenter: Debug),
          ]
        end

        decision = client.authorize(Authzd::Proto::Request.new)
        assert_equal :DENY, decision.result, "reason: #{decision.reason}"
      end
    end
  end
end
