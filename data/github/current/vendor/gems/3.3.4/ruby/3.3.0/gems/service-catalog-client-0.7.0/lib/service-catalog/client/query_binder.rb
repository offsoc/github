# frozen_string_literal: true

module ServiceCatalog
  class Client
    # QueryBinder is an abstract base class for making query binders.
    class QueryBinder
      # The client to use when executing queries.
      # @return [Client]
      attr_reader :client

      # Create a new QueryBinder (call the QueryBinder subclass's .new method directly).
      #
      # @param client [Client] Your Client instance
      #
      # @return [QueryBinder]
      def initialize(client:)
        @client = client
      end
    end
  end
end
