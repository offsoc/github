# typed: true
# frozen_string_literal: true

require "active_support/notifications"
require "flipper"
require "flipper/instrumentation/subscriber"

class FlipperSubscriber
  extend T::Sig

  def self.collector
    GitHub::DataCollector::Collector.get_instance(:flipper_subscriber)
  end

  sig { returns(T::Hash[Symbol, T::Boolean]) }
  def self.tested_features
    collector[:tested_features] ||= Hash.new
  end

  def self.enabled_tested_features
    tested_features.select { |_, v| v }.keys
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

  def self.track_preload(names, duration)
    self.preloaded_features.merge(names)
    self.collector[:preload_duration] ||= 0
    self.collector[:preload_duration] += duration
  end

  def self.call(name, start, ending, transaction_id, payload)
    feature_name = payload[:feature_name].to_sym
    operation = payload[:operation]

    # DD doesn't like tags with "?" and common operations are `enabled?` and
    # `disabled?`, so we'll strip the "?"
    formatted_operation = operation.to_s.tr "?", ""

    tags = [
      "operation:#{formatted_operation}",
      "feature:#{feature_name}",
    ]
    precise_operation_duration = precise_duration(start, ending)

    case operation
    when :enabled?
      if self.collector_enabled?
        tested_features[feature_name] ||= payload[:result]
        tested_feature_timings[feature_name].push(precise_operation_duration)
      end

      # track whether feature was enabled or not so we can show graphs accordingly
      tags << (payload[:result] ? "result:true" : "result:false")
    when :enable, :disable
      record_modification(payload, start: start)
      # track which gate was enabled or disabled so we can see which get used
      tags << "gate:#{payload[:gate_name]}"
    end

    GitHub.dogstats.distribution("flipper.dist.time", precise_operation_duration, tags: tags)
  end

  def self.total_enabled_calls
    tested_feature_timings.values.flatten.size
  end

  def self.total_enabled_duration
    tested_feature_timings.values.flatten.sum
  end

  def self.total_enabled_duration_ms
    (tested_feature_timings.values.flatten.sum * 1000).round
  end

  def self.record_modification(payload, start:)
    operation = payload[:operation]
    return unless operation == :enable || operation == :disable
    payload = payload.dup

    # Do not instrument if the operation was never performed
    # This can happen when certain exceptions are raised
    # As of now only Flipper::Adapters::Mysql::ConcurrencyError is showing up in sentry as this exception is raised
    # in the mysql adapter if the rollout_update_at etag is stale
    return if payload[:exception_object]&.instance_of?(Flipper::Adapters::Mysql::ConcurrencyError)

    flipper_type = payload.delete(:thing) # this is the flipper type being enabled or disabled
    return unless flipper_type

    # this is the thing the flipper type is wrapping (ie: user, repo, number, etc.)
    subject =
      case flipper_type
      when Flipper::Types::Actor
        # the audit log wants the thing (repo or user), not the flipper type actor
        flipper_type.thing
      else
        flipper_type
      end

    # make it something serializable for the audit log
    subject_serialized =
      if subject.is_a?(User)
        subject.display_login
      elsif subject.is_a?(Repository)
        subject.name_with_display_owner
      else
        subject.to_s
      end
    payload[:subject] = subject_serialized
    payload[:subject_class] = subject.class.name
    payload[:subject_id] = subject.id if subject.respond_to?(:id)

    GitHub.instrument "feature.#{operation}", payload

    actor = GitHub.context[:actor]
    feature = payload[:feature_name]

    desc = FlipperFeature.get_subject_label(gate_name: payload[:gate_name], subject: subject.to_s, skip_actor_gates: true)
    if desc
      begin
        if ENV["CHATTERBOX_TOKEN"]
          message = "#{actor} #{operation}d the #{feature} feature for #{desc}"
          GitHub::Chatterbox.client.say("github-features", message)

          service = FlipperFeature.find_by(name: feature)&.service_name&.gsub(/[^A-Za-z0-9]+/, "-")
          GitHub::Chatterbox.client.say("github-features-#{service}", message) if service.present?
        else
          warn "Chatterbox token not set, skipping chat message." unless Rails.env.test? || Rails.env.development?
        end
      rescue => boom # rubocop:todo Lint/GenericRescue
        # Only use T.unsafe if responds_to? is used first
        context = { chatterbox_response: T.unsafe(boom).response } if boom.respond_to?(:response)
        Failbot.report!(boom, context)
      end
    end

    unless payload[:gate_name] == :actor
      publish_event_to_delorean(
        operation: operation,
        actor: actor,
        feature: feature,
        subject_label: desc,
        start: start
      )
    end
  end

  def self.hydro_stats
    features = tested_features.to_a.map do |(name, enabled)|
      {
        name: name.to_s,
        enabled: enabled,
        preloaded: self.preloaded_features.include?(name),
        durations_ms: tested_feature_timings[name].map { |d| (d * 1_000).round },
      }
    end
    {
      flipper_features: features,
      flipper_checks_count: self.total_enabled_calls,
      flipper_ms: self.total_enabled_duration_ms,
    }
  end

  def self.publish_event_to_delorean(operation:, actor:, feature:, subject_label:, start:)
    return unless GitHub.publish_events_to_delorean?
    return if GitHub.flipper[:disable_delorean_publishing].enabled?

    GitHub.delorean_client.publish_event(
      timeline_id: 1, # TODO: replace with the correct timeline id
      type: "feature_flag",
      operation: "#{operation}d",
      title: "Feature flag '#{feature}' #{operation}d for #{subject_label}",
      description: "#{actor} #{operation}d the '#{feature}' feature for #{subject_label}",
      occurred_at: start,
      actions: {
        "Devtools": "https://admin.github.com/devtools/feature_flags/#{feature}",
      },
      group_key: "feature_flag_#{feature}",
    )
  rescue => e # rubocop:todo Lint/GenericRescue
    # If Delorean is down or our client code has an issue, we don't want to affect feature flag operations
    Failbot.report(e)
    GitHub.dogstats.increment("flipper.publish_delorean_event.failure")
  end

  private_class_method def self.precise_duration(start, ending = nil)
    ending ||= case start
    when Float
      Process.clock_gettime(Process::CLOCK_MONOTONIC)
    else
      Time.now
    end

    ending - start
  end
end

ActiveSupport::Notifications.monotonic_subscribe "feature_operation.flipper", FlipperSubscriber

ActiveSupport::Notifications.monotonic_subscribe "adapter_operation.flipper" do |_name, _payload_id, _started_at, _ended_at, payload|
  next unless payload[:gate_name] == :actor

  if payload[:operation] == :enable
    GitHub.dogstats.increment("flipper.gate_count", tags: ["feature:#{payload[:feature_name]}"])
  elsif payload[:operation] == :disable
    GitHub.dogstats.decrement("flipper.gate_count", tags: ["feature:#{payload[:feature_name]}"])
  end
end
