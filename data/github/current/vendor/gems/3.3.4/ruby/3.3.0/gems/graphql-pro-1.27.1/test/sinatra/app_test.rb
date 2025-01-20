# frozen_string_literal: true
# USAGE:
#  - Setup ngrok so that localhost:9292/pusher_webhooks receives Pusher webhooks:
#    - `ngrok http 9292`
#    - https://dashboard.pusher.com/apps/418263/web_hooks
#    - Add `http://#{ngrok-id}.ngrok.io/pusher_webhooks` to get channel existence events, enable
#  - `be ruby app_test.rb`
#
require 'sinatra'
require 'pry'
require "minitest/autorun"
Sinatra::Application.environment = :test
require 'capybara'
require 'capybara/minitest'
require "selenium/webdriver"

Capybara.default_driver = :selenium_chrome
Capybara.default_max_wait_time = 5

# Choose a matching host & port for ngrok + webhooks
Capybara.app_host = "http://localhost:9292"
Capybara.server_host = "localhost"
Capybara.server_port = "9292"

require_relative "./app"
disable :run

# Load the whole `config.ru` so we get webhooks, too.
Capybara.app = Rack::Builder.parse_file(File.expand_path('config.ru')).first

class AppFrontEndTest < Minitest::Test
  if ENV["TESTING_ABLY"]
    TEST_URL = "/ably"
    WAIT_TIME = 6
  elsif ENV["TESTING_PUBNUB"]
    TEST_URL = "/pubnub"
    WAIT_TIME = 1
  else
    TEST_URL = "/"
    WAIT_TIME = 1
  end

  include Capybara::DSL
  include Capybara::Minitest::Assertions

  def teardown
    Capybara.reset_sessions!
    Capybara.use_default_driver
  end

  def in_window(window_name)
    prev_session_name = Capybara.session_name
    Capybara.session_name = window_name
    yield
  ensure
    Capybara.session_name = prev_session_name
  end

  def assert_counters(c1, c2, c3)
    assert_equal(
      c1.to_s,
      find("#counter-value-1").text,
      "Counter 1 had expected value",
    )
    assert_equal(
      c2.to_s,
      find("#counter-value-2").text,
      "Counter 2 had expected value",
    )
    assert_equal(
      c3.to_s,
      find("#counter-value-3").text,
      "Counter 3 had expected value",
    )
  end

  def wait_for_update
    sleep WAIT_TIME
  end

  def test_subscribes_updates_and_unsubscribes
    prefix = GraphQL::Pro::Subscriptions::RedisStorage::PREFIX
    redis = Redis.new

    visit TEST_URL
    # Starts blank
    wait_for_update
    assert_counters(0, 0, 0)
    # Incrementing works
    click_on("increment-1")
    assert_counters 1, 0, 0

    # Open subscriptions
    click_on("subscribe-1")
    click_on("subscribe-2")

    # Subscribing works
    click_on("increment-1")
    click_on("increment-2")
    wait_for_update
    assert_counters 2, 1, 0

    # Unsubscribe 1
    click_on("unsubscribe-1")

    # Trigger both,
    # use `to:` since we're calling from a different process
    counter_1 = App::Counter.find(1)
    counter_1.increment(to: 3)

    counter_2 = App::Counter.find(2)
    counter_2.increment(to: 2)
    wait_for_update
    # One of the subscriptions was missed because it unsubscribed,
    # the other subscription made it through
    assert_counters 2, 2, 0

    click_on("unsubscribe-2")

    remaining_keys = nil
    # Not sure how long it will take to get updates from Pusher,
    # so wait up to 5 times.
    5.times do
      remaining_keys = redis.keys.select { |k| k.start_with?(prefix) }
      if remaining_keys.empty?
        break
      else
        # Get webhooks from Pusher
        wait_for_update
      end
    end

    assert_equal [], remaining_keys
  end

  def test_ui_works
    in_window("1") do
      visit TEST_URL
      # Open subscriptions
      10.times do
        click_on("subscribe-1")
      end

      click_on("subscribe-2")
    end

    in_window("2") do
      wait_for_update
      visit "/graphql/ui"
      click_on("Subscriptions")
      assert_text("2 Subscription Topics")
      assert_text(":counterIncremented:id:1")
      assert_text(":counterIncremented:id:2")
      refute_text(":counterIncremented:id:3")

      click_on(":counterIncremented:id:1")
      visit current_path + "?per_page=6"
      assert_css("td", count: 6)
      click_on("next »")
      assert_css("td", count: 4)

      # Check out a subscription
    end

    in_window("1") do
      click_on("Subscribe All")
    end

    in_window("2") do
      wait_for_update
      visit "/graphql/ui/topics?per_page=3"
      assert_css("tr", count: 4)
      click_on("next »")
      assert_css("tr", count: 4)

      # Test reset:
      visit "/graphql/ui/topics"
      page.accept_confirm do
        click_on("Reset")
      end

      # Header only:
      assert_text "0 Subscription Topics"
      assert_css("tr", count: 1)
      # Empty Topic
      visit "/graphql/ui/topics/nonsenseTopic"
      assert_css("tr", count: 1)
    end
  end
end
