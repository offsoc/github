# frozen_string_literal: true

require_relative "../test_helper"
require_relative "../authzd_server_helper"

module Authzd
  module Enumerator
    class TwirpClientTest < Minitest::Test
      PORT = "18082"
      INVALID_TWIRP_URL = "http://#{SERVER_ADDR}"

      def test_bad_route_error
        start_server(SERVER_ADDR, out: STDOUT)
        client = Authzd::Enumerator::Client.new(INVALID_TWIRP_URL)

        resp = client.for_actor(Authzd::Enumerator::ForActorRequest.new)
        assert_instance_of Twirp::ClientResp, resp
        assert_equal "bad_route", resp.error.msg

        resp = client.for_subject(Authzd::Enumerator::ForSubjectRequest.new)
        assert_instance_of Twirp::ClientResp, resp
        assert_equal "bad_route", resp.error.msg
      ensure
        stop_server
      end

      def test_headers_are_forwarded
        start_server(SERVER_ADDR, bin_path: "ruby ruby/test/twirp_server_helper.rb", port: PORT, out: STDOUT)
        client = create_enumerator_client

        resp = client.for_actor(for_actor_request, result_ids: [1, 2])
        assert_instance_of Twirp::ClientResp, resp
        assert_nil resp.error
        assert_equal [1, 2], resp.data.result_ids

        resp = client.for_subject(for_subject_request, result_ids: [10, 20])
        assert_instance_of Twirp::ClientResp, resp
        assert_nil resp.error
        assert_equal [10, 20], resp.data.result_ids
      ensure
        stop_server
      end
    end
  end
end
