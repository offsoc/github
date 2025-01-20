# frozen_string_literal: true

require_relative "test_helper"

class ResponseTest < Minitest::Test

  def test_from_decision
    req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", 1)])
    req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", 2)])
    req3 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", 1)])
    requests = [req1, req2, req3]
    batch_request = Authzd::Proto::BatchRequest.new(requests: requests)
    dec1 = Authzd::Proto::Decision.allow
    dec2 = Authzd::Proto::Decision.indeterminate
    decisions = [dec1, dec2, dec1]
    batch_decision = Authzd::Proto::BatchDecision.new(decisions: decisions)
    response = Authzd::BatchResponse.from_decision(batch_request, batch_decision)
    assert_predicate response, :batch?
    refute_predicate response, :error?
    assert_equal requests, response.requests
    assert_equal decisions, response.decisions
    assert_equal :ALLOW, response[req1].result
    assert_equal :INDETERMINATE, response[req2].result
    assert_equal :ALLOW, response[req3].result
  end

  def test_from_error
    req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", nil)])
    req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", nil)])
    requests = [req1, req2]
    batch_request = Authzd::Proto::BatchRequest.new(requests: requests)
    response = Authzd::BatchResponse.from_error(batch_request, StandardError)
    assert_predicate response, :batch?
    assert_predicate response, :error?
    assert_equal requests, response.requests
    assert_equal :INDETERMINATE, response[req1].result
    assert_equal :INDETERMINATE, response[req2].result
  end

  def test_raises_if_request_has_different_size_as_response
    req1 = Authzd::Proto::Request.new
    req2 = Authzd::Proto::Request.new
    requests = [req1, req2]
    batch_request = Authzd::Proto::BatchRequest.new(requests: requests)
    dec1 = Authzd::Proto::Decision.allow
    decisions = [dec1]
    batch_decision = Authzd::Proto::BatchDecision.new(decisions: decisions)
    assert_raises(Authzd::Error) do
      Authzd::BatchResponse.from_decision(batch_request, batch_decision)
    end
  end

  def test_wrap_decisions_in_responses
    req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", "1")])
    req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", "2")])
    requests = [req1, req2]
    batch_request = Authzd::Proto::BatchRequest.new(requests: requests)
    dec1 = Authzd::Proto::Decision.allow
    dec2 = Authzd::Proto::Decision.indeterminate
    decisions = [dec1, dec2]
    batch_decision = Authzd::Proto::BatchDecision.new(decisions: decisions)
    response = Authzd::BatchResponse.from_decision(batch_request, batch_decision)
    assert_predicate response, :batch?
    refute_predicate response, :error?
    assert_equal requests, response.requests
    assert_equal decisions, response.decisions
    assert_equal :ALLOW, response[req1].result
    assert_predicate response[req1], :allow?
    refute_predicate response[req1], :error?
    assert_equal :INDETERMINATE, response[req2].result
    assert_predicate response[req2], :deny?
    refute_predicate response[req2], :error?
  end

  def test_wrap_decisions_in_responses_from_error
    req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", true)])
    req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", false)])
    requests = [req1, req2]
    batch_request = Authzd::Proto::BatchRequest.new(requests: requests)
    response = Authzd::BatchResponse.from_error(batch_request, StandardError)
    assert_predicate response, :batch?
    assert_predicate response, :error?
    assert_equal requests, response.requests
    assert_equal :INDETERMINATE, response[req1].result
    assert_predicate response[req1], :error?
    assert_predicate response[req1], :deny?
    assert_equal :INDETERMINATE, response[req2].result
    assert_predicate response[req2], :error?
    assert_predicate response[req2], :deny?
  end
end
