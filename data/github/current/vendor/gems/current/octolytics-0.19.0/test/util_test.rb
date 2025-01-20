require 'helper'
require 'octolytics/util'

module Octolytics
  class UtilTest < Minitest::Test
    def test_html_escape_does_not_respond_to_html_safe
      assert_equal "foo&amp;", Util.html_escape("foo&")
      assert_equal "&lt;script&gt;", Util.html_escape("<script>")
      assert_equal "&#39;", Util.html_escape("'")
      assert_equal "&quot;", Util.html_escape('"')
    end

    def test_html_escape_nil
      assert_equal "", Util.html_escape(nil)
    end

    def test_html_escape_is_html_safe
      str = "foo"
      def str.html_safe?
        true
      end
      assert_equal "foo", Util.html_escape(str)
    end

    def test_html_escape_is_not_html_safe
      str = "foo"

      def str.html_safe?
        false
      end

      def str.html_safe
        "safe"
      end

      def str.gsub(*args)
        self
      end

      assert_equal "safe", Util.html_escape(str)
    end
  end
end
