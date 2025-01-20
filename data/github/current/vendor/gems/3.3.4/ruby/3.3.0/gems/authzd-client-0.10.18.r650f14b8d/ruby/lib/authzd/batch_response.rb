# frozen_string_literal: true

module Authzd
  class BatchResponse
    attr_reader :error, :batch_request, :batch_decision, :map

    def self.from_decision(batch_request, batch_decision)
      new(batch_request, batch_decision, nil)
    end

    def self.from_error(batch_request, error)
      batch_decision = create_batch_for_error(batch_request, error)
      new(batch_request, batch_decision, error)
    end

    def initialize(batch_request, batch_decision, error)
      @batch_request = batch_request
      @batch_decision = batch_decision
      @error = error
      @map = build_decision_map
    end

    def decisions
      batch_decision.decisions
    end

    def responses
      map.values
    end

    def requests
      batch_request.requests
    end

    def error?
      !!error
    end

    def [](key)
      map[key]
    end

    # distinguish a BatchResponse from Response without having
    # to check the class directly
    def batch?
      true
    end

    private

    def build_decision_map
      batch_decision.map_to_requests(batch_request) do |_request, decision|
        if error.nil?
          Authzd::Response.from_decision(decision)
        else
          Authzd::Response.from_error(error)
        end
      end
    end

    def self.create_batch_for_error(batch_request, error)
      indeterminate = Authzd::Proto::Decision.indeterminate(reason: error.to_s)
      decisions = []
      batch_request.requests.each do |_|
        decisions << indeterminate
      end
      Authzd::Proto::BatchDecision.new(decisions: decisions)
    end
  end
end
