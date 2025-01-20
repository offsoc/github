module Resilient
  module Instrumenters
    # Instrumentor that is useful for tests as it stores each of the events that
    # are instrumented.
    class Memory
      Event = Struct.new(:name, :payload, :result)

      attr_reader :events

      def initialize
        reset
      end

      def instrument(name, payload = {})
        # Copy the payload to guard against later modifications to it, and to
        # ensure that all instrumentation code uses the payload passed to the
        # block rather than the one passed to #instrument.
        payload = payload.dup

        result = if block_given?
          yield payload
        else
          nil
        end
        @events << Event.new(name, payload, result)
        result
      end

      def reset
        @events = []
      end
    end
  end
end
