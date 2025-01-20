# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"
require "vexi/configuration"
require "vexi/builders/adapter_builder"
require "vexi/builders/cache_builder"
require "vexi/builders/custom_gates_evaluator_builder"

module Vexi
  class Builder
    extend T::Sig

    class BuilderError < StandardError; end

    sig { params(config: Configuration).void }
    def initialize(config)
      @config = T.let(config, Configuration)

      @adapter_builder = T.let(Builders::AdapterBuilder.new(config), Builders::AdapterBuilder)
      @cache_builder = T.let(Builders::CacheBuilder.new(config), Builders::CacheBuilder)
      @custom_gates_evaluator_builder = T.let(Builders::CustomGatesEvaluatorBuilder.new(config), Builders::CustomGatesEvaluatorBuilder)
    end

    sig { returns(Builders::AdapterBuilder) }
    def adapter
      @adapter_builder
    end

    sig { returns(Builders::CacheBuilder) }
    def cache
      @cache_builder
    end

    sig { returns(Builders::CustomGatesEvaluatorBuilder) }
    def custom_gates_evaluator
      @custom_gates_evaluator_builder
    end

    sig { params(fallback_evaluator: Configuration::FallbackEvaluator).void }
    def fallback_evaluator(fallback_evaluator)
      @config.fallback_evaluator = fallback_evaluator
    end
  end
end
