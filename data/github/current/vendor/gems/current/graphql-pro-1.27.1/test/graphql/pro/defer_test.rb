# frozen_string_literal: true
require "test_helper"

class GraphQLProDeferTest < Minitest::Test
  parallelize_me!

  include Rack::Test::Methods
  include DeferHelpers

  class DeferSchema < GraphQL::Schema
    class NumberLoader < GraphQL::Batch::Loader
      def perform(numbers)
        numbers.each { |n| fulfill(n, numbers.size) }
      end
    end

    class IntegerList < GraphQL::Schema::Object
      field :ints, [Integer], null: false
      def ints
        context[:int] ||= 0
        3.times.map {
          context[:int] += 1
        }
      end

      field :batched_ints, [Integer]
      def batched_ints
        4.times.map { |n| NumberLoader.load(n) }
      end

      field :int_list, IntegerList, null: false
      def int_list
        :int_list
      end

      field :execution_error, String, null: true
      def execution_error
        raise GraphQL::ExecutionError, "Broke!"
      end

      field :lazy_ints, [Integer], null: false
      def lazy_ints
        context[:int] ||= 0
        GraphQL::Execution::Lazy.new {
          3.times.map {
            GraphQL::Execution::Lazy.new { context[:int] += 1 }
          }
        }
      end

      field :dataloaded_int, Integer, null: false

      def dataloaded_int
        dataloader.with(IntSource, context).load(SecureRandom.hex)
      end

      field :dataloaded_ints, [Integer], null: false

      def dataloaded_ints
        r1 = dataloader.with(IntSource, context).request(SecureRandom.hex)
        r2 = dataloader.with(IntSource, context).request(SecureRandom.hex)
        r3 = dataloader.with(IntSource, context).request(SecureRandom.hex)
        [r1.load, r2.load, r3.load]
      end
    end

    class IntSource < GraphQL::Dataloader::Source
      def initialize(context)
        @context = context
      end

      def self.batch_key_for(_context)
        :shared
      end

      def fetch(random_keys)
        @context[:int] ||= 0
        v = @context[:int] += random_keys.size
        random_keys.map { |k| v }
      end
    end

    class Query < GraphQL::Schema::Object
      field :int, Integer, null: false
      def int
        context[:int] ||= 0
        context[:int] += 1
      end

      field :batched_int, Integer do
        argument :key, Integer, default_value: 0
      end

      def batched_int(key:)
        NumberLoader.load(key)
      end

      field :int_list, IntegerList, null: false
      def int_list
        GraphQL::Execution::Lazy.new { :int_list }
      end

      field :batched_int_list, IntegerList, null: false
      def batched_int_list
        NumberLoader.load(5) # just return a truthy promise
      end

      field :multibyte_chars, String, null: false
      def multibyte_chars
        "😈"
      end
    end

    query(Query)

    class Defer < GraphQL::Pro::Defer
      def self.resolve(obj, arguments, context, &block)
        context[:graphql_batch_executor] ||= GraphQL::Batch::Executor.current
        super
      end

      class Deferral < GraphQL::Pro::Defer::Deferral
        def resolve
          prev_executor = GraphQL::Batch::Executor.current
          GraphQL::Batch::Executor.current ||= @context[:graphql_batch_executor]
          super
        ensure
          GraphQL::Batch::Executor.current = prev_executor
        end
      end
    end

    use Defer
    use GraphQL::Dataloader
    use GraphQL::Batch
  end

  def test_it_defers_patches
    res = DeferSchema.execute "{
      i1: int
      i2: int @defer
      i3: int @defer
    }"

    assert_equal({"i1" => 1}, res["data"], "The undeferred response")
    patches = get_patches(res)
    expected_patches = [
      {data: {"i1" => 1}, hasNext: true},
      {path: ["i2"], data: 2, hasNext: true},
      {path: ["i3"], data: 3, hasNext: false}
    ]
    assert_equal(expected_patches, patches, "each patch comes through")
    assert_equal({"i1" => 1, "i2" => 2,"i3" => 3 }, res["data"], "The final response")
  end

  def test_it_accepts_if
    res = DeferSchema.execute "{
      i1: int
      i2: int @defer(if: false)
      i3: int @defer(if: true)
    }"

    assert_equal({"i1" => 1, "i2" => 2}, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      {data: {"i1" => 1, "i2" => 2}, hasNext: true},
      {path: ["i3"], data: 3, hasNext: false}
    ]
    assert_equal(expected_patches, patches)
  end

  def test_it_runs_nested_defers
    res = DeferSchema.execute "{
      int
      intList @defer {
        intList @defer {
          ints @defer
        }
      }
    }"

    assert_equal({"int" => 1}, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      { data: { "int" => 1}, hasNext: true },
      { path: ["intList"], data: {}, hasNext: true },
      { path: ["intList", "intList"], data: {}, hasNext: true },
      { path: ["intList", "intList", "ints"], data: [2,3,4], hasNext: false },
    ]
    assert_equal(expected_patches, patches)
  end

  def test_it_defers_fragment_spreads
    res = DeferSchema.execute "
    {
      i1: int
      ...QueryFragment @defer
    }

    fragment QueryFragment on Query {
      intList {
        i2: dataloadedInt
        i3: dataloadedInt
      }
    }"

    assert_equal({"i1" => 1}, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      { data: { "i1" => 1}, hasNext: true },
      { path: [], hasNext: false, data: { "intList" => { "i2" => 3, "i3" => 3 } } },
    ]
    assert_equal expected_patches, patches
  end

  def test_it_defers_inside_fragments
    res = DeferSchema.execute "
    {
      i1: int
      ...QueryFragment
    }

    fragment QueryFragment on Query {
      intList {
        i2: dataloadedInt @defer
        i3: dataloadedInt
      }
    }"

    assert_equal({"i1" => 1, "intList" => { "i3" => 2 }}, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      { data: { "i1" => 1, "intList" => { "i3" => 2 }}, hasNext: true },
      { path: ["intList", "i2"], hasNext: false, data: 3 },
    ]
    assert_equal expected_patches, patches
  end

  def test_it_defers_on_anonymous_fragments_inside_fragments
    res = DeferSchema.execute "
    {
      i1: int
      ...QueryFragment
    }

    fragment QueryFragment on Query {
      intList {
        i2: dataloadedInt @defer
        i3: dataloadedInt
      }
    }"

    assert_equal({"i1" => 1, "intList" => { "i3" => 2 }}, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      { data: { "i1" => 1, "intList" => { "i3" => 2 }}, hasNext: true },
      { path: ["intList", "i2"], hasNext: false, data: 3 },
    ]
    assert_equal expected_patches, patches
  end

  def test_it_defers_inline_fragments
    res = DeferSchema.execute "
    {
      i1: int
      ... @defer {
        i2: int
      }
    }"

    assert_equal({"i1" => 1}, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      { data: { "i1" => 1}, hasNext: true },
      { path: [], data: { "i2" => 2 }, hasNext: false },
    ]
    assert_equal expected_patches, patches
  end

  def test_it_defers_with_lazy
    res = DeferSchema.execute "{
      intList @defer {
        lazyInts @defer
        intList {
          lazyInts @defer
        }
      }
    }"

    patches = get_patches(res)
    expected_patches = [
      { data: {}, hasNext: true },
      { path: ["intList"], data: { "intList" => {} }, hasNext: true },
      { path: ["intList", "lazyInts"], data: [1,2,3], hasNext: true },
      { path: ["intList", "intList", "lazyInts"], data: [4,5,6], hasNext: false },
    ]
    assert_equal expected_patches, patches
  end

  def test_it_defers_errors
    res = DeferSchema.execute "{
      int
      intList @defer {
        intList @defer {
          executionError @defer
        }
      }
    }"

    expected_patches = [
      { data: {"int" => 1 }, hasNext: true },
      { path: ["intList"], data: {}, hasNext: true },
      { path: ["intList", "intList"], data: {}, hasNext: true },
      {
        path: ["intList", "intList", "executionError"],
        errors: [{"message"=>"Broke!", "locations"=>[{"line"=>5, "column"=>11}], "path"=>["intList", "intList", "executionError"]}],
        hasNext: false,
      },
    ]

    patches = get_patches(res)
    assert_equal(expected_patches, patches, "patches contain errors")
  end

  def test_skip_takes_priority
    res = DeferSchema.execute "{
      int @defer
      int2: int @defer @skip(if: true)
    }"

    assert_equal({}, res["data"], "The undeferred response")
    patches = get_patches(res)
    expected_patches = [
      {data: {}, hasNext: true},
      {path: ["int"], data: 1, hasNext: false},
    ]
    assert_equal(expected_patches, patches, "int2 is not present because it was skipped")
  end

  def test_it_adds_a_root_deferral
    res = DeferSchema.execute "{
      int
      int2: int @defer
    }"
    deferrals = res.context[:defer].deferrals
    root_deferral = deferrals.first

    assert_instance_of GraphQL::Pro::Defer::RootDeferral, root_deferral
    assert_nil root_deferral.path
    assert_nil root_deferral.errors
    assert root_deferral.has_next?
    assert_equal({"int" => 1}, root_deferral.data)

    refute deferrals.last.has_next?
  end

  def test_it_includes_label_in_patches
    res = DeferSchema.execute "{
      int
      int2: int @defer(label: \"int2-label\")
    }"

    patches = get_patches(res)
    expected_patches = [
      { data: { "int" => 1 }, hasNext: true },
      { path: ["int2"], data: 2, label: "int2-label", hasNext: false },
    ]
    assert_equal expected_patches, patches
  end

  def test_it_defers_fields_that_return_arrays
    res = DeferSchema.execute "{
      intList {
        dataloadedInts @defer
       }
    }"

    patches = get_patches(res)
    expected_patches = [
      { data: { "intList" => {} }, hasNext: true },
      { path: ["intList", "dataloadedInts"], data: [3, 3, 3], hasNext: false },
    ]
    assert_equal expected_patches, patches
  end

  def test_it_creates_http_multipart
    res = DeferSchema.execute "{
      multibyteChars
      intList @defer {
        ints
      }
    }"

    multiparts = res.context[:defer].map.with_index { |deferral, idx| deferral.to_http_multipart(first: idx == 0) }
    assert_equal 2, multiparts.size
    first_part, second_part = multiparts
    validate_multipart(first_part)
    assert_equal "\r\n---\r\nContent-Type: application/json\r\nContent-Length: 49\r\n\r\n{\"hasNext\":true,\"data\":{\"multibyteChars\":\"😈\"}}\r\n---", first_part
    validate_multipart(second_part)
    assert_equal "\r\nContent-Type: application/json\r\nContent-Length: 60\r\n\r\n{\"path\":[\"intList\"],\"hasNext\":false,\"data\":{\"ints\":[1,2,3]}}\r\n-----", second_part
  end

  def test_it_works_with_multiplex
    res = DeferSchema.multiplex([
      { query: "{ int int2: int @defer }" },
      { query: "{
        int
        intList @defer {
          intList @defer {
            executionError @defer
          }
        }
      }" },
      { query: "
      {
        i1: int
        ...QueryFragment @defer
      }

      fragment QueryFragment on Query {
        intList {
          i2: dataloadedInt
          i3: dataloadedInt
        }
      }", }
    ])

    expected_patches = [
      [
        { data: { "int" => 1 }, hasNext: true },
        { path: ["int2"], hasNext: false, data: 2}
      ],
      [
        { data: {"int" => 1 }, hasNext: true },
        { path: ["intList"], data: {}, hasNext: true },
        { path: ["intList", "intList"], data: {}, hasNext: true },
        {
          path: ["intList", "intList", "executionError"],
          errors: [{"message"=>"Broke!", "locations"=>[{"line"=>5, "column"=>13}], "path"=>["intList", "intList", "executionError"]}],
          hasNext: false,
        },
      ],
      [
        { data: { "i1" => 1}, hasNext: true },
        { path: [], hasNext: false, data: { "intList" => { "i2" => 3, "i3" => 3 } } },
      ]
    ]

    actual_patches = []
    res.each do |query_res|
      actual_patches << get_patches(query_res)
    end

    expected_patches.each_with_index do |expected, i|
      expected.each_with_index do |exp_patch, i2|
        assert_equal exp_patch, actual_patches[i][i2], "Patches for [#{i}, #{i2}] matched"
      end
    end
  end

  def test_it_streams_http_multipart
    res = DeferSchema.execute "{
      int
      int2: int @defer
      int3: int @defer
    }"

    deferred = res.context[:defer]
    response = DummyResponse.new
    deferred.stream_http_multipart(response)
    expected_headers = { "Content-Type" => "multipart/mixed; boundary=\"-\"" }
    assert_equal(expected_headers, response.headers)
    assert_equal(3, response.patches.size)
    assert response.patches.last.end_with?("\r\n-----"), "It adds a terminator"
  end

  def test_it_streams_new_apollo_style
    res = DeferSchema.execute "{
      int
      int2: int @defer
      int3: int @defer
    }"

    deferred = res.context[:defer]
    response = DummyResponse.new
    deferred.stream_http_multipart(response, incremental: true)
    expected_headers = { "Content-Type" => "multipart/mixed; boundary=\"-\"" }
    assert_equal(expected_headers, response.headers)
    assert_equal(3, response.patches.size)
    # The first patch has no `incremental:` array
    assert_includes response.patches[0], '{"hasNext":true,"data":{"int":1}}'
    # Later patches do
    assert_includes response.patches[1], '{"incremental":[{"path":["int2"],"data":2}],"hasNext":true}'
    assert_includes response.patches[2], '{"incremental":[{"path":["int3"],"data":3}],"hasNext":false}'
    assert response.patches.last.end_with?("\r\n-----"), "It adds a terminator"
  end

  def test_it_works_with_graphql_batch
    res = DeferSchema.execute "{
      intList {
        intList {
          batchedInts
        }
      }
      int1: batchedInt
      int2: batchedInt @defer
      deferredList: batchedIntList @defer {
        intList @defer {
          batchedInts @defer
        }
      }
      int3: batchedInt(key: 2) @defer
    }", context: { backtrace: true }

    patches = get_patches(res)
    expected_patches = [
      {:hasNext=>true, :data=>{"intList"=>{"intList"=>{"batchedInts"=>[1, 3, 3, 3]}}, "int1"=>1}},
      {:path=>["deferredList"], :hasNext=>true, :data=>{}},
      {:path=>["int2"], :hasNext=>true, :data=>1},
      # This is the cached value from when `2` is in the list:
      {:path=>["int3"], :hasNext=>true, :data=>3},
      {:path=>["deferredList", "intList"], :hasNext=>true, :data=>{}},
      {:path=>["deferredList", "intList", "batchedInts"], :hasNext=>false, :data=>[1, 3, 3, 3]}
    ]
    assert_equal(expected_patches, patches)

    res2 = DeferSchema.execute "{
      deferredList: intList @defer {
        intList @defer {
          batchedInts @defer
        }
      }
      int4: batchedInt(key: 2) @defer
    }"
    patches = get_patches(res2)
    # `1` comes from `key: 2` which is evaluated first
    # then, 0, 2, and 3, which get `3` for a value since there were 3 in the list
    # This is to make sure that the GraphQL-Batch cache is shared between deferred resolutions
    expected_patches = [
      {:hasNext=>true, :data=>{}},
      {:path=>["deferredList"], :hasNext=>true, :data=>{}},
      {:path=>["int4"], :hasNext=>true, :data=>1},
      {:path=>["deferredList", "intList"], :hasNext=>true, :data=>{}},
      {:path=>["deferredList", "intList", "batchedInts"], :hasNext=>false, :data=>[3, 3, 1, 3]}
    ]
    assert_equal(expected_patches, patches)
  end

  # Rack::Test Setup
  def app
    builder = Rack::Builder.new
    builder.run DeferHelpers.create_streaming_sinatra_app(DeferSchema)
  end

  def test_it_runs_with_sinatra_streaming
    post "/graphql", {query: "{ i1: int i2: int @defer }"}
    expected_body = %|{"hasNext":true,"data":{"i1":1}}\n\n{"path":["i2"],"hasNext":false,"data":2}\n\n|
    assert_equal expected_body, last_response.body
  end
end
