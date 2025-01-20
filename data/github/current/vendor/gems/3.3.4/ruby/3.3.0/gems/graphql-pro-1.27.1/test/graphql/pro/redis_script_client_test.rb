# frozen_string_literal: true
require "test_helper"

class GraphQLProRedisScriptClientTest < Minitest::Test
  parallelize_me!
  REDIS = Redis.new(db: REDIS_NUMBERS[:script_client])
  class TestClient < GraphQL::Pro::RedisScriptClient
    register :add, <<-LUA
      local result = tonumber(ARGV[1]) + tonumber(ARGV[2])
      redis.call('set', KEYS[1], result)
      return result
    LUA

    register :messed_up, "return nil"

    self.operations[:messed_up][:sha] = "12345"
  end

  def setup
    REDIS.flushdb
    @client = TestClient.new(REDIS)
  end

  def test_it_runs_scripts
    result = @client.exec_script(:add, ["add-result"], [4, 5])
    assert_equal(9, result)
    assert_equal("9", REDIS.get("add-result"))
  end

  def test_it_raises_on_sha_mismatches_which_should_be_impossible_but_you_never_know
    err = assert_raises RuntimeError do
      @client.exec_script(:messed_up, [], [])
    end
    assert_equal "Invariant: Calculated SHA doesn't match Redis SHA (\"12345\", \"79cefb99366d8809d2e903c5f36f50c2b731913f\")", err.message
  end
end
