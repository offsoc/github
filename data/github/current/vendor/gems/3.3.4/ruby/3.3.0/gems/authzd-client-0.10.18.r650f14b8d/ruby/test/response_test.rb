# frozen_string_literal: true

require_relative "test_helper"

class ResponseTest < Minitest::Test

  def test_nil_decision
    response = Authzd::Response.new(nil, nil)
    refute_predicate response, :allow?
    assert_predicate response, :deny?
    refute_predicate response, :error?
    assert_nil response.decision
    assert_nil response.reason
    assert_nil response.result
  end

  def test_from_error_uses_reason
    response = Authzd::Response.from_error(StandardError.new("oh hi"))
    assert_predicate response, :deny?
    assert_predicate response, :error?
    assert_predicate response, :indeterminate?

    assert_equal :INDETERMINATE, response.result
    assert_equal "oh hi", response.reason
  end

  def test_to_json_error
    error_response = Authzd::Response.from_error(StandardError.new("oh hi"))
    expected_response = {
      decision: { result: :INDETERMINATE, reason: "oh hi" },
      error: "oh hi"
    }

    assert_equal expected_response.to_json, error_response.to_json
  end

  def test_as_json_no_error
    deny_response  = Authzd::Response.from_decision(Authzd::Proto::Decision.deny)
    allow_response = Authzd::Response.from_decision(Authzd::Proto::Decision.allow)
    na_response    = Authzd::Response.from_decision(Authzd::Proto::Decision.not_applicable)
    indeterminate_response = Authzd::Response.from_decision(Authzd::Proto::Decision.indeterminate)

    # protobuf doesn't serialize the default value for a response.
    expected_deny  = {
      decision: { result: "DENY", reason: "Denied" },
      error: nil
    }
    expected_allow = {
      decision: { result: "ALLOW", reason: "Allowed" },
      error: nil
    }
    expected_na    = {
      decision: { result: "NOT_APPLICABLE", reason: "Not applicable" },
      error: nil
    }
    expected_indeterminate = {
      decision: { result: "INDETERMINATE", reason: "Indeterminate" },
      error: nil
    }

    assert_equal expected_allow.to_json, allow_response.to_json
    assert_equal expected_deny.to_json, deny_response.to_json
    assert_equal expected_na.to_json, na_response.to_json
    assert_equal expected_indeterminate.to_json, indeterminate_response.to_json
  end
end
