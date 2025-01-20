# frozen_string_literal: true

require_relative "test_helper"
require_relative "timeline_server_helper"

module Timeline
  class ClientIntegrationTest < Minitest::Test
    include Minitest::Hooks

    MAX_NUMBER = 92233720368
    SERVER_ADDR = "127.0.0.1:8991"
    TWIRP_ADDR = "http://#{SERVER_ADDR}/twirp/"

    def test_get
      start_server(SERVER_ADDR)
      client = Timeline::Client.new(TWIRP_ADDR, ENV.fetch("HMAC_KEY", "timelinedhmac"))

      entity = { id: 1, type: "issue" }
      viewer =  { id: 1 }
      response = client.get(entity, viewer)
      assert_nil response.error
    end

    def test_get_without_hmac
      start_server(SERVER_ADDR)
      client = Timeline::Client.new(TWIRP_ADDR, nil)

      entity = { id: 1, type: "issue" }
      viewer =  { id: 1 }
      response = client.get(entity, viewer)
      assert response.error
      assert_includes response.error.meta[:body], "request hmac is missing"
    end
  end
end
