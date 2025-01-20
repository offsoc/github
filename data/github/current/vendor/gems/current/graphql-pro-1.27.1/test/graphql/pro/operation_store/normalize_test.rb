# frozen_string_literal: true
require "test_helper"

class GraphQLProOperationStoreNormalizeTest < Minitest::Test
  def assert_normalizes_to(expected, input)
    begin
      doc = GraphQL.parse(input)
    rescue GraphQL::ParseError => err
      assert_nil err, err.message
    end

    result = GraphQL::Pro::OperationStore::Normalize.to_normalized_graphql(doc)

    begin
      GraphQL.parse(expected)
    rescue GraphQL::ParseError => err
      assert_equal false, true, "Expected normalized GraphQL is invalid: #{expected} (#{err})"
    end
    assert_equal(expected, result)
  end

  def test_it_orders_fields
    normalized = "query{a,b,c:b,d:c,d1,dA,da,...F}"
    assert_normalizes_to(normalized, "{ ... F a, b, c: b, d: c, dA, da, d1 }")
    assert_normalizes_to(normalized, "{\n b, c:\nb, d: c,\n ... F\n  d1, da, dA, a }")

    nested_normalized = "query{a{b,c@skip(if:true)},z{b,c},...{A2,a1},...Q@b@a}"
    nested_raw = "{ z { c  b } a {b,c\n @skip(if: true)} ... Q @b @a ... { a1 A2 }}"
    assert_normalizes_to(nested_normalized, nested_raw)
  end

  def test_it_orders_arguments_and_input_fields
    normalized = "query GetStuff($var:Int=1){a(b:$var,c:1,d:{e:true,f:4.234,g:\"h\",h:$var})}"
    raw = "query GetStuff($var: Int = 1) { a(c: 1, d: { e: true, g: \"h\", f: 4.234, h:$var}, b: $var) }"
    assert_normalizes_to(normalized, raw)
  end

  def test_it_orders_query_variables
    normalized = "query GetStuff($BB:Int!,$a:[String!]!=[\"a\"],$bb:Thing={a:1,b:{c:true,d:false}},$z:ID=1){a}"
    raw = "query GetStuff($z: ID = 1, $BB: Int!, $bb: Thing = {a: 1, b: { d: false, c: true }}, $a: [String!]! = [\"a\"]){a}"
    assert_normalizes_to(normalized, raw)
  end

  def test_it_orders_operations_and_fragments
    normalized = "mutation{anon}mutation B{b}query{anon}query Z{z}subscription{anon}"
    raw = "query Z { z }\nmutation B { b }\n{ anon }\nmutation { anon }\nsubscription{anon}"
    assert_normalizes_to(normalized, raw)

    normalized = "query{a}query Z{z}fragment C on B{c}fragment X on Y{x}"
    raw = "query { a } fragment X on Y { x } fragment C on B { c } query Z { z }"
    assert_normalizes_to(normalized, raw)
  end

  def test_it_doesnt_order_directives
    normalized = "query{a@z(if:0)@a(a:true,b:C),b@include(if:null)}"
    raw = "{ b @include(if: null) a @z(if: 0) @a(b: C, a: true)}"
    assert_normalizes_to(normalized, raw)
  end

  def test_it_normalizes_the_kitchen_sink
    kitchen_sink = File.read("./test/graphql/pro/operation_store/kitchen-sink.graphql")
    kitchen_sink_normalized = File.read("./test/graphql/pro/operation_store/kitchen-sink-normalized.graphql").chomp
    assert_normalizes_to(kitchen_sink_normalized, kitchen_sink)
  end

  def test_it_doesnt_drop_variables_defaults
    normalized = "query A($b:Boolean=true){c@include(if:$b)}"
    raw = "query A($b: Boolean = true) { c @include(if: $b) }"
    assert_normalizes_to(normalized, raw)

    normalized = "query A($b:Boolean=false){c@include(if:$b)}"
    raw = "query A($b: Boolean = false) { c @include(if: $b) }"
    assert_normalizes_to(normalized, raw)

    normalized = "query A($b:Boolean=null){c@include(if:$b)}"
    raw = "query A($b: Boolean = null) { c @include(if: $b) }"
    assert_normalizes_to(normalized, raw)
  end

  def test_it_works_with_custom_directives_4703
    str_1 = <<~GRAPHQL
    query ProfileModalQuery {
      viewer {
        id
      }
    }
    GRAPHQL

    str_1_normalized = "query ProfileModalQuery{viewer{id}}"
    str_2 = <<~GRAPHQL
    query ProfileModalQuery @codeOwner(owner: "team-oxygen") {
      viewer {
        id
      }
    }
    GRAPHQL

    str_2_normalized = "query ProfileModalQuery@codeOwner(owner:\"team-oxygen\"){viewer{id}}"
    assert_normalizes_to(str_1_normalized, str_1)
    assert_normalizes_to(str_2_normalized, str_2)

    fragment_dir = <<~GRAPHQL
    query($int: Int) {
      ...F
    }
    fragment F on Query @something {
      f1
    }
    GRAPHQL

    fragment_dir_normalized = "query($int:Int){...F}fragment F on Query@something{f1}"
    assert_normalizes_to(fragment_dir_normalized, fragment_dir)
  end
end
