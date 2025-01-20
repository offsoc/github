# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

require "vexi/actor"
require "vexi/client"
require "vexi/version"

module Vexi
  class Configuration
    extend T::Sig

    FallbackEvaluator = T.type_alias { T.proc.params(feature_flag_name: String, actors: T::Array[T.any(Actor, String)]).returns(T::Boolean) }
    DEFAULT_FALLBACK_EVALUATOR =  T.let(-> (_feature_flag_name, _actors) { false }, FallbackEvaluator)

    class ConfigurationError < StandardError; end

    sig { returns(T.nilable(CacheConfig)) }
    attr_reader :cache_config

    sig { returns(T.nilable(CustomGatesEvaluator)) }
    attr_reader :custom_gates_evaluator

    sig { returns(FallbackEvaluator) }
    attr_reader :fallback_evaluator

    sig { returns(T::Array[String]) }
    attr_reader :errors

    sig do
      params(
        adapter: T.nilable(Adapter),
        cache_config: T.nilable(CacheConfig),
        custom_gates_evaluator: T.nilable(CustomGatesEvaluator)
      ).void
    end
    def initialize(adapter: nil, cache_config: nil, custom_gates_evaluator: nil)
      @adapter = T.let(adapter, T.nilable(Adapter))
      @cache_config = T.let(cache_config, T.nilable(CacheConfig))
      @custom_gates_evaluator = T.let(custom_gates_evaluator, T.nilable(CustomGatesEvaluator))
      @fallback_evaluator = T.let(DEFAULT_FALLBACK_EVALUATOR, FallbackEvaluator)

      @errors = T.let([], T::Array[String])
    end

    sig { returns(T::Boolean) }
    def configured?
      !!@adapter # We assume that Vexi was configured if an adapter was set
    end

    sig { returns(Client) }
    def create_instance
      unless valid?
        raise ConfigurationError, "Invalid configuration: #{errors.join(", ")}"
      end

      feature_flag_service = Services::FeatureFlagService.new(adapter, cache_config)
      segment_service = Services::SegmentService.new(adapter, cache_config)

      Client.new(self, feature_flag_service, segment_service)
    end

    sig { returns(Adapter) }
    def adapter
      if !@adapter
        raise ConfigurationError, "Adapter was not configured"
      end

      @adapter
    end

    sig { params(adapter: Adapter).void }
    def adapter=(adapter)
      if @adapter
        raise ConfigurationError, "Adapter already configured: #{@adapter.adapter_name}"
      end

      @adapter = adapter
    end

    sig { params(cache_config: CacheConfig).void }
    def cache_config=(cache_config)
      if @cache_config
        raise ConfigurationError, "Cache already configured: #{@cache_config.cache.cache_name}"
      end

      @cache_config = cache_config
    end

    sig { params(custom_gates_evaluator: CustomGatesEvaluator).void }
    def custom_gates_evaluator=(custom_gates_evaluator)
      if @custom_gates_evaluator
        raise ConfigurationError, "CustomGatesEvaluator already configured: #{@custom_gates_evaluator.custom_gates_evaluator_name}"
      end

      @custom_gates_evaluator = custom_gates_evaluator
    end

    sig { params(fallback_evaluator: FallbackEvaluator).void }
    def fallback_evaluator=(fallback_evaluator)
      # Fallback evaluator is set up with a default
      @fallback_evaluator = fallback_evaluator
    end

    sig { returns(T::Hash[Symbol, String]) }
    def context
      cache = @cache_config ? @cache_config.cache.cache_name : "disabled"
      custom_gate_evaluator = @custom_gates_evaluator ? @custom_gates_evaluator.custom_gates_evaluator_name: "disabled"

      {
        adapter: adapter.adapter_name,
        cache: cache,
        custom_gates_evaluator: custom_gate_evaluator,
        version: VERSION,
      }
    end

    sig { returns(T::Boolean) }
    def valid?
      @errors = [] # Reset errors to get accurate results

      if !@adapter
        @errors << "adapter was not configured"
        return false
      end

      true
    end
  end
end
