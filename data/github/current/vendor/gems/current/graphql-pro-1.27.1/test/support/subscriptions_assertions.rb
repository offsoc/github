# frozen_string_literal: true

module SubscriptionsAssertions
  # requires:
  # @transport (Pusher, Ably)
  # @database (Redis)
  # @schema (A graphql schema)
  # @counters [Hash{String => Integer}] for counting executions

  module Types
    class Buddy < GraphQL::Schema::Object
      field :screenname, String, null: false
    end

    class Query < GraphQL::Schema::Object
      field :x, Int, null: true
    end

    class Mutation < GraphQL::Schema::Object
      field :connect, Buddy, null: true do
        argument :screenname, String, required: true
      end

      def connect(screenname:)
        buddy = { screenname: screenname }
        context.schema.subscriptions.trigger(:buddy_connected, {}, buddy)
        buddy
      end
    end

    class Subscription < GraphQL::Schema::Object
      if Gem::Version.new(GraphQL::VERSION) < Gem::Version.new("1.11.0")
        extend GraphQL::Subscriptions::SubscriptionRoot
      end

      class BuddyConnected < GraphQL::Schema::Subscription
        type Buddy


        def update
          if object[:screenname] == "disconnect"
            unsubscribe({ screenname: "unsubscribed"})
          else
            super
          end
        end
      end

      class ScopedBuddyConnected < GraphQL::Schema::Subscription
        subscription_scope :buddy_scope
        type Buddy

        def update
          if object[:screenname] == "disconnect"
            unsubscribe({ screenname: "unsubscribed"})
          else
            super
          end
        end
      end

      class EvalCounter < GraphQL::Schema::Subscription
        subscription_scope :counter_prefix
        argument :counter_suffix, Integer, required: false
        type Integer

        COUNTERS = Hash.new(0)

        # Combine the incoming arg and scope to choose a counter,
        # increment it and return a value.
        # Use the side-effect to `COUNTERS` (aliased as `@counters`) in test
        # to count the number of times that this method is actually evaluated.
        def update(counter_suffix:)
          counter_suffix ||= 0
          counter_prefix = context[:counter_prefix] || 0
          counter_id = "#{counter_prefix}.#{counter_suffix}"
          COUNTERS[counter_id] += 1
        end
      end

      class NoUpdate < GraphQL::Schema::Subscription
        argument :send_update, Boolean, required: true
        type Boolean

        def update(send_update:)
          if send_update
            true
          else
            :no_update
          end
        end
      end

      field :buddy_connected, subscription: BuddyConnected
      field :scoped_buddy_connected, subscription: ScopedBuddyConnected
      field :eval_counter, subscription: EvalCounter
      field :no_update, subscription: NoUpdate
    end
  end

  module DummyLogger
    class << self
      def debug(msg = nil, &block)
        messages << (msg || block.call)
      end

      def reset
        @messages = []
      end

      attr_reader :messages
    end
  end

  def setup
    DummyLogger.reset
    Types::Subscription::EvalCounter::COUNTERS.clear
    sub_class, sub_kwargs = @subscription_arguments || raise("Must setup @subscription_arguments")
    @schema = build_schema_from(sub_class, sub_kwargs)
    @schema.default_logger(DummyLogger)
  end

  def build_schema_from(sub_class, sub_kwargs)
    Class.new(GraphQL::Schema) do
      query(SubscriptionsAssertions::Types::Query)
      mutation(SubscriptionsAssertions::Types::Mutation)
      subscription(SubscriptionsAssertions::Types::Subscription)

      # Override the default delay so that we get instant cleanup in tests
      use(sub_class, cleanup_delay_s: 0, **sub_kwargs)
    end
  end

  # requires `def unsubscribe_env(subscription_id)` in each test class
  def unsubscribe_via_webhook(subscription_id, event_name: nil)
    webhooks_client = @schema.subscriptions.class::WebhooksClient.new(schema: @schema)
    example_env = if event_name
      unsubscribe_env(subscription_id, event_name: event_name)
    else
      unsubscribe_env(subscription_id)
    end
    result = webhooks_client.call(example_env)
    assert_equal 200, result.first, "Got a successful response (#{result})"
    nil
  end

  def exec(query_str, **opts)
    @schema.execute(query_str, **opts)
  end

  def counter_update(value)
    {
      result: { "data" => { "evalCounter" => value } },
      more: true,
    }
  end

  def test_it_manages_subscription_state
    res1 = exec("subscription { newBuddy: buddyConnected { screenname } }")
    channel1 = mark_online(res1)

    res = exec("mutation { connect(screenname: \"dhh\") { screenname } }")
    expected_mutation_result = { "data" => { "connect" => { "screenname" => "dhh" } } }
    assert_equal expected_mutation_result, res.to_h
    expected_first_update = {
      result: { "data" => { "newBuddy" => { "screenname" => "dhh" } } },
      more: true,
    }

    assert_equal [expected_first_update], channel1.updates

    # Add a second subscription
    res2 = exec("subscription { newBuddy: buddyConnected { screenname } }")
    channel2 = mark_online(res2)

    exec("mutation { connect(screenname: \"matz\") { screenname } }")
    expected_second_update = {
      result: { "data" => { "newBuddy" => { "screenname" => "matz" } } },
      more: true,
    }

    assert_equal [expected_first_update, expected_second_update], channel1.updates
    assert_equal [expected_second_update], channel2.updates

    expected_keys = if @schema.subscriptions.new_subscriptions
      [
        "gql:sub:alltopics",
        "gql:sub:fingerprints::buddyConnected:",
        "gql:sub:fingerprintsubscriptions::buddyConnected:/#{res1.query.fingerprint}",
        "gql:sub:query:#{channel1.id}",
        "gql:sub:query:#{channel2.id}",
      ]
    else
      [
        "gql:sub:alltopics",
        "gql:sub:query:#{channel1.id}",
        "gql:sub:query:#{channel2.id}",
        "gql:sub:topics::buddyConnected:",
      ]
    end


    # Maybe different order because of UUIDs
    expected_keys.sort!
    assert_equal expected_keys, @database.keys("*").sort

    channel1.occupied = false

    exec("mutation { connect(screenname: \"disconnect\") { screenname } }")
    expected_third_update = {
      result: { "data" => { "newBuddy" => { "screenname" => "unsubscribed" } } },
      more: false,
    }
    # Empty DB, it was cleaned up
    assert_equal [], @database.keys("*")


    exec("mutation { connect(screenname: \"tenderlove\") { screenname } }")

    # No new updates, because not occupied:
    assert_equal [expected_first_update, expected_second_update], channel1.updates
    assert_equal [expected_second_update, expected_third_update], channel2.updates

    expected_messages = [
      "[#{@schema.subscriptions.class}] write_subscription #{channel1.id}",
      "[#{@schema.subscriptions.class}] write_subscription #{channel2.id}",
      "[#{@schema.subscriptions.class}] delete_subscription #{channel2.id}",
      "[#{@schema.subscriptions.class}] delete_subscription #{channel1.id}"
    ]

    case @schema.subscriptions
    when GraphQL::Pro::PusherSubscriptions
      expected_messages.concat([
        "[#{@schema.subscriptions.class}] deliver_all: 1 payload",
        "[#{@schema.subscriptions.class}] deliver_all: 1 payload",
        "[#{@schema.subscriptions.class}] deliver_all: 2 payloads",
      ])
    when GraphQL::Pro::AblySubscriptions
      expected_messages.concat([
        "[#{@schema.subscriptions.class}] deliver #{channel1.id}",
        "[#{@schema.subscriptions.class}] deliver #{channel1.id}",
        "[#{@schema.subscriptions.class}] deliver #{channel2.id}",
        "[#{@schema.subscriptions.class}] deliver #{channel2.id}",
      ])
    end

    # The `delete_subscription` messages may come in any order, so sort them
    assert_equal expected_messages.sort, DummyLogger.messages.sort
  end

  def test_it_distributes_updates_by_scope
    res1 = exec("subscription { scopedBuddyConnected { screenname } }", context: { buddy_scope: "1" })
    channel1 = mark_online(res1)
    res2 = exec("subscription { scopedBuddyConnected { screenname } }", context: { buddy_scope: "1" })
    channel2 = mark_online(res2)
    res3 = exec("subscription { scopedBuddyConnected { screenname } }", context: { buddy_scope: "2" })
    channel3 = mark_online(res3)

    @schema.subscriptions.trigger(:scoped_buddy_connected, {}, {screenname: "mdo"}, scope: "1")
    @schema.subscriptions.trigger(:scoped_buddy_connected, {}, {screenname: "fat"}, scope: "2")
    @schema.subscriptions.trigger(:scoped_buddy_connected, {}, {screenname: "disconnect"}, scope: "2")

    expected_scope_1_update = {
      result: { "data" => { "scopedBuddyConnected" => { "screenname" => "mdo" } } },
      more: true
    }
    expected_scope_2_update = {
      result: { "data" => { "scopedBuddyConnected" => { "screenname" => "fat" } } },
      more: true
    }

    expected_scope_2_disconnect = {
      result: { "data" => { "scopedBuddyConnected" => { "screenname" => "unsubscribed" } } },
      more: false
    }

    # This shouldn't go anywhere
    @schema.subscriptions.trigger(:scoped_buddy_connected, {}, {screenname: "goes-nowhere"}, scope: "2")

    assert_equal [expected_scope_1_update], channel1.updates
    assert_equal [expected_scope_1_update], channel2.updates
    assert_equal [expected_scope_2_update, expected_scope_2_disconnect], channel3.updates
  end

  def test_it_evaluates_once_per_fingerprint
    counters = Types::Subscription::EvalCounter::COUNTERS
    # These two match completely (query fingerprint, scope, args)
    res1 = exec("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1" })
    channel1 = mark_online(res1)
    res2 = exec("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1" })
    channel2 = mark_online(res2)
    # This almost matches -- but it uses a query variable, so different query fingerprint
    res3 = exec("subscription($counterSuffix: Int!) { evalCounter(counterSuffix: $counterSuffix) }", variables: { counterSuffix: 1 }, context: { counter_prefix: "1" })
    channel3 = mark_online(res3)
    # This one has the same query string as the previous, but a different variable value, so different.
    res4 = exec("subscription($counterSuffix: Int!) { evalCounter(counterSuffix: $counterSuffix) }", variables: { counterSuffix: 2 }, context: { counter_prefix: "1" })
    channel4 = mark_online(res4)
    # This one has the same query string as the original, but a different scope
    res5 = exec("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "2" })
    channel5 = mark_online(res5)

    # Expect 3 subscribers, two of which share a fingerprint (2 evals)
    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    # Expect 1 subscriber
    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 2}, {}, scope: 1)
    # Expect 1 subscriber
    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 2)
    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 2)
    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 2)

    if @schema.subscriptions.new_subscriptions
      # Check the internal state is right
      expected_counters = { "1.1" => 2, "1.2" => 1, "2.1" => 3}
      assert_equal expected_counters, counters

      # This was triggered only once, but there was one eval for the first fingerprint,
      # and a second eval for the second fingerprint
      if channel3.updates == [counter_update(1)]
        assert_equal [counter_update(1)], channel3.updates
        assert_equal [counter_update(2)], channel1.updates
        assert_equal [counter_update(2)], channel2.updates
      elsif channel3.updates == [counter_update(2)]
        assert_equal [counter_update(2)], channel3.updates
        assert_equal [counter_update(1)], channel1.updates
        assert_equal [counter_update(1)], channel2.updates
      else
        raise <<-ERR
        This spec is indeterminate, but neither possibility matched:

        #{channel1.updates}

        #{channel2.updates}

        #{channel3.updates}
        ERR
      end
      # This was triggered only once, only one eval
      assert_equal [counter_update(1)], channel4.updates
      # This was triggered three times, so three updates
      assert_equal [counter_update(1), counter_update(2), counter_update(3)], channel5.updates
    else
      # The old behavior doesn't have this optimization
      expected_counters = { "1.1" => 3, "1.2" => 1, "2.1" => 3}
      assert_equal expected_counters, counters

      # Each of these was evaluated independently, so 1 -> 2 -> 3
      # (The order might be lexicographically determined by redis?)
      expected_first_subscription_updates = [
        [counter_update(1)],
        [counter_update(2)],
        [counter_update(3)],
      ]
      sorted_updates = [channel1, channel2, channel3]
        .map(&:updates)
        .sort_by { |u| u[0][:result]["data"]["evalCounter"] }

      assert_equal expected_first_subscription_updates, sorted_updates
      # This was triggered only once, only one eval
      assert_equal [counter_update(1)], channel4.updates
      # This was triggered three times, so three updates
      assert_equal [counter_update(1), counter_update(2), counter_update(3)], channel5.updates
    end
  end

  def test_it_properly_unsubscribes_from_broadcasts
    if !@schema.subscriptions.new_subscriptions
      skip "only applies to new subscriptions"
    end
    res1 = exec("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1" })
    channel1 = mark_online(res1)
    res2 = exec("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1" })
    channel2 = mark_online(res2)
    res3 = exec("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1" })
    channel3 = mark_online(res3)

    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)

    unsubscribe_via_webhook(channel1.id)
    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)

    unsubscribe_via_webhook(channel2.id)
    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)

    assert_equal [counter_update(1)], channel1.updates
    assert_equal [counter_update(1), counter_update(2)], channel2.updates
    assert_equal [counter_update(1), counter_update(2), counter_update(3)], channel3.updates
  end

  def test_it_is_backwards_compatible
    prev_new_subscriptions = @schema.subscriptions.new_subscriptions
    if !prev_new_subscriptions
      skip "Only applies to new subscriptions"
    end

    counters = Types::Subscription::EvalCounter::COUNTERS

    query_str = "subscription { evalCounter(counterSuffix: 1) }"
    query_opts = { context: { counter_prefix: "1" } }
    @schema.subscriptions.new_subscriptions = false
    res1 = exec(query_str, **query_opts)
    channel1 = mark_online(res1)
    res2 = exec(query_str, **query_opts)
    channel2 = mark_online(res2)

    @schema.subscriptions.new_subscriptions = true
    res3 = exec(query_str, **query_opts)
    channel3 = mark_online(res3)
    res4 = exec(query_str, **query_opts)
    channel4 = mark_online(res4)

    # Expect 4 subscribers, two of which share a fingerprint (3 evals)
    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    expected_counters = {"1.1" => 3 }
    assert_equal expected_counters, counters
    # New-style come first because of the read order in `execute_all_with_backwards_compat`
    expected_updates = [1, 1, 2, 3].map { |i| [counter_update(i)] }
    # sort because channel1 and channel2 are in indeterminate order
    sorted_updates = [channel1, channel2, channel3, channel4].map(&:updates).sort_by { |u| u[0][:result]["data"]["evalCounter"] }
    assert_equal expected_updates, sorted_updates

    channel1.occupied = false
    channel2.occupied = false
    channel3.occupied = false
    channel4.occupied = false

    @schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    # No changes because all channels were closed:
    assert_equal expected_counters, counters
    assert_equal [], @database.keys("*")
  ensure
    @schema.subscriptions.new_subscriptions = prev_new_subscriptions
  end

  def test_it_doesnt_send_anything_for_no_update
    res1 = exec("subscription { noUpdate(sendUpdate: true) }")
    channel1 = mark_online(res1)
    res2 = exec("subscription { noUpdate(sendUpdate: false) }")
    channel2 = mark_online(res2)
    @schema.subscriptions.trigger(:no_update, {send_update: true}, {})
    @schema.subscriptions.trigger(:no_update, {send_update: false}, {})

    assert_equal [{result: { "data" => { "noUpdate" => true } }, more: true }], channel1.updates
    assert_equal [], channel2.updates
  end

  def test_it_waits_for_cleanup_delay_s
    sub_class, sub_kwargs = @subscription_arguments
    cleanup_schema = build_schema_from(sub_class, sub_kwargs.merge(cleanup_delay_s: 5))
    channel1 = nil
    t = Time.now.to_i
    Timecop.freeze(t) do
      res1 = cleanup_schema.execute("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1" })
      # Make it look offline:
      channel1 = mark_online(res1)
      channel1.occupied = false

      cleanup_schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    end

    # It gets an update, even though it looked unoccupied
    assert_equal [counter_update(1)], channel1.updates

    Timecop.freeze(t + 4) do
      cleanup_schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    end

    assert_equal [counter_update(1), counter_update(2)], channel1.updates

    Timecop.freeze(t + 5) do
      cleanup_schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    end

    # There wasn't another update -- it's the same as it was above.
    assert_equal [counter_update(1), counter_update(2)], channel1.updates
    # And the subscription was deleted -- the DB is empty now.
    assert_equal [], @database.keys("*")
  end

  def test_it_ignores_cleanup_delay_s_for_queries_without_created_at
    sub_class, sub_kwargs = @subscription_arguments
    cleanup_schema = build_schema_from(sub_class, sub_kwargs.merge(cleanup_delay_s: 5))
    if !cleanup_schema.subscriptions.new_subscriptions
      skip "don't need to test both old and new subscriptions here"
    end

    channel1 = nil
    channel2 = nil
    t = Time.now.to_i
    Timecop.freeze(t) do
      # Use `channel_prefix:` so that the database keys have a stable order
      res1 = cleanup_schema.execute("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1", channel_prefix: "a-" })
      # Make it look offline:
      channel1 = mark_online(res1)
      channel1.occupied = false

      res2 = cleanup_schema.execute("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1", channel_prefix: "b-" })
      # Make it look offline:
      channel2 = mark_online(res2)
      channel2.occupied = false

      # Fake a legacy subscription by messing with the database:
      _all_topics_key, _eval_counter_fingerprints_key,
          _fingerprint_1_key, query_key, _query_2_key = @database.keys("*").sort
      query_info = JSON.parse(@database.get(query_key))
      query_info.delete("created_at")
      @database.set(query_key, query_info.to_json)

      cleanup_schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    end

    assert_equal [], channel1.updates
    assert_equal [counter_update(1)], channel2.updates

    Timecop.freeze(t + 5) do
      cleanup_schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    end

    # No new updates, all cleaned up:
    assert_equal [], channel1.updates
    assert_equal [counter_update(1)], channel2.updates
    assert_equal [], @database.keys("*")
  end

  def test_it_updates_ttl_when_it_pushes_an_update
    sub_class, sub_kwargs = @subscription_arguments
    ttl_schema = build_schema_from(sub_class, sub_kwargs.merge(stale_ttl_s: 1))
    if !ttl_schema.subscriptions.new_subscriptions
      skip "don't need to test both old and new subscriptions here"
    end

    # Use `channel_prefix:` so that the database keys have a stable order
    res1 = ttl_schema.execute("subscription { evalCounter(counterSuffix: 1) }", context: { counter_prefix: "1" })
    channel1 = mark_online(res1)

    _all_topics_key, _eval_counter_fingerprints_key,
      _fingerprint_1_key, query_key = @database.keys("*").sort
    assert_in_delta 1000, @database.pttl(query_key), 100

    sleep 0.5
    assert_in_delta 500, @database.pttl(query_key), 100

    ttl_schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    # The ttl is reset
    assert_in_delta 1000, @database.pttl(query_key), 100
    assert_equal [counter_update(1)], channel1.updates

    sleep 1.1
    # This trigger causes a full clean-up
    ttl_schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    assert_equal [counter_update(1)], channel1.updates
    assert_equal [], @database.keys("*")
  end

  def test_it_calls_read_subscription_failed_error
    base_sub_class, sub_kwargs = @subscription_arguments
    load_failed_subscriptions = Class.new(base_sub_class) do
      attr_accessor :failed_loads
      def read_subscription_failed_error(sub_id, query_data, err)
        @failed_loads ||= []
        @failed_loads << [sub_id, query_data, err]
      end
    end

    load_failed_schema = build_schema_from(load_failed_subscriptions, sub_kwargs)
    query_str = "subscription { evalCounter(counterSuffix: 1) }"
    query_opts = { context: { counter_prefix: "1", bogus: { "__gid__" => "gid://bogus" } } }
    result = exec(query_str, **query_opts)
    load_failed_schema.subscriptions.trigger(:eval_counter, {counter_suffix: 1}, {}, scope: 1)
    failed_loads = load_failed_schema.subscriptions.failed_loads
    assert_equal 1, failed_loads.size
    assert_equal 3, failed_loads.first.size
    assert_equal result.context[:subscription_id], failed_loads.first[0]
    assert_equal query_str, failed_loads.first[1]["query_string"]
    error_message = failed_loads.first[2].message
    assert_includes error_message, "uninitialized constant"
    assert_includes error_message, "GlobalID"
  end

  private

  # Given the subscription ID assigned to this result's context,
  # reach into the mocked backend and mark the channel as occupied.
  # Then return the channel.
  def mark_online(result)
    subscription_id = result.context[:subscription_id]
    sub_key = result.context[:ably_cipher_base64]
    channel = if sub_key
      @transport.channel(subscription_id, cipher: { key: sub_key })
    else
      @transport.channel(subscription_id)
    end
    channel.occupied = true
    channel
  end
end
