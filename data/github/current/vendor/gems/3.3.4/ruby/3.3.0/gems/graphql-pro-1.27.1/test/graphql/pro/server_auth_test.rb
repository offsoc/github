# frozen_string_literal: true
require "test_helper"
require "open-uri"

class ServerAuthTest < Minitest::Test
  parallelize_me!

  def test_make_sure_gems_server_requires_auth
    WebMock.allow_net_connect!

    urls = [
      "https://gems.graphql.pro",
      "http://gems.graphql.pro"
    ]

    urls.each do |url|
      err = assert_raises OpenURI::HTTPError do
        URI.open(url)
      end

      assert_equal "401 Unauthorized", err.message, "#{url} returns 401"
    end
  ensure
    WebMock.disable_net_connect!
  end
end
