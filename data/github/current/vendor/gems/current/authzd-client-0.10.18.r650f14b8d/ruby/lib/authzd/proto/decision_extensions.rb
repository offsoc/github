# frozen_string_literal: true

module Authzd::Proto
  class Decision
    def self.allow
      new(
          result: Result::ALLOW,
          reason: "Allowed",
      )
    end

    def self.deny(reason: "Denied")
      new(
          result: Result::DENY,
          reason: reason,
      )
    end

    def self.not_applicable(reason: "Not applicable")
      new(
          result: Result::NOT_APPLICABLE,
          reason: reason,
      )
    end

    def self.indeterminate(reason: "Indeterminate")
      new(
          result: Result::INDETERMINATE,
          reason: reason,
      )
    end

    # Returns true if result is ALLOW
    def allow?
      Result.resolve(result) == Result::ALLOW
    end

    # Returns true if result is INDETERMINATE
    def indeterminate?
      Result.resolve(result) == Result::INDETERMINATE
    end

    def not_applicable?
      Result.resolve(result) == Result::NOT_APPLICABLE
    end

    def batch?
      false
    end
  end
end
