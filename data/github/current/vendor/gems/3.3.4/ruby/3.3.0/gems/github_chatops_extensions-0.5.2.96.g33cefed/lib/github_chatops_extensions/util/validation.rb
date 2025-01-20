# frozen_string_literal: true

module GitHubChatopsExtensions
  module Util
    class Validation
      class ValidationError < StandardError; end

      # NOTE: This method is borrowed from entitlements-app.
      # Given a hash, validate options for correct data type and presence of required attributes.
      #
      # spec - A Hash with the specification (see contract)
      # data - A Hash with the actual options to test
      # text - A description of the thing being validated, to print in error messages
      #
      # Returns nothing but may raise error.
      def self.validate_attr!(spec, data, text)
        spec.each do |attr_name, config|
          # Raise if required attribute is not present.
          if config[:required] && !data.key?(attr_name)
            raise ValidationError, "#{text} is missing attribute #{attr_name}!"
          end

          # Skip the rest if the attribute isn't defined. (By the point the attribute is either
          # present or it's optional.)
          next unless data.key?(attr_name)

          # Make sure the attribute has the proper data type. Return when a match occurs.
          next if [config[:type]].flatten.any? { |type| data[attr_name].is_a?(type) }
          existing = data[attr_name].class.to_s
          expected = [config[:type]].flatten.map(&:to_s).join(" or ")
          raise ValidationError, "#{text} attribute #{attr_name.inspect} is supposed to be #{expected}, not #{existing}!"
        end

        extra_keys = data.keys - spec.keys
        if extra_keys.any?
          extra_keys_text = extra_keys.join(", ")
          raise ValidationError, "#{text} contains unknown attribute(s): #{extra_keys_text}"
        end

        nil
      end
    end
  end
end
