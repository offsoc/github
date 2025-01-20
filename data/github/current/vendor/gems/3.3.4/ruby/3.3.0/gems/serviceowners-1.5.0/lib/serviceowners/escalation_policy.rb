# typed: strict
# frozen_string_literal: true

require "serviceowners/concerns/presence"

module Serviceowners
  # Representation of an escalation policy for a given severity
  class EscalationPolicy
    include Concerns::Presence
    extend T::Sig

    sig { params(properties: T::Hash[Symbol, String]).void }
    def initialize(properties)
      @properties = properties
    end

    sig { returns(T.nilable(String)) }
    def alert_slack
      presence(@properties[:alert_slack])
    end
  end
end
