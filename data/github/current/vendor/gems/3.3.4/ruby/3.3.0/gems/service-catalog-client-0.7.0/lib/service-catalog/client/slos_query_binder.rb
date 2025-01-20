# frozen_string_literal: true

require File.expand_path("query_binder.rb", __dir__)
Dir[File.expand_path("slos/*.rb", __dir__)].each { |f| require f }

module ServiceCatalog
  class Client
    # SlosQueryBinder contains methods for accessing slos.
    class SlosQueryBinder < QueryBinder
      SLO_DETAIL_FRAGMENT = <<-GRAPHQL
        fragment SloDetail on Slo {
          id
          name
          percentMet
          percentTarget
          service {
            name
          }
          provider
          providerUrl
        }
      GRAPHQL

      SLO_SUMMARY_DETAIL_FRAGMENT = <<~'GRAPHQL'
        fragment SloSummaryDetail on SloSummary {
          id
          slo {
            name
            service {
              name
            }
          }
          startTime
          endTime
          percentMet24h
          percentMet28d
          percentMet13w
        }
      GRAPHQL

      # Each module in the Slos namespace adds its own method to the SlosQueryBinder.
    end
  end
end
