# frozen_string_literal: true
Types::QueryType = GraphQL::ObjectType.define do
  name "Query"
  field :one, !types.Int, resolve: ->(o, a, c) { 1 }
  field :two, !types.Int, resolve: ->(o, a, c) { 2 }
end
