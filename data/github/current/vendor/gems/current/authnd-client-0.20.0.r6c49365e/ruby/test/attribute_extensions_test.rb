# frozen_string_literal: true

require "minitest/autorun"
require "authnd-client"

class AttributeExtensionsTest < Minitest::Test
  def test_value_wrap_integer
    v = Authnd::Proto::Value.wrap(1)
    assert_equal :integer_value, v.kind
    assert_equal 1, v.integer_value
    assert_equal 1, v.unwrap
  end

  def test_value_wrap_float
    v = Authnd::Proto::Value.wrap(1.1)
    assert_equal :double_value, v.kind
    assert_equal 1.1, v.double_value
    assert_equal 1.1, v.unwrap
  end

  def test_value_wrap_string
    v = Authnd::Proto::Value.wrap("test")
    assert_equal :string_value, v.kind
    assert_equal "test", v.string_value
    assert_equal "test", v.unwrap
  end

  def test_value_wrap_time
    time = Time.now
    v = Authnd::Proto::Value.wrap(time)
    assert_equal :time_value, v.kind
    assert_equal Google::Protobuf::Timestamp.new(seconds: time.tv_sec, nanos: time.nsec), v.time_value
    assert_equal Google::Protobuf::Timestamp.new(seconds: time.tv_sec, nanos: time.nsec), v.unwrap
  end

  def test_value_wrap_symbol
    v = Authnd::Proto::Value.wrap(:test)
    assert_equal :string_value, v.kind
    assert_equal "test", v.string_value
    assert_equal "test", v.unwrap
  end

  def test_value_wrap_boolean
    v = Authnd::Proto::Value.wrap(true)
    assert_equal :bool_value, v.kind
    assert_equal true, v.bool_value
    assert_equal true, v.unwrap

    v = Authnd::Proto::Value.wrap(false)
    assert_equal :bool_value, v.kind
    assert_equal false, v.bool_value
    assert_equal false, v.unwrap
  end

  def test_value_wrap_int_list
    v = Authnd::Proto::Value.wrap([1, 2, 3])
    assert_equal :integer_list_value, v.kind
    assert_equal [1, 2, 3], v.integer_list_value.values
    assert_equal [1, 2, 3], v.unwrap
  end

  def test_value_wrap_string_list
    v = Authnd::Proto::Value.wrap(%w[a b c])
    assert_equal :string_list_value, v.kind
    assert_equal %w[a b c], v.string_list_value.values
    assert_equal %w[a b c], v.unwrap
  end

  def test_fails_to_wrap_nil
    e = assert_raises ArgumentError do
      Authnd::Proto::Value.wrap(nil)
    end
    assert_equal "Values of type 'nil' are deprecated and should no longer be used", e.message
  end

  def test_fails_to_wrap_other_types
    e = assert_raises ArgumentError do
      Authnd::Proto::Value.wrap(Object.new)
    end
    assert_equal "Unsupported type: Object", e.message
  end

  def test_fails_to_wrap_array_of_other_type
    e = assert_raises ArgumentError do
      Authnd::Proto::Value.wrap([Time.now])
    end
    assert_equal "Array must contain all Integers, or all Strings, and contain at least one value", e.message
  end

  def test_array_type_error_is_raised_before_heterogenous_array_check
    e = assert_raises ArgumentError do
      Authnd::Proto::Value.wrap([true, false])
    end
    assert_equal "Array must contain all Integers, or all Strings, and contain at least one value", e.message
  end

  def test_fails_to_wrap_empty_array
    e = assert_raises ArgumentError do
      Authnd::Proto::Value.wrap([])
    end
    assert_equal "Array must contain all Integers, or all Strings, and contain at least one value", e.message
  end

  def test_fails_to_wrap_heterogenous_array
    e = assert_raises ArgumentError do
      Authnd::Proto::Value.wrap([1, "a"])
    end
    assert_equal "Array must contain all Integers, or all Strings, and contain at least one value", e.message
  end

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

  def test_unwraps_time_value_as_time
    time = Time.now
    run_unwrap_test Authnd::Proto::Value.new(time_value: Google::Protobuf::Timestamp.new(seconds: time.tv_sec)), Google::Protobuf::Timestamp, Google::Protobuf::Timestamp.new(seconds: time.tv_sec)
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

  def test_list_from_hash
    hash = {
      "actor.id": 1,
      "actor.type": :user,
      "actor.login": "monalisa",
      "pi": 3.14159,
      "actor.site_admin": false,
      "actor.employee": true,
      "org.ids": [1, 2, 3],
      "credential.scopes": %w[repo gist],

      # nil values should be ignored.
      "sir_not_appearing_in_this_list": nil,
    }
    list = Authnd::Proto::Attribute.list_from_hash(hash)
    assert_equal [
      Authnd::Proto::Attribute.new(id: "actor.id", value: Authnd::Proto::Value.new(integer_value: 1)),
      Authnd::Proto::Attribute.new(id: "actor.type", value: Authnd::Proto::Value.new(string_value: "user")),
      Authnd::Proto::Attribute.new(id: "actor.login", value: Authnd::Proto::Value.new(string_value: "monalisa")),
      Authnd::Proto::Attribute.new(id: "pi", value: Authnd::Proto::Value.new(double_value: 3.14159)),
      Authnd::Proto::Attribute.new(id: "actor.site_admin", value: Authnd::Proto::Value.new(bool_value: false)),
      Authnd::Proto::Attribute.new(id: "actor.employee", value: Authnd::Proto::Value.new(bool_value: true)),
      Authnd::Proto::Attribute.new(id: "org.ids", value: Authnd::Proto::Value.new(integer_list_value: Authnd::Proto::IntegerList.new(values: [1, 2, 3]))),
      Authnd::Proto::Attribute.new(id: "credential.scopes", value: Authnd::Proto::Value.new(string_list_value: Authnd::Proto::StringList.new(values: %w[repo gist]))),
    ], list
  end

  private

  def run_unwrap_test(value, expected_type, expected_value)
    assert_instance_of expected_type, value.unwrap
    assert_equal expected_value, value.unwrap
  end
end
