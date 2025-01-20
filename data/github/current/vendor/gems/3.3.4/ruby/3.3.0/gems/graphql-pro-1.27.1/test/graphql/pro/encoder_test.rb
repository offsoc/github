# frozen_string_literal: true
require "test_helper"

class GraphQLProEncoderTest < Minitest::Test
  parallelize_me!
  include RelayHelpers

  def test_it_encrypts_and_decrypts
    test_enc = Class.new(GraphQL::Pro::Encoder) do
      tag("abcd")
      key("79dd3081cf51c307")
    end

    encrypted_id = test_enc.encode("Person/1")
    decrypted_contents = test_enc.decode(encrypted_id)

    assert_equal "Person/1", decrypted_contents
    assert_equal "mWuJ0NevBcbOwRaRM2tgDOfrfskZ9iGO", encrypted_id
  end

  def test_it_is_applied_to_ids
    query_str = "query getNode($id: ID!) { node(id: $id) { id ... on Thing { value } } }"
    id = NodeEncoder.encode("2")
    res_1 = Schema.execute(query_str, variables: {"id" => id})
    res_2 = Schema.execute(query_str, variables: {"id" => id})

    assert_equal 2, res_1["data"]["node"]["value"]
    assert_equal "2", NodeEncoder.decode(res_2["data"]["node"]["id"])
    assert_equal res_1["data"]["node"]["id"], res_2["data"]["node"]["id"], "It doesn't apply a nonce"
  end

  def test_it_is_applied_to_cursors_with_nonce
    query_str = "query getThings($after: String) { things(after: $after) { edges { node { value } cursor } } }"

    res_1_1 = Schema.execute(query_str)
    res_1_2 = Schema.execute(query_str)

    refute_equal get_first_cursor(res_1_1), get_first_cursor(res_1_2), "It applies a nonce"
    assert_equal 3, get_length(res_1_1)
    assert_equal 3, get_length(res_1_2)

    res_2_1 = Schema.execute(query_str, variables: {"after" => get_first_cursor(res_1_1)})
    res_2_2 = Schema.execute(query_str, variables: {"after" => get_first_cursor(res_1_2)})

    # Both cursors work, even though they're different
    assert_equal 2, get_length(res_2_1)
    assert_equal 2, get_length(res_2_2)
  end

  def test_it_uses_previous_version_cursors
    query_str = "query getThings($after: String) { things(after: $after) { edges { node { value } cursor } } }"

    old_cursor = CursorEncoder2.encode("1", nonce: true)
    res_3 = Schema.execute(query_str, variables: {"after" => old_cursor})
    assert_equal 2, get_length(res_3)
  end

  def get_first_cursor(res)
    res["data"]["things"]["edges"][0]["cursor"]
  end

  def get_length(res)
    res["data"]["things"]["edges"].length
  end

  module ReverseEncoder
    module_function

    def encode(str)
      str.reverse
    end

    def decode(str)
      str.reverse
    end
  end

  def test_overriding_encoder
    enc = Class.new(GraphQL::Pro::Encoder) do
      encoder(ReverseEncoder)
      cipher(nil)
    end

    assert_equal "woC", enc.encode("Cow")
    assert_equal "Fish", enc.decode("hsiF")
  end
end
