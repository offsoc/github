# frozen_string_literal: true
require "test_helper"

class GraphQLProMonitoringTest < Minitest::Test
  parallelize_me!
  include MonitoringHelpers

  Lazy = Struct.new(:value)

  Query = GraphQL::ObjectType.define do
    name "Query"
    field :int, types.Int, resolve: ->(o, a, c) { Lazy.new(1) }
    field :optedInIntField, types.Int, monitoring: true, resolve: ->(o, a, c) { Lazy.new(3) }
    field :optedInIntType, OptedInIntType, resolve: ->(o, a, c) { Lazy.new(3) }
    field :box, BoxType, resolve: ->(o, a, c) { Lazy.new(OpenStruct.new(int: 2)) }
    field :skippedBoxField, BoxType, monitoring: false, resolve: ->(o, a, c) { Lazy.new(OpenStruct.new(int: 2)) }
    field :skippedBoxType, SkippedBoxType, resolve: ->(o, a, c) { Lazy.new(OpenStruct.new(int: 2)) }
  end

  BoxType = GraphQL::ObjectType.define do
    name "Box"
    field :int, types.Int
  end

  SkippedBoxType = GraphQL::ObjectType.define do
    name "SkippedBox"
    monitoring false
    field :int, types.Int
    field :box, BoxType, resolve: ->(o, a, c) { Lazy.new(OpenStruct.new(int: 3)) }
  end

  OptedInIntType = GraphQL::INT_TYPE.redefine do
    name "OptedInInt"
    monitoring(true)
  end

  def build_schema(*platforms, **options)
    GraphQL::Schema.define do
      query Query
      monitoring(*platforms, options)
      lazy_resolve(Lazy, :value)
    end
  end

  def setup
    # Reset all the stubs
    Skylight::CURRENT_TRACE.endpoint = nil
    Skylight::INSTRUMENTS.clear
    ScoutApm::MESSAGES.clear
    NewRelic::MESSAGES.clear
    Appsignal::MESSAGES.clear
    Statsd::MESSAGES.clear
    Datadog::MESSAGES.clear
  end

  def test_it_calls_skylight_platform
    schema = build_schema(:skylight)
    schema.execute("query getInt { int }")
    assert_equal "GraphQL/query.getInt", Skylight::CURRENT_TRACE.endpoint
    assert_equal [
      {title: "GraphQL/query.getInt", category: "graphql.query"},
      {title: "Query.int", category: "graphql.resolve"},
      {title: "Query.int (lazy)", category: "graphql.lazy_resolve", }
    ], Skylight::INSTRUMENTS
  end

  def test_it_prepends_eager_loading
    schema = build_schema(:skylight)
    f = schema.get_field(Query, "int")
    f.name # Force loading :S
    assert_instance_of GraphQL::Pro::Monitoring::SkylightPlatform::Resolve, f.resolve_proc
    assert_instance_of GraphQL::Pro::Monitoring::EagerLoadRelation::Resolve, f.resolve_proc.inner_resolve
    assert_instance_of GraphQL::Pro::Monitoring::SkylightPlatform::Resolve, f.lazy_resolve_proc
    assert_instance_of GraphQL::Pro::Monitoring::EagerLoadRelation::Resolve, f.lazy_resolve_proc.inner_resolve
  end

  def test_it_calls_scout_platform
    schema = build_schema(:scout)
    schema.execute("query getInt { int }")
    assert_equal [
      ["GraphQL", "query.getInt"],
      "start_layer",
      ["GraphQL", "Query.int", { scope: true }],
      ["GraphQL", "Query.int (lazy)", { scope: true }],
      "stop_layer",
      {
        query_string: "query getInt { int }",
        operation_name: "getInt",
        operation_type: "query",
        variables: "{}",
      },
    ], ScoutApm::MESSAGES
  end

  def test_it_calls_new_relic_platform
    schema = build_schema(:new_relic)
    schema.execute("query getInt { int }")
    assert_equal [
      "GraphQL/query.getInt",
      "GraphQL/Query.int",
      "GraphQL/Query.int.lazy",
      {
        variables: {},
        query_string: "query getInt { int }",
      },
    ], NewRelic::MESSAGES
  end

  def test_it_calls_appsignal_platform
    schema = build_schema(:appsignal)
    schema.execute("query getInt { int }")
    assert_equal [
      ["start_event"],
      ["instrument", "int.Query.graphql", nil, nil],
      ["instrument", "lazy.int.Query.graphql", nil, nil,],
      ["finish_event", "getInt.query.graphql", "getInt", "query getInt { int }"],
      ["tag_request", { query_variables: "{}" }],
    ], Appsignal::MESSAGES
  end

  def test_it_calls_statsd_platform
    schema = build_schema(:statsd, statsd: Statsd)
    schema.execute("query getInt { int }")
    assert_equal [
      ["time", "graphql.Query.int"],
      ["time", "graphql.Query.int.lazy"],
      ["timing", "graphql.query.getInt"],
    ], Statsd::MESSAGES
  end

  def test_it_calls_datadog_platform
    schema = build_schema(:datadog)
    schema.execute("query getInt { int }")
    assert_equal [
      {
        "trace" => "GraphQL.query.getInt",
        service: "GraphQL",
        resource: "getInt",
        "GraphQL.operation_type" => "query",
        "GraphQL.operation_name" => "getInt",
        "GraphQL.variables" => "{}",
        "GraphQL.query_string" => "query getInt { int }",
      },
      { "trace" => "GraphQL.Query.int" },
      { "trace" => "GraphQL.Query.int.lazy" },
    ], Datadog::MESSAGES
  end

  def test_it_skips_scalars
    schema = build_schema(:new_relic, :statsd, statsd: Statsd, monitor_scalars: false)
    schema.execute("query getInt { int box { int } }")
    assert_equal [
      "GraphQL/query.getInt",
      "GraphQL/Query.box",
      "GraphQL/Query.box.lazy",
      {
        variables: {},
        query_string: "query getInt { int box { int } }",
      },
    ], NewRelic::MESSAGES

    assert_equal [
      ["time", "graphql.Query.box"],
      ["time", "graphql.Query.box.lazy"],
      ["timing", "graphql.query.getInt"],
    ], Statsd::MESSAGES
  end

  def test_it_skips_opted_out_types
    schema = build_schema(:appsignal, :skylight, monitor_scalars: true)
    schema.execute("{ skippedBoxType { int } }")

    assert_equal [
      ["start_event"],
      ["instrument", "int.SkippedBox.graphql", nil, nil],
      ["finish_event", "anonymous.query.graphql", "anonymous", "{ skippedBoxType { int } }"],
      ["tag_request", { query_variables: "{}" }],
    ], Appsignal::MESSAGES

    assert_equal [
      {title: "GraphQL/query.anonymous", category: "graphql.query"},
      {title: "SkippedBox.int", category: "graphql.resolve"},
    ], Skylight::INSTRUMENTS
  end

  def test_it_skips_opted_out_fields
    schema = build_schema(:scout, :statsd, statsd: Statsd, monitor_scalars: false)
    schema.execute("{ box { int } skippedBoxField { int } }")

    assert_equal [
      ["time", "graphql.Query.box"],
      ["time", "graphql.Query.box.lazy"],
      ["timing", "graphql.query.anonymous"],
    ], Statsd::MESSAGES

    assert_equal [
      ["GraphQL", "query.anonymous"],
      "start_layer",
      ["GraphQL", "Query.box", { scope: true }],
      ["GraphQL", "Query.box (lazy)", { scope: true }],
      "stop_layer",
      {
        query_string: "{ box { int } skippedBoxField { int } }",
        operation_name: "anonymous",
        operation_type: "query",
        variables: "{}",
      },
    ], ScoutApm::MESSAGES
  end

  def test_it_instruments_opted_in_fields
    schema = build_schema(:statsd, statsd: Statsd, monitor_scalars: false)
    schema.execute("{ optedInIntField optedInIntType }")

    assert_equal [
      ["time", "graphql.Query.optedInIntField"],
      ["time", "graphql.Query.optedInIntType"],
      ["time", "graphql.Query.optedInIntField.lazy"],
      ["time", "graphql.Query.optedInIntType.lazy"],
      ["timing", "graphql.query.anonymous"],
    ], Statsd::MESSAGES
  end

  def test_it_handles_blank_strings_and_missing_operation_name
    schema = build_schema(:new_relic, :skylight, :appsignal, :scout, :statsd, :datadog, statsd: Statsd)

    res = schema.execute("")
    if GRAPHQL_110_PLUS
      assert_equal(["errors"], res.keys)
    else
      assert_equal({}, res)
    end

    res = schema.execute("query getInt1 { int } query getInt2 { int }")
    assert_equal 1, res["errors"].length
  end
end
