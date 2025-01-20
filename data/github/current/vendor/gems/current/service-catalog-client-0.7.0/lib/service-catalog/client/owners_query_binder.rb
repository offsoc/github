# frozen_string_literal: true

require File.expand_path("query_binder.rb", __dir__)
Dir[File.expand_path("owners/*.rb", __dir__)].each { |f| require f }

module ServiceCatalog
  class Client
    # OwnersQueryBinder contains methods for accessing Owners.
    class OwnersQueryBinder < QueryBinder
      DETAIL_FRAGMENT = <<-GRAPHQL
        fragment OwnerDetail on Owner {
          id
          name
          active
        }
      GRAPHQL
    end
  end
end
