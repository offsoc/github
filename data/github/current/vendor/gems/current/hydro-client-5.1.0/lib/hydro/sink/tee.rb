module Hydro
  module Sink
    class Tee
      attr_reader :primary, :secondary

      # Composes a primary sink and a secondary sink. Sink#write and batching
      # methods are forwarded to both sinks. Any other methods are
      # forwarded to the primary.
      #
      # primary  - a Hydro::Sink instance
      # seconary - a Hydro::Sink instance
      def initialize(primary, secondary)
        @primary = primary
        @secondary = secondary
      end

      def batchable?
        primary.batchable?
      end

      def flushable?
        primary.flushable?
      end

      def start_batch
        primary.start_batch
        secondary.start_batch if secondary.batchable?
      end

      def flush_batch
        primary.flush_batch
        secondary.flush_batch if secondary.batchable?
      end

      def write(*args)
        primary.write(*args)
        secondary.write(*args)
      end

      private

      def method_missing(method, *args, &block)
        primary.public_send(method, *args, &block)
      end
    end
  end
end
