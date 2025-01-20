# frozen_string_literal: true
# typed: strict

require "zache"
require "vexi/cache"

module Vexi
  module Caches
    # Public: InMemory Cache definition.
    class InMemory
      extend T::Sig

      include Cache

      sig { void }
      def initialize
        super()
        @cache = T.let(Zache.new, Zache)
      end

      sig do
        override.params(keys: T::Array[String]).returns(T.untyped)
      end
      def mget(keys)
        entities = T.let([], T::Array[T.untyped])
        keys.each do |key|
          entities << @cache.get(key)
        rescue StandardError
          next
        end

        entities
      end

      sig { override.params(key_value_pairs: T::Hash[String, T.untyped], lifetime: Numeric).void }
      def mset(key_value_pairs, lifetime)
        # Cache::TTL_NEVER_EXPIRE means infinite lifetime, but Zache doesn't support that so instead it just uses a huge number that is effectively never going to expire
        effective_lifetime = lifetime == Cache::TTL_NEVER_EXPIRE ? 2**32 : lifetime

        key_value_pairs.each do |(key, value)|
          @cache.put(key, value, lifetime: effective_lifetime)
        end
      end

      sig { override.returns(String) }
      def cache_name
        "in_memory"
      end
    end
  end
end
