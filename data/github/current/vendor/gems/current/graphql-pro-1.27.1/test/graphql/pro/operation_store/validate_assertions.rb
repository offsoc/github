# frozen_string_literal: true
require "test_helper"

module GraphQLProOperationStoreValidateAssertions
  class ValidateTestSchema < GraphQL::Schema
    class BaseField < GraphQL::Schema::Field
      def initialize(*args, secret: false, **kwargs, &block)
        @secret = secret
        super(*args, **kwargs, &block)
      end

      def visible?(ctx)
        super && (@secret ? ctx[:can_see_secret] : true)
      end
    end

    class Query < GraphQL::Schema::Object
      field_class BaseField

      field :a, String
      field :b, String, secret: true
    end
    query(Query)
  end

  def test_it_validates_with_the_given_context
    init_clients("validate-client-1", "validate-client-2") do
      query_doc = GraphQL.parse("query GetStuff { a b }")
      schema = @validate_test_schema
      res = GraphQL::Pro::OperationStore::Validate.validate(schema, query_doc, client_name: "validate-client-1")
      assert_equal ["Field 'b' doesn't exist on type 'Query'"], res[0].map(&:message)

      res2 = GraphQL::Pro::OperationStore::Validate.validate(schema, query_doc, client_name: "validate-client-1", context: { can_see_secret: true })
      assert_equal [], res2[0]

      res4 = GraphQL::Pro::OperationStore::AddOperationBatch.call(
        client_name: "validate-client-2",
        operation_store: schema.operation_store,
        operations: [{ "alias" => "abcd", "body" => query_doc.to_query_string }]
      )

      assert_equal ["abcd"], res4[:failed]

      res3 = GraphQL::Pro::OperationStore::AddOperationBatch.call(
        client_name: "validate-client-1",
        operation_store: schema.operation_store,
        operations: [{ "alias" => "abcd", "body" => query_doc.to_query_string }],
        context: { can_see_secret: true }
      )

      assert_equal ["abcd"], res3[:added]


    end
  end
end
