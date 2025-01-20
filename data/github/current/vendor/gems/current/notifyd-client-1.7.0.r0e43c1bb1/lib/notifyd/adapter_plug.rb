# typed: true
# frozen_string_literal: true

require "notifyd/plug"

module Notifyd
  # Set an adapter in the Faraday connection
  # This adapter has to be used as the last in the plug chain
  class AdapterPlug
    include Plug

    attr_reader :key, :args, :block

    def initialize(key, args, block)
      @key = key
      @args = args
      @block = block
    end

    def inject(conn)
      conn.adapter key, *args, &block
    end
  end
end
