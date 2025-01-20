# frozen_string_literal: true

require "json"

module Authzd
  class Response

    attr_reader :error, :decision

    def self.from_decision(decision)
      new(decision, nil)
    end

    def self.from_error(error)
      new(Authzd::Proto::Decision.indeterminate(reason: error.to_s), error)
    end

    def initialize(decision, error)
      @decision = decision
      @error = error
    end

    def allow?
      @decision&.allow?
    end

    def deny?
      !allow?
    end

    def error?
      !!error
    end

    def not_applicable?
      @decision&.not_applicable?
    end

    def indeterminate?
      @decision&.indeterminate?
    end

    def result
      @decision&.result
    end

    def reason
      @decision&.reason
    end

    def ==(other)
      decision == other.decision && error == other.error
    end

    # distinguish a BatchResponse from Response without having
    # to check the class directly
    def batch?
      false
    end

    # Manually generate the JSON representation of the Response
    # see https://github.com/github/authzd/issues/760
    def to_json(options = {})
      self.as_json.to_json
    end

    def as_json(options = {})
      d = JSON.parse(Authzd::Proto::Decision.encode_json(decision, emit_defaults: true))
      {decision: d, error: error}
    end
  end
end
