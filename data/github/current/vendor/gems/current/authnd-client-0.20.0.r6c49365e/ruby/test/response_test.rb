# frozen_string_literal: true

require_relative "./test_helper"

class ResponseTest < Minitest::Test
  def test_unwraps_null_value_as_nil
    attributes = [
      Authnd::Proto::Attribute.new(
        id: "test",
        value: Authnd::Proto::Value.new(null_value: :NULL_VALUE),
      ),
    ]
    twirp_resp = Authnd::Proto::AuthenticateResponse.new(result: :RESULT_SUCCESS, attributes: attributes)
    resp = Authnd::Response.from_twirp(twirp_resp)

    assert_nil resp.attributes["test"]
  end

  def test_unwraps_integer_value_as_integer
    run_unwrap_test Authnd::Proto::Value.new(integer_value: 42), Integer, 42
  end

  def test_unwraps_double_value_as_float
    run_unwrap_test Authnd::Proto::Value.new(double_value: 3.14159), Float, 3.14159
  end

  def test_unwraps_string_value_as_string
    run_unwrap_test Authnd::Proto::Value.new(string_value: "foo"), String, "foo"
  end

  def test_unwraps_bool_value_as_boolean
    run_unwrap_test Authnd::Proto::Value.new(bool_value: true), TrueClass, true
    run_unwrap_test Authnd::Proto::Value.new(bool_value: false), FalseClass, false
  end

  def test_unwraps_string_list_value_as_array_of_integers
    val = Authnd::Proto::Value.new(
      integer_list_value: Authnd::Proto::IntegerList.new(values: [1, 2, 3, 4]),
    )
    run_unwrap_test val, Array, [1, 2, 3, 4]
  end

  def test_unwraps_string_list_value_as_array_of_strings
    val = Authnd::Proto::Value.new(
      string_list_value: Authnd::Proto::StringList.new(values: %w[a b c]),
    )
    run_unwrap_test val, Array, %w[a b c]
  end

  def test_success
    success_resp = Authnd::Proto::AuthenticateResponse.new(result: :RESULT_SUCCESS, attributes: [])
    fail_resp = Authnd::Proto::AuthenticateResponse.new(result: :RESULT_FAILED_GENERIC)

    assert_predicate Authnd::Response.from_twirp(success_resp), :success?
    refute_predicate Authnd::Response.from_twirp(fail_resp), :success?
  end

  private

  def run_unwrap_test(value, expected_type, expected_value)
    twirp_resp = Authnd::Proto::AuthenticateResponse.new(
      result: :RESULT_SUCCESS,
      attributes: [
        Authnd::Proto::Attribute.new(id: "test", value: value),
      ],
    )
    resp = Authnd::Response.from_twirp(twirp_resp)

    assert_instance_of expected_type, resp.attributes["test"]
    assert_equal expected_value, resp.attributes["test"]
  end
end
