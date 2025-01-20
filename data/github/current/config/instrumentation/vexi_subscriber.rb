# typed: true
# frozen_string_literal: true

require "active_support/notifications"

class VexiSubscriber
  extend T::Sig

  def self.collector
    GitHub::DataCollector::Collector.get_instance(:vexi_subscriber)
  end

  sig { returns(T::Hash[Symbol, T::Boolean]) }
  def self.tested_features
    collector[:tested_features] ||= Hash.new
  end

  def self.enabled_tested_features
    tested_features.keys.select { |k| tested_features[k] }
  end

  def self.tested_feature_timings
    collector[:tested_feature_timings] ||= Hash.new { |h, feature| h[feature] = [] }
  end

  def self.total_preload_duration
    collector[:preload_duration] || 0
  end

  def self.preloaded_features
    collector[:preloaded_features] ||= Set.new
  end

  def self.collector_enabled?
    collector.enabled?
  end

  def self.total_enabled_calls
    tested_feature_timings.values.flatten.size
  end

  def self.total_enabled_duration
    tested_feature_timings.values.flatten.sum
  end

  def self.total_enabled_duration_ms
    (total_enabled_duration * 1000).round
  end

  def self.record_duration_event(event)
    payload = Vexi::Observability::DurationPayload.new(event)

    feature_name = payload.feature_flag.to_sym
    operation = payload.operation
    measured_duration = payload.measured_finish - payload.measured_start

    case operation
    when "is_enabled"
      track_is_enabled(payload.feature_flag, payload.result, measured_duration)
    when "preload"
      track_preload(payload.context_tags[:feature_flags], measured_duration)
    end
  end

  private_class_method def self.track_is_enabled(feature_name, result, duration)
    return unless self.collector.enabled?

    tested_features[feature_name] ||= result
    tested_feature_timings[feature_name].push(duration)
  end

  private_class_method def self.track_preload(names, duration)
    return unless self.collector.enabled?

    self.preloaded_features.merge(names)
    self.collector[:preload_duration] ||= 0
    self.collector[:preload_duration] += duration
  end
end

ActiveSupport::Notifications.subscribe(/\Avexi\..+\.duration\Z/) do |event|
  VexiSubscriber.record_duration_event(event)
end
