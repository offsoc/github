# frozen_string_literal: true

module RailsApplicationInstrumentation
  class InitializerSubscriber
    attr_reader :times
    def initialize
      @times = []
    end

    def call(*args)
      event = ActiveSupport::Notifications::Event.new(*args)
      @times << [event.duration, event.payload[:initializer].to_s]
    end

    def total_time
      @times.sum(&:first)
    end
  end

  def self.included(base)
    config = base.config
    config.debug_boot = ENV["DEBUG_BOOT"]

    if config.debug_boot
      subs = InitializerSubscriber.new
      ActiveSupport::Notifications.subscribe("load_config_initializer.railties", subs)

      config.after_initialize do
        puts "[DEBUG_BOOT] Slower initializers:"
        subs.times.sort_by { |i| -i.first }.take(3).each do |a|
          puts "[DEBUG_BOOT] #{a.last} loaded in #{a.first}ms"
        end
        puts "[DEBUG_BOOT] Time of initializers: #{subs.total_time}ms"
      end

      base.prepend PrependMethods
    end
  end

  def initialize!
    start = Time.now

    super

    after_time = (Time.now - start) * 1_000
    puts "[DEBUG_BOOT] Rails booted in #{after_time}ms" if config.debug_boot
  end

  module PrependMethods
    def eager_load!
      puts "[DEBUG_BOOT] Eager loading all classes."
      super
    end
  end
end
