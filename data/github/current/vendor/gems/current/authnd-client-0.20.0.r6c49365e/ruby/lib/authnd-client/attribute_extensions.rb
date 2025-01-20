# frozen_string_literal: true

module Authnd
  module Proto
    class Value
      # Wraps the specified value in a Authnd::Proto::Value object
      # The following types are supported:
      # * Integers map to values of kind integer_value
      # * Floats map to values of kind double_value
      # * Strings map to values of kind string_value
      # * true and false map to values of kind bool_value
      # * Arrays of Integers map to values of kind integer_list
      # * Arrays of Strings map to values of kind string_list
      #
      # In addition, Symbols will be wrapped as string values.
      # Be aware that when _unwrapping_ a string attribute, it will always be returned as a String.
      #
      # Arrays containing types other than Integer and Float, or arrays containing multiple types, will fail to wrap.
      # Arbitrary Enumerables are not supported, use #to_a to convert them to arrays first.
      def self.wrap(value)
        case value
        when nil
          raise ArgumentError, "Values of type 'nil' are deprecated and should no longer be used"
        when Integer
          Value.new(integer_value: value)
        when Float
          Value.new(double_value: value)
        when String
          Value.new(string_value: value)
        when Time
          Value.new(time_value: value)
        when Symbol
          Value.new(string_value: value.to_s)
        when TrueClass, FalseClass
          Value.new(bool_value: value)
        when Array
          # The type of the first element defines the type of list
          raise ArgumentError, "Array must contain all Integers, or all Strings, and contain at least one value" if value.empty?
          raise ArgumentError, "Array must contain all Integers, or all Strings, and contain at least one value" unless value.first.is_a?(Integer) || value.first.is_a?(String)
          raise ArgumentError, "Array must contain all Integers, or all Strings, and contain at least one value" unless value.all? { |v| v.is_a?(value.first.class) }

          case value.first
          when Integer
            Value.new(integer_list_value: IntegerList.new(values: value))
          when String
            Value.new(string_list_value: StringList.new(values: value))
          else
            raise ArgumentError, "Array contains an unsupported type: #{value.first.class}"
          end
        else
          raise ArgumentError, "Unsupported type: #{value.class}"
        end
      end

      def unwrap
        raise ArgumentError, "Value must have a 'kind'" unless kind

        value = send(kind)

        if value.is_a?(Authnd::Proto::StringList) || value.is_a?(Authnd::Proto::IntegerList)
          value.values.to_a
        elsif value == :NULL_VALUE
          nil
        else
          value
        end
      end
    end

    class Attribute
      def self.list_from_hash(hash)
        # using #filter_map means that if the block returns `nil`, it won't be included in the list
        hash.filter_map do |k, v|
          # Skip nil values
          next if v.nil?

          value = Value.wrap(v)
          Attribute.new(id: k.to_s, value: value)
        end
      end
    end
  end
end
