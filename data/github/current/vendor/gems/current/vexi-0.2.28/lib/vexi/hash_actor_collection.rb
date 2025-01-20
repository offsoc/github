# frozen_string_literal: true
# typed: strict

require "vexi/actor_collection"

module Vexi

  class HashActorCollection
    extend T::Sig
    extend T::Helpers

    include ::Vexi::ActorCollection

    sig { returns(T::Hash[String, T::Boolean]) }
    attr_reader :actors_hash

    sig { params(actors_hash: T::Hash[String, T::Boolean]).void }
    def initialize(actors_hash)
      @actors_hash = T.let(actors_hash, T::Hash[String, T::Boolean])
    end

    sig { override.params(key: String).returns(T.nilable(T::Boolean)) }
    def [](key)
      @actors_hash[key]
    end

    sig { override.params(key: String, value: T::Boolean).void }
    def []=(key, value)
      @actors_hash[key] = value
    end

    sig do
      override
      .params(
        blk: T.proc.params(elem: [String, T::Boolean]).returns(BasicObject)
      ).void
    end
    def each(&blk)
      @actors_hash.each(&blk)
    end

    sig { override.params(key: String).void }
    def delete(key); end
    sig { override.returns(T::Array[String]) }
    def keys
      @actors_hash.keys
    end

    sig { override.returns(Numeric) }
    def length
      @actors_hash.length
    end

    sig { override.returns(T::Array[T::Boolean]) }
    def values
      @actors_hash.values
    end

    sig { override.returns(String) }
    def inspect
      "#{self.class.name}(#{@actors_hash.inspect})"
    end

    sig { override.params(obj: T.untyped).returns(T::Boolean) }
    def ==(obj)
      return false unless obj.is_a?(HashActorCollection)

      obj.actors_hash == @actors_hash
    end
  end
end
