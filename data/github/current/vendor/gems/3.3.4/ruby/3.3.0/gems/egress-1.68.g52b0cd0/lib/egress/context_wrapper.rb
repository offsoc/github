# frozen_string_literal: true

module Egress
  # Public: Transforms the context hash into an OpenStruct-like object
  class ContextWrapper
    def initialize(data = {})
      @data = data.transform_keys(&:to_sym)
    end

    def [](key)
      @data[key.to_sym]
    end

    # TODO: This method is not used within Egress, but it is used in a
    # handful of roles in the monolith. We should remove those and then
    # remove this entire class.
    def method_missing(symbol, *_args)
      @data[symbol]
    end

    def respond_to_missing?(symbol, include_private = false)
      @data.key?(symbol) || super
    end
  end
end
