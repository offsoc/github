# frozen_string_literal: true
require "test_helper"

class GraphQLProDashboardTest < Minitest::Test
  include Rack::Test::Methods
  include OperationStoreHelpers::Assertions
  using GraphQL::Pro::Routes

  def setup
    @schema = OperationStoreHelpers::ActiveRecordBackendSchema
    @store = @schema.operation_store
    @prefix_path = nil
  end

  def app
    # Builder uses instance eval, so capture these values to lexical scope
    schema = @schema
    prefix_path = @prefix_path

    # Test that the prefix is used
    if prefix_path
      Rack::Builder.app do
        map prefix_path do
          run schema.dashboard
        end
      end
    else
      builder = Rack::Builder.new
      builder.run schema.dashboard
    end
  end

  def assert_body_includes(text)
    case text
    when String
      assert_includes(last_response.body, text)
    when Regexp
      assert_match(text, last_response.body)
    else
      raise "Unexpected includes: #{text}"
    end
  end

  def refute_body_includes(text)
    case text
    when String
      refute_includes(last_response.body, text)
    when Regexp
      refute_match(text, last_response.body)
    else
      raise "Unexpected includes: #{text}"
    end
  end

  def assert_body_includes_link(link_text, link_path)
    link_pattern = /href="#{Regexp.escape(link_path)}"[^>]*>#{Regexp.escape(link_text)}<\/a>/
    assert_match(link_pattern, last_response.body, "Link is present: #{link_text} => #{link_path}")
  end

  def assert_page_includes_link(page_path, link_text, link_path)
    get(page_path)
    assert_body_includes_link(link_text, link_path)
  end

  def assert_body_includes_in_order(*strings)
    pattern = Regexp.new("#{strings.map { |s| Regexp.escape(s) }.join("|")}")
    matches = last_response.body
      .scan(pattern)
      .uniq
    assert_equal strings, matches
  end

  def refute_body_includes(text)
    refute_includes(last_response.body, text)
  end
end
