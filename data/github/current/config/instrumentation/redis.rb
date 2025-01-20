# typed: true
# frozen_string_literal: true

class Redis::Client
  def self.collector
    GitHub::DataCollector::RedisInstrumenterCollector.get_instance
  end

  def self.query_time
    collector.query_time
  end

  def self.query_time=(value)
    collector.query_time = value
  end

  def self.query_count
    collector.query_count
  end

  def self.query_count=(value)
    collector.query_count = value
  end

  def self.queries
    collector.queries
  end

  def self.queries=(value)
    collector.queries = value
  end

  def self.track
    collector.track
  end

  def self.track=(value)
    collector.track = value
  end

  module RedisClientInstrumentation
    include Kernel
    extend T::Helpers
    # Private: Value between 0 and 1 that is the sample rate for the metrics
    # produced by this class.
    STATS_SAMPLE_RATE = 0.5

    DOT = ".".freeze
    DASH = "-".freeze

    def call(cmd, *args, &block)
      start = Time.now
      super
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      if command_name = build_command_name(cmd)
        GitHub.dogstats.increment("rpc.redis.error".freeze, tags: dogstats_tags(command_name) + ["error:#{e.class.name}"])
      end

      raise
    ensure
      duration = Time.now - T.cast(start, Time)
      duration_ms = duration * 1_000

      if command_name = build_command_name(cmd)
        GitHub.dogstats.distribution("rpc.redis.dist.time".freeze, duration_ms, tags: dogstats_tags(command_name))
      end
      if self.class.track
        self.class.queries << EventTrace.new(cmd, duration, args)
      end
      Redis::Client.query_time += duration
      Redis::Client.query_count += 1
    end

    def call_pipelined(cmd, *args, &block)
      start = Time.now
      super
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      GitHub.dogstats.increment("rpc.redis.error".freeze, tags: dogstats_tags("pipelined") + ["error:#{e.class.name}"])

      raise
    ensure
      duration = Time.now - T.cast(start, Time)
      duration_ms = duration * 1_000

      GitHub.dogstats.distribution("rpc.redis.dist.time".freeze, duration_ms, tags: dogstats_tags("pipelined"))

      cmd.each do |command|
        command_name = build_command_name(command)

        GitHub.dogstats.increment("rpc.redis.pipelined".freeze,
          sample_rate: STATS_SAMPLE_RATE,
          tags: dogstats_tags(command_name))
      end

      if self.class.track
        self.class.queries << EventTrace.new("(pipelined)", duration, cmd)
      end
      Redis::Client.query_time += duration
      Redis::Client.query_count += 1
    end

    def build_command_name(cmd)
      command_parts = Array(cmd)
      name = command_parts.first
      if name == :evalsha
        # return evalsha:script_sha
        return "#{name}:#{command_parts.second}"
      end
      name
    end

    def dogstats_tags(operation)
      T.bind(self, Redis::Client)
      tags = [
        "rpc_operation:#{operation}",
        "rpc_host:#{host}",
        "rpc_site:#{GitHub.site_from_host(host)}",
        "#{GitHub::TaggingHelper::CATALOG_SERVICE_TAG}:#{GitHub.context[:catalog_service] || "unknown"}",
        "source:#{GitHub.context[:from].presence || GitHub.context[:job].presence || "unknown"}"
      ]
    end
  end

  prepend RedisClientInstrumentation
end
