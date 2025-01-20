# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

module Vexi
  # Vexi cache config
  class CacheConfig
    extend T::Sig
    extend T::Helpers

    include Kernel

    # Cache instance.
    sig { returns(Cache) }
    attr_reader :cache

    # TTL for caching entities returned from the adapter.
    sig { returns(Integer) }
    attr_reader :ttl

    # TTL for caching entities not found from adapter.
    sig { returns(Integer) }
    attr_reader :not_found_ttl

    sig { params(cache: Cache, ttl: Integer, not_found_ttl: Integer).void }
    def initialize(cache, ttl, not_found_ttl)
      @cache = cache
      @ttl = ttl
      @not_found_ttl = not_found_ttl
    end
  end
end
