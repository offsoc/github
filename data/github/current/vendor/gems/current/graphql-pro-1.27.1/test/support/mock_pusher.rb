# frozen_string_literal: true
class MockPusher
  class Channel
    attr_accessor :occupied
    attr_reader :updates
    attr_reader :id

    def initialize(id)
      @id = id
      @occupied = false
      @updates = []
    end

    def trigger(event_name, payload)
      if event_name != "update"
        raise "Invariant: GraphQL is only expected to call update, but received #{event_name.inspect}. Fix tests or implementation."
      end
      @updates << payload
    end
  end

  def initialize
    @channels = Hash.new { |h, k| h[k] = Channel.new(k) }
    @key = "abcdef"
    @secret = "12345"
    @batch_sizes = []
  end

  attr_reader :key, :secret, :batch_sizes

  # Mock pusher:
  def channel_info(channel_name)
    channel = @channels[channel_name]
    { occupied: channel.occupied }
  end

  def trigger(channel_name, action, payload)
    @channels[channel_name].trigger(action, payload)
  end

  def trigger_batch(triggers)
    @batch_sizes << triggers.size
    triggers.each do |trigger|
      @channels[trigger[:channel]].trigger(trigger[:name], trigger[:data])
    end
  end

  # Testing:
  def channel(channel_name)
    @channels[channel_name]
  end
end
