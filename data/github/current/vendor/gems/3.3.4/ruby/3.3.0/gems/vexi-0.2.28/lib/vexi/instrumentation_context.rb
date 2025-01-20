# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"
require "vexi/instrumenter"

module Vexi
  class InstrumentationContext
    extend T::Sig

    CollectionType = T.type_alias { T.nilable(T.any(T::Array[T.untyped], T::Hash[T.untyped, T.untyped])) }

    sig { params(store: Instrumenter::NotificationContext).void }
    def initialize(store = {})
      @store = T.let(store, Instrumenter::NotificationContext)
    end

    sig do
      type_parameters(:U)
      .params(property_name: Symbol, block: T.proc.returns(T.all(T.type_parameter(:U), T.nilable(T::Boolean))))
      .returns(T.all(T.type_parameter(:U), T.nilable(T::Boolean)))
    end
    def capture_boolean(property_name, &block)
      result = block.call
      self[property_name] = result unless result.nil?
      result
    end

    sig do
      type_parameters(:U)
      .params(property_name: Symbol, block: T.proc.returns(T.all(T.type_parameter(:U), CollectionType)))
      .returns(T.all(T.type_parameter(:U), CollectionType))
    end
    def capture_collection_size(property_name, &block)
      result = block.call
      self[property_name] = result.size unless result.nil?
      result
    end

    sig { params(key: Symbol, value: Instrumenter::NotificationContextValue).void }
    def []=(key, value)
      @store[key] = value
    end

    sig { returns(Instrumenter::NotificationContext) }
    def to_h
      @store
    end
  end
end
