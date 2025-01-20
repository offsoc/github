# frozen_string_literal: true

require File.expand_path("query_binder.rb", __dir__)
Dir[File.expand_path("users/*.rb", __dir__)].each { |f| require f }

module ServiceCatalog
  class Client
    # UsersQueryBinder contains methods for accessing user-related resources.
    class UsersQueryBinder < QueryBinder
      # Default service filter detail fragment.
      # @return [String]
      SERVICE_FILTER_DETAIL_FRAGMENT = <<-'GRAPHQL'
        fragment ServiceFilterDetail on ServiceFilter {
          id
          name
          public
          query
          viewerHasPinned
        }
      GRAPHQL
    end
  end
end
