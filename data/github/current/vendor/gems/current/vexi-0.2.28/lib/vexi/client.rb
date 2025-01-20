# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"
require "vexi/abstract_entity_service"
require "vexi/actor"
require "vexi/adapter"
require "vexi/cache"
require "vexi/cache_config"
require "vexi/custom_gates_evaluator"
require "vexi/errors"
require "vexi/models/feature_flag"
require "vexi/models/get_entity_response"
require "vexi/models/get_feature_flag_response"
require "vexi/models/get_segment_response"
require "vexi/models/segment"
require "vexi/non_actor_gate_evaluator"
require "vexi/notifications"
require "vexi/services/feature_flag_service"
require "vexi/services/segment_service"

module Vexi
    # Public: The main Vexi class for performing feature flag enabled checks.
  class Client
    extend T::Sig

    sig do
      params(
        config: Configuration,
        feature_flag_service: Services::FeatureFlagService,
        segment_service: Services::SegmentService,
      ).void
    end
    def initialize(config, feature_flag_service, segment_service)
      @memoizing = T.let(false, T::Boolean)

      @config = config
      @feature_flag_service = feature_flag_service
      @segment_service = segment_service
      @cache_config = T.let(config.cache_config, T.nilable(CacheConfig))
      @fallback_evaluator = T.let(config.fallback_evaluator, Configuration::FallbackEvaluator)
      @custom_gate_evaluator = T.let(config.custom_gates_evaluator, T.nilable(CustomGatesEvaluator))

      Notifications.configuration_context = configuration_context
    end

    sig { params(name: T.any(String, Symbol), actors: T.any(Actor, String)).returns(T::Boolean) }
    def enabled?(name, *actors)
      Notifications.instrument_timing("is_enabled", { feature_flag: name, memoizing: memoizing? }) do |context|
        context.capture_boolean(:result) { enabled_internal?(name, actors) }
      end
    end

    sig { params(value: T::Boolean).void }
    def memoize=(value)
      @feature_flag_service.memoize = value
      @segment_service.memoize = value
      @memoizing = value
    end

    sig { returns(T::Boolean) }
    def memoizing?
      !!@memoizing
    end

    # Preload the named feature flags and any related segments into the cache and/or memoization layer.
    # fetch_directly_from_adapter (default: true)
    #   If true, fetch the data directly from the adapter and replace any existing values in the cache.
    #   Use false to only fetch from the adapter on cache miss, but not to replace existing values in the cache. This can be used for preloading from the cache into the memoization layer.
    # cache_without_expiry (default: false)
    #   If true, preloaded records will be stored in cache without expiry.
    #      Use this along with a cache that has a TTL to ensure that preloaded records never expire (this assumes you have a separate process for updating the cache or calling preload).
    #      This enables any non-preloaded feature flags checked via enabled? calls to use the configured TTL for expiry.
    #   If false, preloaded records will be stored in the cache with the TTL configured along with the cache.
    sig { params(names: T::Array[T.any(String, Symbol)], fetch_directly_from_adapter: T::Boolean, cache_without_expiry: T::Boolean).void }
    def preload(names, fetch_directly_from_adapter: true, cache_without_expiry: false)
      Notifications.instrument_timing("preload", { feature_flags: names, fetch_directly_from_adapter: fetch_directly_from_adapter, memoizing: memoizing? }) do |context|
        context.capture_boolean(:result) { preload_internal(names, fetch_directly_from_adapter, cache_without_expiry) }
      end
    end

    sig { returns(T::Hash[Symbol, String]) }
    def configuration_context
      @config.context
    end

    private

    sig { params(name: T.any(String, Symbol), actors: T::Array[T.any(Actor, String)]).returns(T::Boolean) }
    def enabled_internal?(name, actors)
      name = name.to_s
      exception_occurred = false
      feature_flag = T.let(FeatureFlag.new, FeatureFlag)
      begin
        feature_flags = @feature_flag_service.get(
          fetch_directly_from_adapter: false,
          cache_without_expiry: false,
          names: [name]
        )

        return false if feature_flags.empty?

        feature_flag = T.must(feature_flags.first)
      rescue StandardError => e
        Notifications.instrument_exception(
          "is_enabled", "error getting feature flag", e,
          { feature_flag: name, stage: "feature_flag" }
        )
        return @fallback_evaluator.call(name, actors)
      end

      return true if NonActorGateEvaluator.evaluate_boolean_gate(feature_flag)
      return true if NonActorGateEvaluator.evaluate_percentage_of_calls(feature_flag)

      actor_ids = actors.map do |actor|
        if actor.is_a?(Actor)
          actor.vexi_id
        else
          actor
        end
      end

      return true if NonActorGateEvaluator.evaluate_percentage_of_actors(feature_flag, actor_ids)
      return true if NonActorGateEvaluator.evaluate_embedded_actors(feature_flag.actors, actor_ids)

      segments = T.let([], T::Array[Segment])
      begin
        segments = @segment_service.get(
          fetch_directly_from_adapter: false,
          cache_without_expiry: false,
          names: feature_flag.segments
        )
      rescue StandardError => e
        Notifications.instrument_exception(
          "is_enabled", "error getting segments", e,
          { feature_flag: name, segments: feature_flag.segments, stage: "segments" }
        )
        exception_occurred = true
      end

      return true if segments.any? do |segment|
        return true if NonActorGateEvaluator.evaluate_embedded_actors(segment.actors, actor_ids)
      end

      begin
        # If the custom gates evaluator is not set, we will silently ignore the custom gates even if they are present.
        if feature_flag.custom_gates.any? && !@custom_gate_evaluator.nil? &&
          @custom_gate_evaluator&.enabled?(feature_flag.name, feature_flag.custom_gates, actors)
          return true
        end
      rescue StandardError => e
        Notifications.instrument_exception(
          "is_enabled", "error getting custom gates", e,
          { feature_flag: name, stage: "custom_gates" }
        )
        exception_occurred = true
      end

      return @fallback_evaluator.call(name, actors) if exception_occurred

      false
    end

    sig { params(names: T::Array[T.any(String, Symbol)], fetch_directly_from_adapter: T::Boolean, cache_without_expiry: T::Boolean).returns(T::Boolean) }
    def preload_internal(names, fetch_directly_from_adapter, cache_without_expiry)
      raise Errors::ValidationError, "Preloading requires at least one named feature flag to load" if names.empty?
      raise Errors::ValidationError, "Preloading is not supported without a cache configured or memoizing enabled" if @cache_config.nil? && !memoizing?

      feature_flags = @feature_flag_service.get(
        fetch_directly_from_adapter: fetch_directly_from_adapter,
        cache_without_expiry: cache_without_expiry,
        names: names.map(&:to_s)
      )

      segment_names = T.let([], T::Array[String])
      feature_flags.each do |feature_flag|
        segment_names.concat(feature_flag.segments)
      end
      segment_names.uniq!

      @segment_service.get(
        fetch_directly_from_adapter: fetch_directly_from_adapter,
        cache_without_expiry: false,
        names: segment_names
      ) unless segment_names.empty?

      true
    end
  end
end
