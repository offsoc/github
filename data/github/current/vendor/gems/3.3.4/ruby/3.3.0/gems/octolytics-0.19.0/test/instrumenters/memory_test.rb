require "helper"
require "octolytics/instrumenters/memory"

class MemoryInstrumenterTest < Minitest::Test
  def test_instrument
    instrumentor = Octolytics::Instrumenters::Memory.new
    name         = 'user.signup'
    payload      = {:email => 'john@doe.com'}
    block_result = :yielded

    result = instrumentor.instrument(name, payload) { block_result }
    assert_equal block_result, result

    event = Octolytics::Instrumenters::Memory::Event.new(name, payload, block_result)
    assert_equal [event], instrumentor.events
  end
end
