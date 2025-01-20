# frozen_string_literal: true
# typed: strict

require "vexi/entity"

module Vexi
  # GetEntityResponse is the abstract base class for get entity response.
  class GetEntityResponse
    extend T::Sig

    sig { returns(String) }
    attr_reader :name

    sig { returns(Entity) }
    attr_reader :entity

    sig { returns(T.nilable(StandardError)) }
    attr_reader :error

    sig { params(name: String, entity: T.untyped, error: T.nilable(StandardError)).void }
    def initialize(name: "", entity: nil, error: nil)
      @name = name
      @entity = entity
      @error = error
    end
  end
end
