# frozen_string_literal: true
require "test_helper"

class GraphQLProRepositoryTest < Minitest::Test
  include RepositoryHelpers

  def test_it_records_source_location
    repo = get_repo
    source_loc = File.expand_path("../../../support/repository_helpers.rb", __FILE__)
    assert_equal source_loc, repo.source_filename
  end

  def test_it_runs_queries
    repo = get_repo
    res = repo.execute(operation_name: "getInt", variables: { "value" => 3 })
    assert_equal( {"int" => 3, "fragInt" => 1, "nestedInt" => 4}, res["data"])
  end

  def test_it_can_allow_arbitrary_input
    query_str = %|query GetInts($int: Int!){ arbInt: int, arbInt2: int(value: $int) }|
    vars = { "int" => 3 }
    repo = get_repo(arbitrary_input: :execute)
    res = repo.execute(query_str, variables: vars)
    assert_equal({"arbInt" => 1, "arbInt2" => 3}, res["data"])

    repo = get_repo
    res = repo.execute(query_str, variables: vars, arbitrary_input: :execute)
    assert_equal({"arbInt" => 1, "arbInt2" => 3}, res["data"])
  end

  def test_it_can_crash_on_arbitrary_input
    query_str = %|query GetInts($int: Int!){ arbInt: int, arbInt2: int(value: $int) }|
    vars = { "int" => 3 }
    repo = get_repo(arbitrary_input: :crash)
    assert_raises(ArgumentError) { repo.execute(query_str, variables: vars) }

    repo = get_repo(arbitrary_input: :execute)
    assert_raises(ArgumentError) { repo.execute(query_str, variables: vars, arbitrary_input: :crash) }
  end

  def test_it_can_ignore_arbitrary_input
    query_str = %|query GetInts($int: Int!){ arbInt: int, arbInt2: int(value: $int) }|
    vars = {}
    repo = get_repo(arbitrary_input: :ignore)
    res = repo.execute(query_str, operation_name: "getTwo", variables: vars)
    assert_equal({"two" => 2}, res["data"])

    repo = get_repo(arbitrary_input: :execute)
    res = repo.execute(query_str, operation_name: "getTwo", variables: vars, arbitrary_input: :ignore)
    assert_equal({"two" => 2}, res["data"])
  end

  def test_it_rejects_invalid_arbitrary_input_settings
    assert_raises(ArgumentError) { get_repo(arbitrary_input: 123) }
    assert_raises(ArgumentError) { get_repo(arbitrary_input: :undefined) }
  end

  def test_it_requires_operation_name_when_no_arbitrary_input
    repo = get_repo(arbitrary_input: :execute)
    assert_raises(ArgumentError) { repo.execute }
  end

  def test_it_handles_unknown_operation_names
    repo = get_repo
    res = repo.execute(operation_name: "unknownOperation")
    expected_result = {
      "errors" => [
        { "message" => "No operation named \"unknownOperation\""}
      ]
    }
    assert_equal(expected_result, res)
  end

  def test_it_raises_when_invalid
    invalid_repo = <<-GRAPHQL
    query getInt {
      int
    }

    fragment UnusedFragment on Query {
      int
    }
    GRAPHQL

    err = assert_raises(GraphQL::Pro::Repository::InvalidRepositoryError) {
      get_repo(string: invalid_repo)
    }

    assert_equal "Fragment UnusedFragment was defined, but not used", err.message
  end

  def test_it_requires_unique_and_present_operation_names
    invalid_repo = <<-GRAPHQL
    {
      int
    }
    GRAPHQL

    err = assert_raises(GraphQL::Pro::Repository::InvalidRepositoryError) {
      get_repo(string: invalid_repo)
    }

    assert_equal "A Repository requires named operations, but there is 1 unnamed operation", err.message

    invalid_repo = <<-GRAPHQL
    { int }
    { int }
    GRAPHQL

    err = assert_raises(GraphQL::Pro::Repository::InvalidRepositoryError) {
      get_repo(string: invalid_repo)
    }

    assert_equal "A Repository requires named operations, but there are 2 unnamed operations", err.message

    invalid_repo = <<-GRAPHQL
    query GetInt { int }
    query GetInt { int }
    GRAPHQL

    err = assert_raises(GraphQL::Pro::Repository::InvalidRepositoryError) {
      get_repo(string: invalid_repo)
    }

    assert_equal %|A Repository requires unique operation names, but 2 operations are named "GetInt"|, err.message
  end

  def test_it_adds_typename
    if GRAPHQL_19_PLUS
      skip "Not updating this feature"
    end

    repo_source = "
    query getStuff {
      value {
        int
        ...ValueFields
        ... on Value {
          value {
            int
          }
        }
      }
    }

    fragment ValueFields on Value {
      int
    }
    "

    modified_repo = <<-GRAPHQL.strip
query getStuff {
  value {
    __typename
    int
    ...ValueFields
    ... on Value {
      __typename
      value {
        __typename
        int
      }
    }
  }
}

fragment ValueFields on Value {
  __typename
  int
}
    GRAPHQL
    repo = get_repo(string: repo_source, add_typename: true)
    assert_equal modified_repo, repo.to_query_string
  end

  def test_it_loads_from_path
    repo = get_repo(path: DOCS_PATH)
    res = repo.execute(operation_name: "GetStuff2", variables: { "value" => 3 })
    assert_equal({"opInt" => 1, "fragInt" => 3, "nestedInt" => 1}, res["data"])
  end

  def test_it_loads_from_pathname
    repo = get_repo(path: Pathname.new(DOCS_PATH))
    res = repo.execute(operation_name: "GetStuff2", variables: { "value" => 3 })
    assert_equal({"opInt" => 1, "fragInt" => 3, "nestedInt" => 1}, res["data"])
  end

  def test_it_tells_unused_fields
    repo = get_repo(path: DOCS_PATH)

    fields = repo.unused_fields
    assert_equal [QueryType, ValueType], fields.keys
    assert_equal ["str", "unused1"], fields[QueryType].map(&:name)
    assert_equal ["value", "unused2"], fields[ValueType].map(&:name)
  end
end
