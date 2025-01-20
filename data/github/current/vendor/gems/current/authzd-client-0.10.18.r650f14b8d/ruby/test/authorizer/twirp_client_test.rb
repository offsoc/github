# frozen_string_literal: true

require_relative "../test_helper"
require_relative "../authzd_server_helper"

module Authzd
  module Authorizer
    class TwirpClientTest < Minitest::Test
      PORT = "18082"
      SERVER_ADDR = "127.0.0.1:#{PORT}"
      INVALID_TWIRP_URL = "http://#{SERVER_ADDR}"
      TWIRP_URL = "http://#{SERVER_ADDR}/twirp"

      def test_bad_route_error
        start_server(SERVER_ADDR, out: STDOUT)
        client = Authzd::Authorizer::Client.new(INVALID_TWIRP_URL)
        decision = client.authorize(Authzd::Proto::Request.new)

        assert_equal :INDETERMINATE, decision.result
        assert_equal "bad_route", decision.reason
      ensure
        stop_server
      end

      def test_timeout_error
        conn = Faraday.new(url: "http://10.255.255.255") do |f|
          f.adapter(:net_http)
          f.options[:timeout] = 0.01
          f.options[:open_timeout] = 0.01
        end
        client = Authzd::Authorizer::Client.new(conn)
        assert_raises Faraday::ConnectionFailed do
          client.authorize(Authzd::Proto::Request.new)
        end
      ensure
        stop_server
      end

      # tests that the authzd twirp client passes "metadata" as HTTP headers
      def test_headers_are_forwarded
        start_server(SERVER_ADDR, bin_path: "ruby ruby/test/twirp_server_helper.rb", port: PORT, out: STDOUT)
        client = Authzd::Authorizer::Client.new(TWIRP_URL)
        decision = client.authorize(Authzd::Proto::Request.new, result: "INDETERMINATE", reason: "dope")

        assert_equal :INDETERMINATE, decision.result
        assert_equal "dope", decision.reason
      ensure
        stop_server
      end
    end
  end
end
