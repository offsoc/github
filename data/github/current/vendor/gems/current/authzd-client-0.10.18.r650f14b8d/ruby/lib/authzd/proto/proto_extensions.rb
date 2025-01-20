# frozen_string_literal: true

require_relative "authorizer_pb"

module Authzd::Proto
  class Attribute
    def self.wrap(id, value)
      new(id: id.to_s, value: Value.wrap(value))
    end

    def unwrapped_value
      value&.unwrap
    end
  end

  class Value

    class << self
      def wrap(value, empty_list_target: :integer_list)
        attr_value = new
        case value
        when NilClass
          attr_value.null_value = Google::Protobuf::NullValue::NULL_VALUE
        when Integer
          attr_value.integer_value = value
        when Float
          attr_value.double_value = value
        when TrueClass, FalseClass
          attr_value.bool_value = value
        when String, Symbol
          attr_value.string_value = value.to_s
        when Array
          wrap_list(attr_value, value, empty_list_target)
        else
          raise TypeError, "#{value} of class #{value.class} cannot be serialized into a Authzd::Proto::Value"
        end
        attr_value
      end

      private

      def wrap_list(value, list, empty_list_target)
        return wrap_empty_list(value, empty_list_target) if list.length == 0

        case list[0]
        when Integer
          wrap_integer_list(value, list)
        when String, Symbol
          wrap_string_list(value, list)
        else
          raise TypeError, "array of types other than Strings or Integers"
        end
      end

      def wrap_empty_list(value, empty_list_target)
        if empty_list_target == :integer_list
          value.integer_list_value = IntegerList.new
        else
          value.string_list_value = StringList.new
        end
      end

      def wrap_integer_list(value, list)
        integer_list = IntegerList.new(values: list.map(&:to_i))
        value.integer_list_value = integer_list
      end

      def wrap_string_list(value, list)
        string_list = StringList.new(values: list.map(&:to_s))
        value.string_list_value = string_list
      end
    end

    def unwrap
      return unless kind
      value = send(kind)

      if value.is_a?(StringList) || value.is_a?(IntegerList)
        value.values
      elsif value == :NULL_VALUE
        nil
      else
        value
      end
    end

    def to_s
      unwrap&.to_s
    end

    def to_sym
      unwrap&.to_sym
    end

    def to_i
      unwrap&.to_i
    end

    def to_f
      unwrap&.to_f
    end
  end
end
