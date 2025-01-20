# frozen_string_literal: true

require_relative "../test_helper"

module Authzd
  module Enumerator
    class ClientTest < Minitest::Test

      UNROUTABLE_ADDRESS = "http://10.255.255.255"

      def test_supports_string_addr
        client = Authzd::Enumerator::Client.new(UNROUTABLE_ADDRESS)
        assert_equal UNROUTABLE_ADDRESS, client.conn
      end

      def test_supports_faraday_conn
        conn = Faraday.new(url: UNROUTABLE_ADDRESS)
        client = Authzd::Enumerator::Client.new(conn)
        assert_equal conn, client.conn
      end

      def test_raises_on_invalid_addr
        assert_raises(ArgumentError) do
          Authzd::Enumerator::Client.new(1)
        end
      end

      def test_reports_twirp_error
        client = Authzd::Enumerator::Client.new(UNROUTABLE_ADDRESS)
        req = Authzd::Enumerator::ForActorRequest.new
        mocked_error = Twirp::Error.bad_route("twirp error")
        mocked_error.meta["test"] = "meta"
        mocked_response = Twirp::ClientResp.new(error: mocked_error)
        client.twirp_stub.expects(:for_actor)
              .with(req, { headers: { test: "asd" } })
              .returns(mocked_response)

        resp = client.for_actor(req, { test: "asd" })
        assert_instance_of Twirp::ClientResp, resp
        assert resp.error
        assert_equal :bad_route, resp.error.code
        assert_equal "twirp error", resp.error.msg
        assert_equal "meta", resp.error.meta["test"]
      end
    end
  end
end
