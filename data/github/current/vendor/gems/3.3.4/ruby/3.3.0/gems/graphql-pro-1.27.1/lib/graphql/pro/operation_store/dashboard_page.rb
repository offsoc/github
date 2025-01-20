# frozen_string_literal: true

module GraphQL
  module Pro
    class OperationStore
      # Used for rendering pages on the dashboard,
      # it's a backend-agnostic wrapper around a slice of records.
      class DashboardPage
        def initialize(items:, prev_page:, next_page:, total_count:)
          @items = items
          @prev_page = prev_page
          @next_page = next_page
          @total_count = total_count
        end

        attr_reader :items, :total_count

        def next_page
          @next_page
        end

        def prev_page
          @prev_page
        end
      end
    end
  end
end
