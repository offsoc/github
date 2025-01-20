# frozen_string_literal: true

module Authzd
  Error              = Class.new(StandardError)
  DecorationError    = Class.new(Error)
  IndeterminateError = Class.new(Error)

  class BatchError < IndeterminateError
    attr_reader :request

    def initialize(batch_request:)
      @request = batch_request
    end
  end
end
