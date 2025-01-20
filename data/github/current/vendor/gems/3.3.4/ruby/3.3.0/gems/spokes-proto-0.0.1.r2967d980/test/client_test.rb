# frozen_string_literal: true

require "minitest/test"

require "spokes-proto"

class SpokesProtoClientTest < Minitest::Test
  def test_api_clients_with_string
    c = GitHub::Spokes::Proto::Client.new("base-url", service_name: "test", current_sha: "deadbeef")
    refute_nil c.blobs, "blobs api client"
    refute_nil c.commits, "commits api client"
    refute_nil c.objects, "objects api client"
    refute_nil c.references, "references api client"
    refute_nil c.repositories, "repositories api client"    
    refute_nil c.trees, "trees api client"
  end

  def test_api_clients_with_string_and_block
    called = false
    GitHub::Spokes::Proto::Client.new("base-url", service_name: "test", current_sha: "deadbeef") do |conn|
      called = conn
    end
    assert_instance_of Faraday::Connection, called
  end

  def test_api_clients_with_string_and_ssl_options
    ssl = {
      ca_file: "/dev/null",
      client_cert: "/dev/null",
      client_key: "/dev/null",
    }
    c = GitHub::Spokes::Proto::Client.new("base-url", service_name: "test", current_sha: "deadbeef", ssl: ssl)
    refute_nil c.blobs, "blobs api client"
    refute_nil c.commits, "commits api client"
    refute_nil c.objects, "objects api client"
    refute_nil c.references, "references api client"
    refute_nil c.repositories, "repositories api client"    
    refute_nil c.trees, "trees api client"
  end

  def test_api_clients_with_faraday_connection
    c = GitHub::Spokes::Proto::Client.new(Faraday::Connection.new("base-url"))
    refute_nil c.blobs, "blobs api client"
    refute_nil c.commits, "commits api client"
    refute_nil c.objects, "objects api client"
    refute_nil c.references, "references api client"
    refute_nil c.repositories, "repositories api client"    
    refute_nil c.trees, "trees api client"
  end
end
