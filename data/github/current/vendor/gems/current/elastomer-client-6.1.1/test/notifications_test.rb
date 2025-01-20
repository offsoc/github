# frozen_string_literal: true

require File.expand_path("../test_helper", __FILE__)
require "elastomer_client/notifications"

describe ElastomerClient::Notifications do
  before do
    @name = "elastomer-notifications-test"
    @index = $client.index @name
    @index.delete if @index.exists?
    @events = []
    @subscriber = ActiveSupport::Notifications.subscribe do |*args|
      @events << ActiveSupport::Notifications::Event.new(*args)
    end
  end

  after do
    ActiveSupport::Notifications.unsubscribe(@subscriber)
    @index.delete if @index.exists?
  end

  it "instruments timeouts" do
    $client.stub :connection, lambda { raise Faraday::TimeoutError } do
      assert_raises(ElastomerClient::Client::TimeoutError) { $client.info }
      event = @events.detect { |e| e.payload[:action] == "cluster.info" }
      exception = event.payload[:exception]

      assert_equal "ElastomerClient::Client::TimeoutError", exception[0]
      assert_match "timeout", exception[1]
    end
  end

  it "instruments cluster actions" do
    $client.ping; assert_action_event("cluster.ping")
    $client.info; assert_action_event("cluster.info")
  end

  it "instruments node actions" do
    nodes = $client.nodes
    nodes.info; assert_action_event("nodes.info")
    nodes.stats; assert_action_event("nodes.stats")
    nodes.hot_threads; assert_action_event("nodes.hot_threads")
  end

  it "instruments index actions" do
    @index.exists?; assert_action_event("index.exists")
    @index.create(default_index_settings)

    assert_action_event("index.create")
    wait_for_index(@index.name)

    @index.get_settings; assert_action_event("index.get_settings")
    @index.update_settings(number_of_replicas: 0)

    assert_action_event("index.get_settings")
    wait_for_index(@index.name)

    @index.close; assert_action_event("index.close")
    @index.open; assert_action_event("index.open")
    @index.delete; assert_action_event("index.delete")
  end

  it "includes the response body in the payload" do
    @index.create(default_index_settings)
    event = @events.detect { |e| e.payload[:action] == "index.create" }

    assert event.payload[:response_body]
  end

  it "includes the request body in the payload" do
    @index.create(default_index_settings)
    event = @events.detect { |e| e.payload[:action] == "index.create" }

    payload = event.payload

    assert payload[:response_body]
    assert payload[:request_body]
    assert_same payload[:body], payload[:request_body]
  end

  def assert_action_event(action)
    assert @events.detect { |e| e.payload[:action] == action }, "expected #{action} event"
  end

  def stub_client(method, url, status = 200, body = '{"acknowledged":true}')
    stubs = Faraday::Adapter::Test::Stubs.new do |stub|
      stub.send(method, url) { |env| [status, {}, body] }
    end
    ElastomerClient::Client.new($client_params.merge(opaque_id: false, adapter: [:test, stubs]))
  end
end
