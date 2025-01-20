# frozen_string_literal: true
DummySchema = GraphQL::Schema.define do
  query(Types::QueryType)
end
