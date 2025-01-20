require 'helper'
require 'octolytics/client'

module Octolytics
  class TagsTest < Minitest::Test
    def test_initialize
      client = Octolytics::Client.new("github", secret: 'abc123')
      tags = Tags.new(client)
      assert_equal client, tags.client
    end

    def test_required
      client = Octolytics::Client.new("github", secret: 'abc123')
      tags = Tags.new(client)
      expected_tags = [
        %Q(<meta name="octolytics-app-id" content="github" />),
        %Q(<meta name="octolytics-host" content="collector.dev" />),
        %Q(<meta name="octolytics-script-host" content="collector.dev" />),
      ].join("")
      assert_equal expected_tags, tags.required
    end

    def test_required_escapes
      client = Octolytics::Client.new("<script>", secret: 'abc123')
      tags = Tags.new(client)
      assert_match /&lt;script&gt;/, tags.required
    end

    def test_actor
      client = Octolytics::Client.new("github", secret: "asdf")
      tags = Tags.new(client)
      expected_tags = [
        %Q(<meta name="octolytics-actor-id" content="1" />),
        %Q(<meta name="octolytics-actor-hash" content="387fd038f785331698bc2345968aa71d3852f972b996392f7b37df0c9005327b" />),
      ].join("")
      assert_equal expected_tags, tags.actor(1)
    end

    def test_actor_escapes
      client = Octolytics::Client.new("github", secret: "asdf")
      tags = Tags.new(client)
      expected_tags = [
        %Q(<meta name="octolytics-actor-id" content="&lt;script&gt;" />),
        %Q(<meta name="octolytics-actor-hash" content="5b9fe0afaa8a2eb1230c37cb342a912fbefb8b1529a12f770a01ef9558dca8e2" />),
      ].join("")
      assert_equal expected_tags, tags.actor("<script>")
    end

    def test_actor_with_nil
      client = Octolytics::Client.new("github", secret: "asdf")
      tags = Tags.new(client)
      assert_equal "", tags.actor(nil)
    end

    def test_dimension
      client = Octolytics::Client.new("github")
      tags = Tags.new(client)
      expected_tags = [
        %Q(<meta name="octolytics-dimension-repository_id" content="234" />),
        %Q(<meta name="octolytics-dimension-user_id" content="21" />),
      ].join("")
      assert_equal expected_tags,
        tags.dimension(repository_id: 234, user_id: 21)
    end

    def test_dimension_escapes
      client = Octolytics::Client.new("github")
      tags = Tags.new(client)
      assert_equal %Q(<meta name="octolytics-dimension-&lt;script&gt;" content="&lt;tag&gt;" />),
        tags.dimension("<script>" => "<tag>")
    end

    def test_dimensions
      client = Octolytics::Client.new("github")
      tags = Tags.new(client)
      assert_equal %Q(<meta name="octolytics-dimension-repository_id" content="234" />),
        tags.dimensions(repository_id: 234)
    end

    def test_measure
      client = Octolytics::Client.new("github")
      tags = Tags.new(client)
      assert_equal %Q(<meta name="octolytics-measure-latency" content="22" />),
        tags.measure(latency: 22)
    end

    def test_measure_escapes
      client = Octolytics::Client.new("github")
      tags = Tags.new(client)
      assert_equal %Q(<meta name="octolytics-measure-&lt;script&gt;" content="&lt;tag&gt;" />),
        tags.measure("<script>" => "<tag>")
    end

    def test_measures
      client = Octolytics::Client.new("github")
      tags = Tags.new(client)
      assert_equal %Q(<meta name="octolytics-measure-latency" content="22" />),
        tags.measures(latency: 22)
    end
  end
end
