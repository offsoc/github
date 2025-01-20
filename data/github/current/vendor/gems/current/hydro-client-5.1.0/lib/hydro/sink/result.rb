module Hydro
  module Sink
    # A response from a Sink `write` call.
    #
    # Wraps any errors so consuming code can respond or ignore the results of a
    # write as required.
    class Result
      # Internal: convenience constructor
      def self.success
        new
      end

      # Internal: convenience constructor
      def self.failure(error)
        new(error)
      end

      # Public: initialize a Response
      def initialize(error = nil)
        @error = error
      end

      # Was the publish successful?
      def success?
        @error.nil?
      end

      # The error, if one occurred.
      def error
        @error
      end
    end
  end
end
