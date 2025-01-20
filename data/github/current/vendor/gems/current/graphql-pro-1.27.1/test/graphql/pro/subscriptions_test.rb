# frozen_string_literal: true
require "test_helper"

class GraphQLProSubscriptionsTest < Minitest::Test
  class ExampleSubscriptions < GraphQL::Pro::Subscriptions
    def mark_unsubscribed(subscription_id)
      @unsubscribed_ids ||= []
      @unsubscribed_ids.push(subscription_id)
    end

    def still_subscribed?(subscription_id)
      @unsubscribed_ids.nil? || !@unsubscribed_ids.include?(subscription_id)
    end
  end

  def setup
    @database = Redis.new(db: REDIS_NUMBERS[:subscriptions])
    @database.flushdb
    @subscriptions = ExampleSubscriptions.new(schema: nil, redis: @database, pusher: :nop, stale_ttl_s: 60)
  end

  def test_it_writes_reads_and_deletes_subscription_state
    query = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery }"),
      context: { channel_prefix: "abc-"},
      provided_variables: { "a" => [1,2] }
    )
    events = [OpenStruct.new(topic: "stuff", fingerprint: "fingerprint-1"), OpenStruct.new(topic: "otherStuff", fingerprint: "fingerprint-2")]

    created_at = nil
    Timecop.freeze do
      # update the db
      @subscriptions.write_subscription(query, events)
      created_at = Time.now.to_i
    end

    if @subscriptions.new_subscriptions
      all_topics_key, other_stuff_fingerprints_key, stuff_fingerprints_key,
        fingerprint_1_key, fingerprint_2_key, query_key = @database.keys.sort
    else
      all_topics_key, query_key, other_topic_key, topic_key = @database.keys.sort
    end

    # Make sure Redis got the configured TTL
    assert_in_delta 60, @database.ttl(query_key), 1

    subscription_id = query_key.split(":").last
    expected_query_info = {
      query_string: "{ parsedQuery }",
      variables: {"a" => [1,2]}.to_json,
      context_string: {
        channel_prefix: "abc-",
        subscription_id: subscription_id,
        __sym_keys__: ["channel_prefix","subscription_id"]
      }.to_json,
      operation_name: nil,
      topics: ["stuff", "otherStuff"],
      created_at: created_at,
    }
    assert_match /^abc-/, subscription_id

    if @subscriptions.new_subscriptions
      expected_query_info[:fingerprints] = ["fingerprint-1", "fingerprint-2"]
      assert_equal ["fingerprint-1"], @database.smembers(stuff_fingerprints_key)
      assert_equal ["fingerprint-2"], @database.smembers(other_stuff_fingerprints_key)
      assert_equal [subscription_id], @database.smembers(fingerprint_1_key)
      assert_equal [subscription_id], @database.smembers(fingerprint_2_key)
    else
      assert_equal [subscription_id], @database.smembers(topic_key)
      assert_equal [subscription_id], @database.smembers(other_topic_key)
    end

    assert_equal expected_query_info.to_json, @database.get(query_key)
    assert_equal ["stuff", "otherStuff"].sort, @database.smembers(all_topics_key).sort

    # Read a value
    query_info = @subscriptions.read_subscription(subscription_id)
    expected_read_query_value = {
      query_string: "{ parsedQuery }",
      # This is parsed:
      variables: JSON.parse(expected_query_info[:variables]),
      # This moves, and gets symbolized keys:
      context: JSON.parse(expected_query_info[:context_string]).reduce({}) { |m, (k, v)|
        m[k.to_sym] = v
        m
      },
      # Put this back at the end:
      operation_name: expected_query_info[:operation_name],
      created_at: created_at,
      topics: ["stuff", "otherStuff"],
      fingerprints: ["fingerprint-1", "fingerprint-2"],
    }

    # This is not present:
    expected_read_query_value[:context].delete(:__sym_keys__)
    # The read_subscription response doesn't include `topics:` or `fingerprints:`
    assert_equal expected_read_query_value, query_info

    # clear everything
    @subscriptions.delete_subscription(subscription_id)
    assert_equal [], @database.keys
  end

  def test_it_removes_from_all_topics_after_all_subscriptions_are_gone
    query1 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery }"),
      context: { channel_prefix: "abc-"},
      provided_variables: { "a" => [1,2] },
      fingerprint: "f1",
    )
    events = [OpenStruct.new(topic: "stuff", fingerprint: "ef1"), OpenStruct.new(topic: "otherStuff", fingerprint: "ef2")]

    # Set up a legacy subscription
    @subscriptions.new_subscriptions = false
    @subscriptions.write_subscription(query1, events)
    @subscriptions.new_subscriptions = true

    query2 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery2 }"),
      context: { channel_prefix: "def-"},
      provided_variables: { "b" => [1,2] },
      fingerprint: "f2",
    )
    @subscriptions.write_subscription(query2, [events[0]])

    all_topics_key = @database.keys.sort.first
    assert_equal ["stuff", "otherStuff"].sort, @database.smembers(all_topics_key).sort
    @subscriptions.delete_subscription(query1.context[:subscription_id])
    assert_equal ["stuff"], @database.smembers(all_topics_key)

    @subscriptions.delete_subscription(query2.context[:subscription_id])
    assert_equal [], @database.keys
  end

  def test_it_removes_legacy_subscription_id_when_its_orphaned
    query1 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery }"),
      context: { channel_prefix: "abc-"},
      provided_variables: { "a" => [1,2] },
      fingerprint: "f1",
    )
    query2 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery }"),
      context: { channel_prefix: "def-"},
      provided_variables: { "a" => [1,2] },
      fingerprint: "f3",
    )
    events = [OpenStruct.new(topic: "stuff", fingerprint: "ef1"), OpenStruct.new(topic: "otherStuff", fingerprint: "ef2")]

    # Set up a legacy subscription
    @subscriptions.new_subscriptions = false
    @subscriptions.write_subscription(query1, events)
    @subscriptions.write_subscription(query2, events)
    @subscriptions.new_subscriptions = true

    query3 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery2 }"),
      context: { channel_prefix: "ghi-"},
      provided_variables: { "b" => [1,2] },
      fingerprint: "f2",
    )
    @subscriptions.write_subscription(query3, [events[0]])

    all_topics_key = @database.keys.sort.first
    assert_equal ["stuff", "otherStuff"].sort, @database.smembers(all_topics_key).sort
    sub_id_1 = query1.context[:subscription_id]
    sub_id_2 = query2.context[:subscription_id]
    sub_id_3 = query3.context[:subscription_id]
    stuff_topic_key = "gql:sub:topics:stuff"
    assert_equal [sub_id_1, sub_id_2], @database.smembers(stuff_topic_key).sort
    stuff_event_fingerprint_key = "gql:sub:fingerprints:stuff"
    assert_equal ["ef1"], @database.smembers(stuff_event_fingerprint_key)

    # Make garbage data
    @database.del("gql:sub:query:#{sub_id_1}")

    found_subs = []
    @subscriptions.each_subscription_id("stuff") do |id|
      found_subs << id
    end

    # sub_id_1 is not returned and it is not present in the topic index
    assert_equal [sub_id_2, sub_id_3], found_subs.sort
    assert_equal [sub_id_2], @database.smembers(stuff_topic_key)
    assert_equal ["ef1"], @database.smembers(stuff_event_fingerprint_key)
  end

  def test_it_removes_nil_keys_on_trigger
    query1 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery }"),
      context: { channel_prefix: "abc-"},
      provided_variables: { "a" => [1,2] },
      fingerprint: "f1",
    )
    events = [OpenStruct.new(topic: "stuff", fingerprint: "ef1"), OpenStruct.new(topic: "otherStuff", fingerprint: "ef2")]

    @subscriptions.write_subscription(query1, events)

    query2 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery2 }"),
      context: { channel_prefix: "def-"},
      provided_variables: { "b" => [1,2] },
      fingerprint: "f2",
    )
    @subscriptions.write_subscription(query2, [events[0]])

    query3 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery2 }"),
      context: { channel_prefix: "ghi-"},
      provided_variables: { "b" => [1,2] },
      fingerprint: "f2",
    )
    @subscriptions.write_subscription(query3, [events[1]])

    if @subscriptions.new_subscriptions
      all_topics_key, _other_stuff_fingerprints_key, stuff_fingerprints_key,
        fingerprint_subscriptions_key, _fingerprint2_subscriptions_key, query1_key, query2_key, query3_key = @database.keys.sort
    else
      all_topics_key, query1_key, query2_key, query3_key, _other_topic_key, topic_key = @database.keys.sort
    end

    @database.set(query1_key, nil)
    @database.del(query3_key)

    # Make sure we're covering both cases:
    assert_equal "", @database.get(query1_key)
    assert_nil @database.get(query3_key)

    query1_id = query1_key.split(":").last
    assert_nil @subscriptions.read_subscription(query1_id)
    query3_id = query3_key.split(":").last
    assert_nil @subscriptions.read_subscription(query3_id)

    found_subs = []
    @subscriptions.each_subscription_id("stuff") do |id|
      found_subs << id
    end

    # The other subscription was removed here
    query2_id = query2_key.split(":").last
    assert_equal [query2_id], found_subs
    assert_equal ["stuff", "otherStuff"].sort, @database.smembers(all_topics_key).sort

    # Calling this will clean up `otherStuff`
    found_subs_2 = []
    @subscriptions.each_subscription_id("otherStuff") do |id|
      found_subs_2 << id
    end

    # `otherStuff`'s subscriptions have all been removed, there should only be one here:
    assert_equal [], found_subs_2
    assert_equal ["stuff"], @database.smembers(all_topics_key)

    # query1 and query3 were properly cleaned up
    if @subscriptions.new_subscriptions
      assert_equal [all_topics_key, stuff_fingerprints_key, fingerprint_subscriptions_key, query2_key], @database.keys.sort
    else
      assert_equal [all_topics_key, query2_key, topic_key], @database.keys.sort
    end

    @subscriptions.clear
    assert_equal [], @database.keys
  end

  # This can happen when the client unsubscribes _between_ `each_subscription_id`
  # and `filter_still_subscribed`. https://github.com/rmosolgo/graphql-ruby/issues/3357
  def test_filter_still_subscribed_handles_empty_subscription_id_keys
    query1 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery }"),
      context: { channel_prefix: "abc-"},
      provided_variables: { "a" => [1,2] },
      fingerprint: "f1",
    )
    events = [OpenStruct.new(topic: "stuff", fingerprint: "ef1"), OpenStruct.new(topic: "otherStuff", fingerprint: "ef2")]

    @subscriptions.write_subscription(query1, events)

    query2 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery2 }"),
      context: { channel_prefix: "def-"},
      provided_variables: { "b" => [1,2] },
      fingerprint: "f2",
    )
    @subscriptions.write_subscription(query2, [events[0]])

    query3 = OpenStruct.new(
      document: OpenStruct.new(to_query_string: "{ parsedQuery2 }"),
      context: { channel_prefix: "ghi-"},
      provided_variables: { "b" => [1,2] },
      fingerprint: "f2",
    )
    @subscriptions.write_subscription(query3, [events[1]])

    if @subscriptions.new_subscriptions
      _all_topics_key, _other_stuff_fingerprints_key, _stuff_fingerprints_key,
        _fingerprint_subscriptions_key, _fingerprint2_subscriptions_key, query1_key, query2_key, query3_key = @database.keys.sort
    else
      _all_topics_key, query1_key, query2_key, query3_key, _other_topic_key, _topic_key = @database.keys.sort
    end

    @database.set(query1_key, nil)
    @database.del(query3_key)

    # Make sure we're covering both cases:
    assert_equal "", @database.get(query1_key)
    assert_nil @database.get(query3_key)

    subscription_ids = [
      query1_id = query1_key.split(":").last,
      query2_id = query2_key.split(":").last,
      query3_id = query3_key.split(":").last,
    ]
    @subscriptions.mark_unsubscribed(query1_id)
    @subscriptions.mark_unsubscribed(query3_id)
    result = @subscriptions.send(:filter_still_subscribed, subscription_ids)
    assert_equal [query2_id], result
  end

  class FakeDB
    attr_reader :known_shas

    def initialize
      @known_shas = []
    end

    def mget(keys)
      keys.map { |k|
        JSON.dump({
          query_string: "",
          variables: "{}",
          context_string: "{}",
          operation_name: "",
          topics: [],
          fingerprints: [],
        })
      }
    end

    def get(key)
      mget([key]).first
    end

    def evalsha(sha, keys, args)
      if !@known_shas.include?(sha)
        raise Redis::CommandError, "NOSCRIPT"
      else
        :ok
      end
    end

    def script(_action, script)
      sha = Digest::SHA1.hexdigest(script)
      @known_shas << sha
      sha
    end
  end

  def test_it_uses_evalsha_for_duplicate_script_runs
    db = FakeDB.new
    subscriptions = GraphQL::Pro::Subscriptions.new(schema: nil, redis: db, pusher: :nop, stale_ttl_s: 60)

    assert_equal 0, db.known_shas.size
    subscriptions.delete_subscription("abcd")
    subscriptions.delete_subscription("efgh")
    assert_equal 1, db.known_shas.size
  end
end
