# frozen_string_literal: true
module RepositoryHelpers
  ValueType = GraphQL::ObjectType.deprecated_define do
    name "Value"
    field :int, types.Int, resolve: Proc.new { 1 }
    field :value, ValueType
    field :unused2, types.String
  end

  QueryType = GraphQL::ObjectType.deprecated_define do
    name "Query"
    field :int, types.Int do
      argument :value, types.Int, default_value: 1
      resolve ->(o, a, c) { a[:value] }
    end

    field :str, types.String

    field :value, !ValueType

    field :unused1, types.Int
  end

  Schema = GraphQL::Schema.deprecated_define do
    query QueryType
  end

  ALL_QUERIES = <<-GRAPHQL
  query getInt($value: Int) {
    int(value: $value)
    ...GetInt
  }

  query getTwo { two: int(value: 2) }

  fragment GetInt on Query {
    fragInt: int
    ...NestedInt
  }

  fragment NestedInt on Query {
    nestedInt: int(value: 4)
  }
  GRAPHQL

  DOCS_PATH = File.expand_path("../documents/", __FILE__)
  def get_repo(schema: Schema, string: ALL_QUERIES, path: nil, **rest)
    if path
      string = nil
    end

    GraphQL::Pro::Repository.define(
      schema: schema,
      string: string,
      path: path,
      **rest
    )
  end

  def reload_repositories
    GraphQL::Pro::Repository::Reloader.execute
  end
end
