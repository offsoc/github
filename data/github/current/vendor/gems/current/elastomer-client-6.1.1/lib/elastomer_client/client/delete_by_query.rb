# frozen_string_literal: true

module ElastomerClient
  class Client
    # Execute delete_by_query using the native _delete_by_query API if supported
    # or the application-level implementation.
    #
    # Warning: These implementations have different parameters and return types.
    # If you want to use one or the other consistently, use ElastomerClient::Client#native_delete_by_query
    # or ElastomerClient::Client#app_delete_by_query directly.
    def delete_by_query(query, params = {})
      send(:native_delete_by_query, query, params)
    end
  end
end
