require File.expand_path('../helper.rb', __FILE__)
require "failbot_test"

class ConsoleBackendTest < Minitest::Test
  def setup
    Failbot.reset!
    Failbot.setup("FAILBOT_BACKEND" => "console")
  end

  def teardown
    Failbot.reset!
  end

  def test_report
    _stdout, stderr = capture_io do
      Failbot.report(boomtown)
    end
    assert(stderr.include?("boomtown"))
  end
end
