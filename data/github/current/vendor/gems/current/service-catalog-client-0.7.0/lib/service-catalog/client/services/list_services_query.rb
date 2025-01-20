# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # A list of services.
      module ListServicesQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.list"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "after" => "String",
          "before" => "String",
          "filterId" => "ID",
          "filterSelection" => "ServiceFilterSelectionInput",
          "first" => "Int",
          "hasMaintainer" => "Boolean",
          "hasSlos" => "Boolean",
          "kind" => "String",
          "last" => "Int",
          "name" => "String",
          "nameWithOwner" => "String",
          "offset" => "Int",
          "query" => "String",
          "search" => "String",
        }

        # Convert given query arguments to a search query by invoking its lambda value.
        # Each lambda value takes the arg name and its passed-in value to the method.
        DEPRECATED_QUERY_ARGUMENTS = {
          search: proc { |arg, value| {query: value} },
          query: proc { |arg, value| {query: value} },
          kind: proc { |arg, value| {query: "#{arg}: #{value}"} },
          name: proc { |arg, value| {query: "#{arg}: #{value}"} },
          filter_id: proc { |arg, value| {filter_id: value} },
          filter_selection: proc { |arg, value| value }, # need to merge this good data into the others
        }

        # A list of services.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param after [String] Returns the elements in the list that come after the specified cursor.
        # @param before [String] Returns the elements in the list that come before the specified cursor.
        # @param filter_id [String] [deprecated] A ServiceFilter ID to filter services with. Overrides `query` argument.
        # @param filter_selection [ServiceFilterSelectionInput] A selection for filtering services.
        # @param first [Integer] Returns the first _n_ elements from the list.
        # @param has_maintainer [Boolean] [deprecated] Use `query` argument instead. For example: `maintainer.active:true` or `maintainer.active:false`
        # @param has_slos [Boolean] [deprecated] This filter is deprecated. Reach out to #service-catalog if this impacts your workflow.
        # @param kind [String] [deprecated] Use `query` argument instead. For example: `kind:logical`
        # @param last [Integer] Returns the last _n_ elements from the list.
        # @param name [String] [deprecated] Use `query` argument instead. For example: `name:test-service`
        # @param name_with_owner [String] [deprecated] This filter is deprecated. Reach out to #service-catalog if this impacts your workflow.
        # @param offset [Integer] The number of records to skip when returning results. Useful for pagination.
        # @param query [String] [deprecated] A search query to filter services. For example: `kind: logical`
        # @param search [String] [deprecated] Use `query` argument instead.
        # @param service_detail_fragment [String] GraphQL detail fragment for the model, defining 'ServiceDetail'
        #
        # @return [Hash]
        def self.execute(client:, context: {}, service_detail_fragment: ServicesQueryBinder::SERVICE_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(
            convert_kwargs_to_service_filter_query(kwargs)
          )
          variables["after"] ||= nil
          query = build_query(variables, service_detail_fragment: service_detail_fragment)

          data = {"data" => {"services" => []}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            loop do
              response = client.query_with_retries(query: query, variables: variables, context: context)
              if response["errors"]
                data["errors"].concat(response["errors"])
                break
              end
              response["data"]["services"]["edges"].each do |edge|
                data["data"]["services"] << edge["node"]
              end
              break if data["data"]["services"].size >= response["data"]["services"]["totalCount"]
              variables["after"] = response["data"]["services"]["edges"].last["cursor"]
            end
          end

          data
        end

        # Convert deprecated arguments to a search query.
        #
        # @param kwargs [Hash] Hash of all kwargs given to the #execute method.
        #
        # @return [Hash]
        def self.convert_kwargs_to_service_filter_query(kwargs)
          kwargs.each_with_object({}) do |(arg, value), converted_args|
            next converted_args[arg] = value unless DEPRECATED_QUERY_ARGUMENTS[arg]

            converted_args[:filter_selection] ||= {}
            filter_selection_args = DEPRECATED_QUERY_ARGUMENTS[arg].call(arg, value)

            if filter_selection_args[:query]
              converted_args[:filter_selection][:query] ||= String.new
              converted_args[:filter_selection][:query] << " " << filter_selection_args[:query]
              converted_args[:filter_selection][:query].strip!
            end

            if filter_selection_args[:filter_id]
              converted_args[:filter_selection][:filter_id] = filter_selection_args[:filter_id]
            end
          end
        end

        # Build query for this query.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, service_detail_fragment: ServicesQueryBinder::SERVICE_DETAIL_FRAGMENT, **kwargs)
          <<~GRAPHQL
            query listServices#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              services#{GraphqlQuerySemantics.graphql_variable_passing(variables, include_parens: true)} {
                totalCount
                edges {
                  cursor
                  node {
                    ...ServiceDetail
                  }
                }
              }
            }
            #{service_detail_fragment}
          GRAPHQL
        end
      end
    end

    class ServicesQueryBinder < QueryBinder
      # A list of services.
      #
      # @param after [String] Returns the elements in the list that come after the specified cursor.
      # @param before [String] Returns the elements in the list that come before the specified cursor.
      # @param filter_id [String] [deprecated] A ServiceFilter ID to filter services with. Overrides `query` argument.
      # @param filter_selection [ServiceFilterSelectionInput] A selection for filtering services.
      # @param first [Integer] Returns the first _n_ elements from the list.
      # @param has_maintainer [Boolean] [deprecated] Use `query` argument instead. For example: `maintainer.active:true` or `maintainer.active:false`
      # @param has_slos [Boolean] [deprecated] This filter is deprecated. Reach out to #service-catalog if this impacts your workflow.
      # @param kind [String] [deprecated] Use `query` argument instead. For example: `kind:logical`
      # @param last [Integer] Returns the last _n_ elements from the list.
      # @param name [String] [deprecated] Use `query` argument instead. For example: `name:test-service`
      # @param name_with_owner [String] [deprecated] This filter is deprecated. Reach out to #service-catalog if this impacts your workflow.
      # @param offset [Integer] The number of records to skip when returning results. Useful for pagination.
      # @param query [String] [deprecated] A search query to filter services. For example: `kind: logical`
      # @param search [String] [deprecated] Use `query` argument instead.
      # @param service_detail_fragment [String] GraphQL detail fragment for the model, defining 'ServiceDetail'
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def list(**kwargs)
        Response.new Client::Services::ListServicesQuery.execute(client: client, **kwargs)
      end
    end
  end
end
