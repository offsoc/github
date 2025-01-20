require "active_support/callbacks"

module Hydro
  class Processor
    include ActiveSupport::Callbacks

    attr_accessor :consumer
    define_callbacks :open, :close

    def self.options
      @options ||= {}
    end

    def self.subscribe_to(topic)
      options[:subscribe_to] = topic
    end

    def self.group_id(group_id)
      options[:group_id] = group_id
    end

    # Public: Controls whether the processor should receive message batches or individual messages.
    # Defaults to the individual message mode (recommended).
    #
    # Returns a Boolean.
    def batching?
      false
    end

    # Public: Process messages.
    #
    # batch_or_message - In batch mode, an Array of Hydro::Consumer::ConsumerMessage.
    #                    In individual message mode, a single Hydro::Consumer::ConsumerMessage.
    def process(batch_or_message)
      raise NotImplementedError
    end

    # Public: Process a batch of messages and interact with the consumer.
    #
    # batch_or_message - In batch mode, an Array of Hydro::Consumer::ConsumerMessage.
    #                    In individual message mode, a single Hydro::Consumer::ConsumerMessage.
    # consumer - the Hydro::Consumer.
    def process_with_consumer(batch_or_message, consumer)
      process(batch_or_message)
    end

    def subscribe_to
      options[:subscribe_to]
    end

    def group_id
      options[:group_id]
    end

    def options
      @options ||= self.class.options.dup
    end
  end
end
