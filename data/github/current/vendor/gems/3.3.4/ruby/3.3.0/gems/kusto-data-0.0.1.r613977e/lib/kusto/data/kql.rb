# typed: true
# frozen_string_literal: true

module Kusto
  module Data
    module KQL
      extend T::Sig
      include Kernel

      sig { params(value: String).returns(T::Boolean) }
      def requires_quoting?(value)
        return false if value.empty?

        value.each_char do |c|
          next if c == "_"
          return true if c.ord > 255 || !(c =~ /[[:alnum:]]/)
        end
        false
      end

      sig { params(parameters: T::Hash[String, T.untyped]).returns(String) }
      def declaration_for(parameters)
        return "" if parameters.empty?

        "declare query_parameters(" + parameters
          .each { |key, value| raise Kusto::Error.new("Invalid parameter identifier '#{key}'.") if requires_quoting?(key) }
          .map { |key, value| "#{key}:#{type_for value}" }
          .join(", ") + ");"
      end

      sig { params(value: T.untyped).returns(String) }
      def type_for(value)
        case value
        when TrueClass, FalseClass
          "bool"
        when DateTime, Time
          "datetime"
        when BigDecimal
          "decimal"
        when Hash, Array
          "dynamic"
        when String
          if timespan?(value)
            "timespan"
          elsif value =~ /\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/
            "guid"
          else
            "string"
          end
        when Integer
          if value.between?(-2**31, 2**31-1)
            "int"
          else
            "long"
          end
        when Float
          "real"
        else
          raise Kusto::Error.new("Unsupported type: #{value.class}")
        end
      end

      sig { params(parameters: T::Hash[String, T.untyped]).returns(T::Hash[String, String]) }
      def parameters_for(parameters)
        parameters.each_with_object({}) do |(key, value), hash|
          hash[key] = case value
          when TrueClass, FalseClass, String, Integer, Float
            value.to_s
          when DateTime, Time
            value.strftime "%Y-%m-%dT%H:%M:%S.%N%z"
          when BigDecimal
            value.to_s("F")
          when Hash, Array
            value.to_json
          when NilClass
            ""
          else
            raise Kusto::Error.new("Unsupported type: #{value.class}")
          end
        end
      end

      sig { params(value: String).returns(T::Boolean) }
      def timespan?(value)
        patterns = [
          /^\d+d$/, # nd
          /^\d+(\.\d+)?h$/, # nh
          /^\d+m$/, # nm
          /^\d+s$/, # ns
          /^\d+ms$/, # nms
          /^\d+microsecond$/, # nmicrosecond
          /^\d+tick$/, # ntick
          /^timespan\(\d+ seconds\)$/, # timespan(n seconds)
          /^timespan\(\d+\)$/, # timespan(n)
          /^timespan\(\d+(\.\d+)?:(\d+):(\d+)(\.\d+)?\)$/, # timespan(days.hours:minutes:seconds.milliseconds)
          /^timespan\(null\)$/ # timespan(null)
        ]

        patterns.any? { |pattern| value.match(pattern) }
      end

      # def quote_string(value, hidden = false)
      #   return value if value.empty?

      #   literal = String.new
      #   literal << 'h' if hidden
      #   literal << '"'

      #   value.each_char do |c|
      #     case c
      #     when "'"
      #       literal << "\\'"
      #     when '"'
      #       literal << '\\"'
      #     when '\\'
      #       literal << '\\\\'
      #     when "\x00"
      #       literal << '\\0'
      #     when "\a"
      #       literal << '\\a'
      #     when "\b"
      #       literal << '\\b'
      #     when "\f"
      #       literal << '\\f'
      #     when "\n"
      #       literal << '\\n'
      #     when "\r"
      #       literal << '\\r'
      #     when "\t"
      #       literal << '\\t'
      #     when "\v"
      #       literal << '\\v'
      #     else
      #       if should_be_escaped(c)
      #         literal << sprintf("\\u%04x", c.ord)
      #       else
      #         literal << c
      #       end
      #     end
      #   end

      #   literal << '"'
      #   literal
      # end
    end
  end
end
