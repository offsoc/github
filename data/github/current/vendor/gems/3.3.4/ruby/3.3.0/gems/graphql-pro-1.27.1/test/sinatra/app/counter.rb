# frozen_string_literal: true

module App
  # An incrementing counter, identified by ID
  class Counter
    include GlobalID::Identification
    attr_accessor :id, :value
    def initialize(id, value)
      @id = id
      @value = value
    end

    # @param to [Integer] override to set the counter to a certain value
    def increment(to: nil)
      to ||= self.value + 1
      self.value = to
      App::Schema.subscriptions.trigger("counterIncremented", {id: @id}, self)
      nil
    end

    # Get or create a counter by id
    def self.find(id)
      @counters ||= Hash.new { |h, counter_id| h[counter_id] = Counter.new(counter_id, 0) }
      @counters[id]
    end
  end
end
