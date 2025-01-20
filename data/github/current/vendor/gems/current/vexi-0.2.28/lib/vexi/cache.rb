# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

module Vexi
  # Vexi cache interface.
  module Cache
    extend T::Sig
    extend T::Helpers
    interface!

    include Kernel

    TTL_NEVER_EXPIRE = -1

    sig do
      abstract.params(
        keys: T::Array[String]
      ).returns(T::Array[T.untyped])
    end
    def mget(keys); end

    # lifetime is in seconds.
    # If lifetime is Cache::TTL_NEVER_EXPIRE, the value will never expire.
    sig { abstract.params(key_value_pairs: T::Hash[String, T.untyped], lifetime: Numeric).void }
    def mset(key_value_pairs, lifetime); end

    sig { abstract.returns String }
    def cache_name; end
  end
end
