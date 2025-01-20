# frozen_string_literal: true

module ServiceCatalog
  class Client
    module TaskLocks
      # Acquire a task lock to prevent concurrent operations between discrete processes.
      module AcquireTaskLockMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        # @return [String]
        INSTRUMENTATION_KEY = "service_catalog_client.task_locks.acquire"

        # Acquire a task lock.
        #
        # @param name [String] The lock name
        # @param ttl [Integer] How long the lock should be live for
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"data" => {"taskLock" => nil}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            resp = client.query_with_retries(query: query, variables: variables)
            data["errors"].concat(resp["errors"]) if resp["errors"]
            data["data"]["taskLock"] = resp.dig("data", "acquireTaskLock", "taskLock")
          end

          data
        end

        # Build query for acquiring a task lock.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables)
          <<~GRAPHQL
            mutation acquireTaskLock(#{GraphqlQuerySemantics.graphql_variable_declaration(variables, strict: true)}) {
              acquireTaskLock(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                taskLock {
                  id
                  name
                  expiresAt
                }
              }
            }
          GRAPHQL
        end
      end
    end
  end
end
