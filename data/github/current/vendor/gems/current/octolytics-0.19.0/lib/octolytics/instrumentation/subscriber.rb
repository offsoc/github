require "octolytics/instrumentation"

module Octolytics
  module Instrumentation
    class Subscriber
      OperationSeparator = '.'

      # Public: Use this as the subscribed block.
      def self.call(name, start, ending, transaction_id, payload)
        new(name, start, ending, transaction_id, payload).update
      end

      # Private: Initializes a new event processing instance.
      def initialize(name, start, ending, transaction_id, payload)
        @name = name
        @start = start
        @ending = ending
        @payload = payload
        @duration = ending - start
        @transaction_id = transaction_id
      end

      def update
        client = @name.split(OperationSeparator).first
        method = @payload.fetch(:method)
        update_timer "#{Instrumentation::Namespace}.#{client}.#{method}"
      end

      # Internal: Override in subclass.
      def update_timer(metric)
        raise 'not implemented'
      end

      def update_counter(metric)
        raise 'not implemented'
      end
    end
  end
end
