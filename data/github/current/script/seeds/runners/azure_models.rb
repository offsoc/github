# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class AzureModels < Seeds::Runner
      def self.help
        <<~HELP
        Fetches the marketplace models from Azure.
        HELP
      end

      def self.run(options = {})
        puts "Running the Azure catalog sync job..."
        ::AzureModels::FetchCatalogItemsJob.perform_now
        puts "Created #{::AzureModels::CatalogItem.count} catalog items!"
      end
    end
  end
end
