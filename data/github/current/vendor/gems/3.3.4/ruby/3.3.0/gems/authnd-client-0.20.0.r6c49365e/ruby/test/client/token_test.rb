# frozen_string_literal: true

require_relative "../test_helper"

module Authnd
  module Client
    class TokenFormatTest < Minitest::Test
      def test_authnd_token?
        refute Authnd::Client.authnd_token?("gh0_c0ffeecafec0ffeecafec0ffeecafe123456")
        assert Authnd::Client.authnd_token?("gh1_c0ffeecafec0ffeecafe1_c0ffeecafec0ffeecafec0ffeecafec0ffeecafec0ffeecafe123456789")
        assert Authnd::Client.authnd_token?("github_pat_1c0ffeecafec0ffeecafe1_c0ffeecafec0ffeecafec0ffeecafec0ffeecafec0ffeecafe123456789")

        refute Authnd::Client.authnd_token?("gh0_c0ffeecafe")
        refute Authnd::Client.authnd_token?("gh1_c0ffeecafe")
        refute Authnd::Client.authnd_token?("ghp_vTvSxsrLjVc9gtEqZ8UIySPYb00a8XxdN38e")
        refute Authnd::Client.authnd_token?("v1.021340932409")
      end
    end
  end
end
