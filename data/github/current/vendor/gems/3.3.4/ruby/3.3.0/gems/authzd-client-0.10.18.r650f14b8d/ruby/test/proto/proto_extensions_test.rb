# frozen_string_literal: true

require_relative "../test_helper"

module Authzd::Proto
  class AttributeTest < Minitest::Test

    describe ".wrap" do
      def test_wrap_creates_a_value_instane_from_the_scalar
        attr = Attribute.wrap(1, [1,2,3])
        assert_equal "1", attr.id
        assert_equal [1, 2, 3], attr.unwrapped_value

        expected_value = Value.new
        expected_value.integer_list_value = IntegerList.new(values: [1, 2, 3])
        assert_equal expected_value, attr.value
      end
    end
  end

  class ValueTest < Minitest::Test

    describe ".wrap" do
      def test_wrap_nil_value
        value = Value.new
        value.null_value = Google::Protobuf::NullValue::NULL_VALUE

        assert_equal value, Value.wrap(nil)
      end

      def test_wrap_integer_value
        value = Value.new
        value.integer_value = 1

        assert_equal value, Value.wrap(1)
      end

      def test_wrap_float_value
        value = Value.new
        value.double_value = 1.0

        assert_equal value, Value.wrap(1.0)
      end

      def test_wrap_symbol_value
        value = Value.new
        value.string_value = "bar"

        assert_equal value, Value.wrap(:bar)
      end

      def test_wrap_string_value
        value = Value.new
        value.string_value = "bar"

        assert_equal value, Value.wrap("bar")
      end

      def test_wrap_true_value
        value = Value.new
        value.bool_value = true

        assert_equal value, Value.wrap(true)
      end

      def test_wrap_false_value
        value = Value.new
        value.bool_value = false

        assert_equal value, Value.wrap(false)
      end

      def test_wrap_integer_list_value
        value = Value.new
        value.integer_list_value = IntegerList.new
        value.integer_list_value.values += [1,2]
        value.integer_list_value.values << 3

        assert_equal value, Value.wrap([1, 2, 3])
      end

      def test_wrap_string_list_value
        value = Value.new
        value.string_list_value = StringList.new
        value.string_list_value.values += %w(foo bar)
        value.string_list_value.values << "baz"

        assert_equal value, Value.wrap(%w(foo bar baz))
      end

      def test_wrap_symbol_list_value
        value = Value.new
        value.string_list_value = StringList.new
        value.string_list_value.values += %w(foo bar baz)

        assert_equal value, Value.wrap([:foo, :bar, :baz])
      end

      def test_unwrap_empty_list
        value = Value.wrap []
        assert_equal [], value.unwrap
      end
    end

    describe ".unwrap" do
      def test_unwrap_nil_value
        value = Value.new
        value.null_value = :NULL_VALUE

        assert_nil value.unwrap
      end

      def test_unwrap_integer_value
        value = Value.new
        value.integer_value = 2

        assert_equal 2, value.unwrap
      end

      def test_unwrap_double_value
        value = Value.new
        value.double_value = 1.0

        assert_equal 1.0, value.unwrap
      end

      def test_unwrap_string_value
        value = Value.new
        value.string_value = "foo"

        assert_equal "foo", value.unwrap
      end

      def test_unwrap_true_value
        value = Value.new
        value.bool_value = true

        assert_equal true, value.unwrap
      end

      def test_unwrap_false_value
        value = Value.new
        value.bool_value = false

        assert_equal false, value.unwrap
      end

      def test_unwrap_a_string_list_value
        value = Value.new
        value.string_list_value = IntegerList.new
        value.string_list_value.values += [1, 2, 3]

        assert_equal [1, 2, 3], value.unwrap
      end

      def test_unwrap_a_string_list_value
        value = Value.new
        value.string_list_value = StringList.new
        value.string_list_value.values += %w(foo bar baz)

        assert_equal %w(foo bar baz), value.unwrap
      end
    end
  end
end
