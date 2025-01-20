# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

require "vexi/configuration"
require "vexi/caches/in_memory"

module Vexi
  module Builders
    class CacheBuilder
      extend T::Sig

      sig { params(config: Configuration).void }
      def initialize(config)
        @config = T.let(config, Configuration)
      end

      sig { params(ttl: Integer, not_found_ttl: Integer).void }
      def in_memory(ttl = 30, not_found_ttl = 30)
        @config.cache_config = CacheConfig.new(Caches::InMemory.new, ttl, not_found_ttl)
      end

      sig { params(custom_cache: Cache, ttl: Integer, not_found_ttl: Integer).void }
      def custom(custom_cache, ttl, not_found_ttl)
        @config.cache_config = CacheConfig.new(custom_cache, ttl, not_found_ttl)
      end
    end
  end
end
