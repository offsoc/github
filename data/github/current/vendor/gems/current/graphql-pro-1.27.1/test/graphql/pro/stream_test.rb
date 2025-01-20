# frozen_string_literal: true
require "test_helper"

class GraphQLProStreamTest < Minitest::Test
  parallelize_me!

  include Rack::Test::Methods
  include DeferHelpers

  class StreamSchema < GraphQL::Schema
    class IntegerList < GraphQL::Schema::Object
      field :ints, [Integer], null: false
      def ints
        context[:int] ||= 0
        3.times.map {
          context[:int] += 1
        }
      end

      field :int_list, IntegerList, null: false
      def int_list
        :int_list
      end

      field :int_lists, [IntegerList], null: false
      def int_lists
        [:int_list, :int_list]
      end

      field :execution_errors, [String], null: true
      def execution_errors
        [GraphQL::ExecutionError.new("Broke!")]
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
      field :int, Integer
      def int
        @context[:int] ||= 0
        @context[:int] += 1
      end

      field :int_list, IntegerList
      def int_list
        GraphQL::Execution::Lazy.new { :int_list }
      end

      field :int_lists, [IntegerList]
      def int_lists
        [
          GraphQL::Execution::Lazy.new { :int_list },
          GraphQL::Execution::Lazy.new { :int_list },
        ]
      end

      field :multibyte_chars, [String], null: false
      def multibyte_chars
        ["😈"]
      end

      field :ints, [Integer], null: false
      def ints
        context[:int] ||= 0
        3.times.map {
          context[:int] += 1
        }
      end
    end

    query(Query)
    use GraphQL::Pro::Stream
    use GraphQL::Dataloader
  end

  def test_it_streams_items
    res = StreamSchema.execute "{
      i1: intList { ints }
      i2: intList { ints @stream }
    }"

    expected_first_response = {"i1"=>{"ints"=>[1, 2, 3]}, "i2"=>{ "ints" => [] }}
    assert_equal(expected_first_response, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      {data: expected_first_response, hasNext: true},
      {path: ["i2", "ints", 0], data: 4, hasNext: true},
      {path: ["i2", "ints", 1], data: 5, hasNext: true},
      {path: ["i2", "ints", 2], data: 6, hasNext: false},
    ]
    assert_equal(expected_patches, patches, "each patch comes through")
    assert_equal({"i1"=>{"ints"=>[1, 2, 3]}, "i2"=>{"ints"=>[4, 5, 6]}}, res["data"], "The final response")
  end

  def test_it_handles_too_big_initial_count_by_returning_all
    res = StreamSchema.execute "{
      intList { ints @stream(initialCount: 20) }
    }"
    expected_first_response = {"intList"=>{"ints"=>[1, 2, 3]}}
    assert_equal(expected_first_response, res["data"], "The undeferred response")
    assert_nil(get_patches(res), "There's only one patch")
  end

  def test_it_works_with_dataloader
    res = StreamSchema.execute "{
      intList {
        dataloadedInts @stream
      }
    }"
    expected_patches = [
      {:data=>{"intList"=>{"dataloadedInts"=>[]}}, hasNext: true},
      {:path=>["intList", "dataloadedInts", 0], :data=>3, hasNext: true},
      {:path=>["intList", "dataloadedInts", 1], :data=>3, hasNext: true},
      {:path=>["intList", "dataloadedInts", 2], :data=>3, hasNext: false}
    ]
    assert_equal expected_patches, get_patches(res)
  end

  def test_it_returns_initial_count
    res = StreamSchema.execute "{
      intList { ints @stream(initialCount: 2) }
    }"

    expected_first_response = {"intList"=>{"ints"=>[1, 2]}}
    assert_equal(expected_first_response, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      {data: expected_first_response, hasNext: true},
      {path: ["intList", "ints", 2], data: 3, hasNext: false},
    ]
    assert_equal(expected_patches, patches, "each patch comes through")
    assert_equal({"intList"=>{"ints"=>[1, 2, 3]}}, res["data"], "The final response")
  end

  def test_it_accepts_if
    res = StreamSchema.execute "{
      i1: intList { ints }
      i2: intList { ints @stream(if: false) }
      i3: intList { ints @stream(if: true, initialCount: 1) }
    }"

    expected_first_response = {
      "i1" => { "ints" => [1, 2, 3] },
      "i2" => { "ints" => [4, 5, 6] },
      "i3" => { "ints" => [7]},
    }
    assert_equal(expected_first_response, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      {data: expected_first_response, hasNext: true},
      {path: ["i3", "ints", 1], data: 8, hasNext: true },
      {path: ["i3", "ints", 2], data: 9, hasNext: false },
    ]
    assert_equal(expected_patches, patches)
  end

  def test_it_runs_nested_streams
    res = StreamSchema.execute "{
      int
      intLists @stream {
        intLists @stream {
          ints @stream
        }
      }
    }"

    expected_initial_data = {"int"=>1, "intLists"=>[]}
    assert_equal(expected_initial_data, res["data"], "The undeferred response")

    patches = get_patches(res)
    expected_patches = [
      {:data=>expected_initial_data, hasNext: true},
      {path: ["intLists", 0], data: { "intLists" => [] }, hasNext: true},
      {path: ["intLists", 1], data: { "intLists" => [] }, hasNext: true},
      {path: ["intLists", 0, "intLists", 0], data: {"ints"=>[]}, hasNext: true},
      {path: ["intLists", 0, "intLists", 1], data: {"ints"=>[]}, hasNext: true},
      {path: ["intLists", 1, "intLists", 0], data: {"ints"=>[]}, hasNext: true},
      {path: ["intLists", 1, "intLists", 1], data: {"ints"=>[]}, hasNext: true},
      {path: ["intLists", 0, "intLists", 0, "ints", 0], data: 2, hasNext: true},
      {path: ["intLists", 0, "intLists", 0, "ints", 1], data: 3, hasNext: true},
      {path: ["intLists", 0, "intLists", 0, "ints", 2], data: 4, hasNext: true},
      {path: ["intLists", 0, "intLists", 1, "ints", 0], data: 5, hasNext: true},
      {path: ["intLists", 0, "intLists", 1, "ints", 1], data: 6, hasNext: true},
      {path: ["intLists", 0, "intLists", 1, "ints", 2], data: 7, hasNext: true},
      {path: ["intLists", 1, "intLists", 0, "ints", 0], data: 8, hasNext: true},
      {path: ["intLists", 1, "intLists", 0, "ints", 1], data: 9, hasNext: true},
      {path: ["intLists", 1, "intLists", 0, "ints", 2], data: 10, hasNext: true},
      {path: ["intLists", 1, "intLists", 1, "ints", 0], data: 11, hasNext: true},
      {path: ["intLists", 1, "intLists", 1, "ints", 1], data: 12, hasNext: true},
      {path: ["intLists", 1, "intLists", 1, "ints", 2], data: 13, hasNext: false},
    ]

    assert_equal(expected_patches, patches)
  end

  def test_it_streams_with_lazy
    res = StreamSchema.execute "{
      intList {
        lazyInts @stream
        intList {
          lazyInts @stream
        }
      }
    }"

    patches = get_patches(res)

    expected_patches = [
      { data: { "intList" => { "lazyInts" => [], "intList" => { "lazyInts" => [] } } }, hasNext: true },
      { path: ["intList", "lazyInts", 0], data: 1, hasNext: true },
      { path: ["intList", "lazyInts", 1], data: 2, hasNext: true },
      { path: ["intList", "lazyInts", 2], data: 3, hasNext: true },
      { path: ["intList", "intList", "lazyInts", 0], data: 4, hasNext: true },
      { path: ["intList", "intList", "lazyInts", 1], data: 5, hasNext: true },
      { path: ["intList", "intList", "lazyInts", 2], data: 6, hasNext: false },
    ]
    assert_equal expected_patches, patches
  end

  def test_it_streams_errors
    res = StreamSchema.execute "{
      int
      intLists @stream {
        intLists @stream {
          executionErrors @stream
        }
      }
    }"
    patches = get_patches(res)

    expected_patches = [
      {:data=>{"int"=>1, "intLists"=>[]}, hasNext: true},
      {:path=>["intLists", 0], :data=>{"intLists"=>[]}, hasNext: true},
      {:path=>["intLists", 1], :data=>{"intLists"=>[]}, hasNext: true},
      {:path=>["intLists", 0, "intLists", 0],
      hasNext: true,
      :errors=>
        [{"message"=>"Broke!",
          "locations"=>[{"line"=>5, "column"=>11}],
          "path"=>["intLists", 0, "intLists", 0, "executionErrors", 0]}]},
      {:path=>["intLists", 0, "intLists", 1],
      hasNext: true,
      :errors=>
        [{"message"=>"Broke!",
          "locations"=>[{"line"=>5, "column"=>11}],
          "path"=>["intLists", 0, "intLists", 1, "executionErrors", 0]}]},
      {:path=>["intLists", 1, "intLists", 0], hasNext: true,
      :errors=>
        [{"message"=>"Broke!",
          "locations"=>[{"line"=>5, "column"=>11}],
          "path"=>["intLists", 1, "intLists", 0, "executionErrors", 0]}]},
      {:path=>["intLists", 1, "intLists", 1], hasNext: false,
      :errors=>
        [{"message"=>"Broke!",
          "locations"=>[{"line"=>5, "column"=>11}],
          "path"=>["intLists", 1, "intLists", 1, "executionErrors", 0]}]}
    ]

    assert_equal(expected_patches, patches, "patches contain errors")
  end

  def test_skip_takes_priority
    res = StreamSchema.execute "{
      ints @stream
      ints2: ints @stream @skip(if: true)
    }"

    assert_equal({ "ints" => [] }, res["data"], "The undeferred response")
    patches = get_patches(res)
    expected_patches = [
      {data: {"ints" => [] }, hasNext: true},
      {path: ["ints", 0], data: 1, hasNext: true},
      {path: ["ints", 1], data: 2, hasNext: true},
      {path: ["ints", 2], data: 3, hasNext: false},
    ]
    assert_equal(expected_patches, patches, "ints2 is not present because it was skipped")
  end

  def test_it_streams_a_root_field
    res = StreamSchema.execute "{
      ints @stream
    }"
    deferrals = res.context[:defer].deferrals
    root_deferral = deferrals.first

    assert_instance_of GraphQL::Pro::Defer::RootDeferral, root_deferral
    assert_nil root_deferral.path
    assert_nil root_deferral.errors
    assert_equal({"ints" => []}, root_deferral.data)

    patches = get_patches(res)
    assert_equal([
      { data: { "ints" => [] }, hasNext: true },
      { data: 1, path: ["ints", 0], hasNext: true },
      { data: 2, path: ["ints", 1], hasNext: true },
      { data: 3, path: ["ints", 2], hasNext: false },
    ], patches)
  end

  def test_it_includes_label_in_patches
    res = StreamSchema.execute "{
      i1: ints @stream
      i2: ints @stream(label: \"stream-2\")
    }"

    patches = get_patches(res)
    expected_patches = [
      {:data=>{"i1"=>[], "i2"=>[]}, hasNext: true},
      {:path=>["i1", 0], :data=>1, hasNext: true},
      {:path=>["i1", 1], :data=>2, hasNext: true},
      {:path=>["i1", 2], :data=>3, hasNext: true},
      {:path=>["i2", 0], :label=>"stream-2", :data=>4, hasNext: true},
      {:path=>["i2", 1], :label=>"stream-2", :data=>5, hasNext: true},
      {:path=>["i2", 2], :label=>"stream-2", :data=>6, hasNext: false},
    ]
    assert_equal expected_patches, patches
  end

  def test_it_ignores_stream_on_non_lists
    # It _could_ raise an error here instead
    res = StreamSchema.execute "{
      i1: int @stream
      i2: int @stream
    }"
    assert_equal({ "i1" => 1, "i2" => 2}, res["data"])
    assert_nil get_patches(res)
  end

  def test_it_creates_http_multipart
    res = StreamSchema.execute "{
      ints @stream
      multibyteChars @stream
    }"

    multiparts = res.context[:defer].map.with_index { |deferral, idx| deferral.to_http_multipart(first: idx == 0) }
    assert_equal 5, multiparts.size
    first_part, second_part, third_part, fourth_part, fifth_part = multiparts
    validate_multipart(first_part)
    validate_multipart(second_part)
    validate_multipart(third_part)
    validate_multipart(fourth_part)
    validate_multipart(fifth_part)
    expected_multiparts = [
      "\r\n---\r\nContent-Type: application/json\r\nContent-Length: 55\r\n\r\n{\"hasNext\":true,\"data\":{\"ints\":[],\"multibyteChars\":[]}}\r\n---",
      "\r\nContent-Type: application/json\r\nContent-Length: 43\r\n\r\n{\"path\":[\"ints\",0],\"hasNext\":true,\"data\":1}\r\n---",
      "\r\nContent-Type: application/json\r\nContent-Length: 43\r\n\r\n{\"path\":[\"ints\",1],\"hasNext\":true,\"data\":2}\r\n---",
      "\r\nContent-Type: application/json\r\nContent-Length: 43\r\n\r\n{\"path\":[\"ints\",2],\"hasNext\":true,\"data\":3}\r\n---",
      "\r\nContent-Type: application/json\r\nContent-Length: 59\r\n\r\n{\"path\":[\"multibyteChars\",0],\"hasNext\":false,\"data\":\"😈\"}\r\n-----",
    ]
    assert_equal expected_multiparts[0], first_part
    assert_equal expected_multiparts[1], second_part
    assert_equal expected_multiparts[2], third_part
    assert_equal expected_multiparts[3], fourth_part
    assert_equal expected_multiparts[4], fifth_part
  end

  def test_it_streams_http_multipart
    res = StreamSchema.execute "{
      ints
      int2: ints @stream
    }"

    deferred = res.context[:defer]
    response = DummyResponse.new
    deferred.stream_http_multipart(response)
    expected_headers = { "Content-Type" => "multipart/mixed; boundary=\"-\"" }
    assert_equal(expected_headers, response.headers)
    assert_equal(4, response.patches.size)
    assert response.patches.last.end_with?("\r\n-----"), "It adds a terminator"
  end

  # Rack::Test Setup
  def app
    builder = Rack::Builder.new
    builder.run DeferHelpers.create_streaming_sinatra_app(StreamSchema)
  end

  def test_it_runs_with_sinatra_streaming
    post "/graphql", {query: "{ i1: ints i2: ints @stream }"}
    expected_body = '{"hasNext":true,"data":{"i1":[1,2,3],"i2":[]}}

{"path":["i2",0],"hasNext":true,"data":4}

{"path":["i2",1],"hasNext":true,"data":5}

{"path":["i2",2],"hasNext":false,"data":6}

'
    assert_equal expected_body, last_response.body
  end
end
