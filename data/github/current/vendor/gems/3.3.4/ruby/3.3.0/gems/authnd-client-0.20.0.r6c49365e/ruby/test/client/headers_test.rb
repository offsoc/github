# frozen_string_literal: true

require_relative "../test_helper"

module Authnd
  module Client
    class HeadersTest < Minitest::Test
      def test_format_enabled_features_for_header?
        # features must be an Array
        assert_raises(ArgumentError) { Authnd::Client.format_enabled_features_for_header(nil) }
        assert_raises(ArgumentError) { Authnd::Client.format_enabled_features_for_header("string") }
        assert_raises(ArgumentError) { Authnd::Client.format_enabled_features_for_header(123) }
        assert_raises(ArgumentError) { Authnd::Client.format_enabled_features_for_header(true) }

        # features must be an Array of Strings
        assert_raises(ArgumentError) { Authnd::Client.format_enabled_features_for_header([1, 2, 3]) }
        assert_raises(ArgumentError) { Authnd::Client.format_enabled_features_for_header(["foo", 3]) }

        assert_equal "W10=", Authnd::Client.format_enabled_features_for_header([])
        assert_equal "WyJteS1oYXBweS1mZWF0dXJlIl0=", Authnd::Client.format_enabled_features_for_header(["my-happy-feature"])
        assert_equal "WyJmZWF0dXJlMSIsImZlYXR1cmUyIiwiZmVhdHVyZTMiXQ==", Authnd::Client.format_enabled_features_for_header(%w[feature1 feature2 feature3])
      end
    end
  end
end
