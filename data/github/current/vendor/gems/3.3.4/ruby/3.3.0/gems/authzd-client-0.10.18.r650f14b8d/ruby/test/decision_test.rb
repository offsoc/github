# frozen_string_literal: true

require_relative "test_helper"

class ResponseTest < Minitest::Test
  def test_decision_helpers
    decision = Authzd::Proto::Decision.new(result: Authzd::Proto::Result::ALLOW)
    assert_predicate decision, :allow?
    refute_predicate decision, :indeterminate?

    decision = Authzd::Proto::Decision.new(result: Authzd::Proto::Result::INDETERMINATE)
    refute_predicate decision, :allow?
    assert_predicate decision, :indeterminate?
  end
end
