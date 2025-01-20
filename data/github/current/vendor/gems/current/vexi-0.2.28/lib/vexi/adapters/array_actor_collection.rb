# frozen_string_literal: true
# typed: strict

require "vexi/actor_collection"

module Vexi
  module Adapters
    class ArrayActorCollection
      extend T::Sig
      extend T::Helpers

      include ::Vexi::ActorCollection

      sig { returns(T::Array[String]) }
      attr_reader :actors_array

      sig { params(actors_array: T::Array[String]).void }
      def initialize(actors_array)
        @actors_array = T.let(actors_array, T::Array[String])
      end

      sig { override.params(key: String).returns(T.nilable(T::Boolean)) }
      def [](key)
        # Binary search for the actor in the actors_array
        @actors_array.bsearch { |actor|
          comparison_result = key <=> actor

          if !comparison_result
            raise TypeError, "Unable to compare #{key} with #{actor}"
          end

          comparison_result
        } == key
      end

      sig { override.params(key: String, value: T::Boolean).void }
      def []=(key, value)
        raise NotImplementedError
      end

      sig do
        override
        .params(
          blk: T.proc.params(elem: [String, T::Boolean]).returns(BasicObject)
        ).void
      end
      def each(&blk)
        actors_array.each { |actor| blk.call([actor, true]) }
      end

      sig { override.params(key: String).void }
      def delete(key)
        raise NotImplementedError
      end

      sig { override.returns(T::Array[String]) }
      def keys
        @actors_array
      end

      sig { override.returns(Numeric) }
      def length
        @actors_array.length
      end

      sig { override.returns(T::Array[T::Boolean]) }
      def values
        @actors_array.each.map { |actor| true }
      end

      sig { override.returns(String) }
      def inspect
        "#{self.class.name}(#{@actors_array.inspect})"
      end

      sig { override.params(obj: T.untyped).returns(T::Boolean) }
      def ==(obj)
        return false unless obj.is_a?(ArrayActorCollection)

        obj.actors_array == @actors_array
      end
    end
  end
end
