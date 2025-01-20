# frozen_string_literal: true
# typed: strict

module Vexi
  module ActorCollection
    extend T::Sig
    extend T::Helpers

    interface!

    sig do
      abstract
      .params(
        blk: T.proc.params(elem: [String, T::Boolean]).returns(BasicObject)
      ).void
    end
    def each(&blk); end

    sig { abstract.params(key: String).returns(T.nilable(T::Boolean)) }
    def [](key); end

    sig { abstract.params(key: String, value: T::Boolean).void }
    def []=(key, value); end

    sig { abstract.params(key: String).void }
    def delete(key); end

    sig { abstract.returns(T::Array[String]) }
    def keys; end

    sig { abstract.returns(T::Array[T::Boolean]) }
    def values; end

    sig { abstract.returns(Numeric) }
    def length; end
  end
end
