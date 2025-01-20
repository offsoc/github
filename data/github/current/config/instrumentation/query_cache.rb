# frozen_string_literal: true

class QueryCacheLogSubscriber < ActiveSupport::LogSubscriber
  class << self
    delegate :track, :track=, :cache_hit_count, :cache_hit_count=, :cache_hits, :cache_hits=, :skip, :skip=, to: :collector
  end

  def self.collector
    GitHub::DataCollector::QueryCacheCollector.get_instance
  end

  def self.skip!(skip, old_skip)
    # nil means it wasn't previously set
    return self.skip = skip if old_skip.nil?

    # We need to intersect the skip option to ensure we don't miss
    # any required attributes from a higher `with_track` call.
    self.skip = skip.intersection(old_skip)
  end

  def self.with_track(skip: [])
    original_enable = self.collector.enabled?
    original_track = self.track
    original_skip = self.skip

    self.collector.enable
    self.track = true
    self.skip!(skip, original_skip)

    yield
  ensure
    self.skip = original_skip
    self.track = original_track
    self.collector.enabled = original_enable
  end

  def sql(event)
    return unless event.payload[:cached]
    self.class.cache_hit_count += 1

    return unless self.class.track
    self.class.cache_hits << query_for_event(event)
  end

  attach_to :active_record

  private

  def query_for_event(event)
    sql = event.payload[:sql]
    result_count = event.payload[:result_count]
    connection = event.payload.fetch(:connection)

    GitHub::MysqlInstrumenter::Query.new(
      sql: sql,
      result_count: result_count,
      duration: nil,
      connection_url: connection.connection_url,
      on_primary: false,
      connection_class: connection.connection_class,
      skip: self.class.skip
    )
  end
end
