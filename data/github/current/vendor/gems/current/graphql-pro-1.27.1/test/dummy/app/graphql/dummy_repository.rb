# frozen_string_literal: true
DummyRepository = GraphQL::Pro::Repository.define do
  schema DummySchema
  path Rails.root.join("app/graphql/documents")
end
