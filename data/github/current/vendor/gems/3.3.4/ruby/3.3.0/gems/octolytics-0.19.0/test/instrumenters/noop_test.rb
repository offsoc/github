require "helper"
require "octolytics/instrumenters/noop"

class NoopInstrumenterTest < Minitest::Test
  def test_instrument_with_name
    yielded = false
    Octolytics::Instrumenters::Noop.instrument(:foo) {
      yielded = true
    }
    assert yielded
  end

  def test_instrument_with_name_and_payload
    yielded = false
    Octolytics::Instrumenters::Noop.instrument(:foo, {:pay => :load}) {
      yielded = true
    }
    assert yielded
  end
end
