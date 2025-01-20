# frozen_string_literal: true

require_relative "../test_helper"

module Authzd
  module Authorizer
    class ClientTest < Minitest::Test

      UNROUTABLE_ADDRESS = "http://10.255.255.255"

      def test_twirp_supports_addr_as_string
        client = Authzd::Authorizer::Client.new(UNROUTABLE_ADDRESS)
        refute_nil client.conn
      end

      def test_twirp_supports_addr_as_faraday_connection
        conn = Faraday.new(url: UNROUTABLE_ADDRESS)
        client = Authzd::Authorizer::Client.new(conn)
        assert_equal conn, client.conn
      end

      def test_raises_on_invalid_addr
        assert_raises(ArgumentError) do
          Authzd::Authorizer::Client.new(1)
        end
      end

      def test_returns_indeterminate_for_twirp_error
        client = Authzd::Authorizer::Client.new(UNROUTABLE_ADDRESS)
        req = Authzd::Proto::Request.new
        client.twirp_stub
            .expects(:authorize)
            .with(req, {:headers => {}})
            .returns(Twirp::ClientResp.new(error: Twirp::Error.bad_route("twirp error")))
        decision = client.authorize(req, {Authzd::Authorizer::Client::METADATA_TIMEOUT_FACTOR => 2})

        assert_equal :INDETERMINATE, decision.result
        assert_equal "twirp error", decision.reason
      end

      def test_restores_faraday_timeout_on_factor
        conn = Faraday.new(url: UNROUTABLE_ADDRESS) do |f|
          f.adapter(:net_http)
          f.options[:timeout] = 5
          f.options[:open_timeout] = 6
        end
        client = Authzd::Authorizer::Client.new(conn)
        req = Authzd::Proto::Request.new
        client.twirp_stub
            .expects(:authorize)
            .with(req, {:headers => {}})
            .returns(Twirp::ClientResp.new())
        client.authorize(req, {Authzd::Authorizer::Client::METADATA_TIMEOUT_FACTOR => 2})
        assert_equal 5, conn.options[:timeout]
        assert_equal 6, conn.options[:open_timeout]
      end

      def test_timeout_factor_ignored_if_no_timeout
        conn = Faraday.new(url: UNROUTABLE_ADDRESS)
        client = Authzd::Authorizer::Client.new(conn)
        req = Authzd::Proto::Request.new
        client.twirp_stub
            .expects(:authorize)
            .with(req, {:headers => {}})
            .returns(Twirp::ClientResp.new())
        client.authorize(req, {Authzd::Authorizer::Client::METADATA_TIMEOUT_FACTOR => 2})
        assert_nil conn.options[:timeout]
        assert_nil conn.options[:open_timeout]
      end

      def test_removes_internal_metadata
        client = Authzd::Authorizer::Client.new(UNROUTABLE_ADDRESS)
        metadata = {Authzd::Authorizer::Client::METADATA_TIMEOUT_FACTOR => 2}
        req = Authzd::Proto::Request.new
        client.twirp_stub
            .expects(:authorize)
            .with(req, {:headers => {}})
            .returns(Twirp::ClientResp.new())
        client.authorize(req, metadata)
        assert_empty metadata
      end

      def test_restores_timeout_on_exception
        conn = Faraday.new(url: UNROUTABLE_ADDRESS) do |f|
          f.adapter(:net_http)
          f.options[:timeout] = 5
          f.options[:open_timeout] = 6
        end
        client = Authzd::Authorizer::Client.new(conn)
        client.twirp_stub.expects(:authorize).raises(StandardError.new)
        assert_raises(StandardError)  do
          client.authorize(Authzd::Proto::Request.new, {Authzd::Authorizer::Client::METADATA_TIMEOUT_FACTOR => 2})
        end
        assert_equal 5, conn.options[:timeout]
        assert_equal 6, conn.options[:open_timeout]
      end

      def test_raises_with_empty_batch
        client = Authzd::Authorizer::Client.new(UNROUTABLE_ADDRESS)
        assert_raises(Authzd::Authorizer::Client::EmptyBatchRequestError)  do
          client.batch_authorize(Authzd::Proto::BatchRequest.new)
        end
      end
    end
  end
end
