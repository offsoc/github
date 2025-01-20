# frozen_string_literal: true
require_relative "./connection_helpers"

module OperationStoreHelpers
  def init_clients(*names)
    names.each do |name|
      @store.upsert_client(name, name + "-secret")
    end
    if block_given?
      begin
        yield
      ensure
        names.each do |name|
          @store.delete_client(name)
        end
      end
    end
  end

  module BeforeQueryDocumentUser
    def execute_query(query:)
      if query.context.errors.none? && query.query_string.nil?
        raise "this is an example instrumenter that reads the query_string"
      end
      super
    end
  end

  INVALID_CLIENT_DOC_1 = <<-GRAPHQL
  # Two ops with the same name
  query GetCard($id: ID!) { card(id: $id) { name } }
  query GetCard($id: ID!) { card(id: $id) { colors } }
  # Unnamed Op
  { __typename }
  GRAPHQL

  def operation_count
    @store.all_operations(page: 1, per_page: 500).total_count
  end

  def self.add_fixtures(store)
    ["x-client-1", "x-client-2", "client-1", "client-2", "client-3"].each do |name|
      store.upsert_client(name, name + "-secret")
    end

    # Incremental addition
    store.add(body: "query GetTypename { __typename }", client_name: "x-client-1", operation_alias: "q-1")
    store.add(body: "query GetTypename2 { __typename }", client_name: "x-client-1", operation_alias: "q-2")
    # different client name
    store.add(body: "query GetTypename2 { __typename }", client_name: "x-client-2", operation_alias: "q-2")

    # For testing last-used-at
    store.add(body: "query GetExpansionReleaseDate { expansion(sym: \"ISD\") { release_date } }", client_name: "client-3", operation_alias: "q-3")

    client_doc = <<-GRAPHQL
    query GetExpansion1 {
      expansion(sym: "SHM") {
        ...ExpansionFields
      }
    }
    fragment ExpansionFields on Expansion {
      name
      sym
    }
    GRAPHQL

    client_doc2 = <<-GRAPHQL
    query GetExpansion2($sym: String!) {
      expansion(sym: $sym) {
        name
        ...ExpansionFields
      }
    }


    fragment ExpansionFields on Expansion {
      name
      sym
    }
    GRAPHQL

    # Add as client-1
    store.add(body: client_doc, operation_alias: "GetExpansion1", client_name: "client-1")
    store.add(body: client_doc2, operation_alias: "GetExpansion2", client_name: "client-1")

    # Add as client-2
    store.add(body: client_doc, operation_alias: "GetExpansion1", client_name: "client-2")
    store.add(body: client_doc2, operation_alias: "GetExpansion/2", client_name: "client-2")
    store.add(
      body: "query GetCard($id: ID!) { card(id: $id) { name } }",
      operation_alias: "GetCard",
      client_name: "client-2",
    )
  end

  if rails_loaded?
    class ActiveRecordBackendSchema < ConnectionHelpers::Schema
      trace_with(OperationStoreHelpers::BeforeQueryDocumentUser)
      use GraphQL::Pro::OperationStore
      trace_with GraphQL::Tracing::DataDogTrace
    end

    class ActiveRecordBackendSchemaWithTraceTrue < ConnectionHelpers::Schema
      trace_with(OperationStoreHelpers::BeforeQueryDocumentUser)
      trace_with GraphQL::Tracing::DataDogTrace
      # This is required to come after Datadog Trace
      use GraphQL::Pro::OperationStore, trace: true
    end
  end

  module Assertions
    def assert_adds_operations(add_op_count)
      before_op_count = operation_count
      yield
      after_op_count = operation_count
      expected_op_count_diff = add_op_count
      op_count_diff = after_op_count - before_op_count
      all_names = @store.all_operations(page: 1, per_page: 100).items.map(&:name)
      assert_equal expected_op_count_diff, op_count_diff, "Adds #{expected_op_count_diff} more operations (found: #{all_names})"
    end
  end
end
