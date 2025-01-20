# frozen_string_literal: true
require "test_helper"

if MODERN_RAILS
  class GraphQLProRailtieTest < ActionDispatch::IntegrationTest
    NEW_DOC_PATH = File.expand_path("../../../dummy/app/graphql/documents/GetTwo.graphql", __FILE__)

    def teardown
      FileUtils.rm_rf(NEW_DOC_PATH)
    end

    def send_graphql_params(graphql_params)
      if Rails::VERSION::STRING > "5"
        post "/graphql", params: graphql_params, xhr: true
      else
        xhr :post, "/graphql", graphql_params
      end
    end

    def test_it_works_at_all
      skip "This test is broken"
      send_graphql_params operation_name: "GetOne"
      res = JSON.parse(@response.body)
      assert_equal 1, res["data"]["one"]
    end

    def test_it_reloads_files
      skip "this test is broken"
      send_graphql_params operation_name: "GetTwo"
      res = JSON.parse(@response.body)
      assert_equal 1, res["errors"].length

      # File.write(NEW_DOC_PATH, "query GetTwo { two }")
      # send_graphql_params operation_name: "GetTwo"
      # res = JSON.parse(@response.body)
      # assert_equal 2, res["data"]["two"]
      #
      # FileUtils.rm(NEW_DOC_PATH)
      # send_graphql_params operation_name: "GetTwo"
      # res = JSON.parse(@response.body)
      # assert_equal 1, res["errors"].length
    end
  end
end
