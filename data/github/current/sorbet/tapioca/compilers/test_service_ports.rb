# typed: strict
# frozen_string_literal: true

require_relative "../../../test/test_helpers/test_service_ports"

module Tapioca
  module Compilers
    # The TestServicePorts module allows us to reserve a range of ports for
    # various services used in tests.
    #
    # Each of these reserved ranges gets a singleton lookup method dynamically
    # defined on the module. For example, if we reserve the range `:git_http`,
    #
    # ~~~rb
    # TestServicePorts.reserve_range(:git_http)
    # ~~~
    #
    # The following RBI files will be generated:
    #
    # ~~~rb
    # class TestServicePorts
    #   include GeneratedReservedRangeAccessors
    #
    #   module GeneratedReservedRangeAccessors
    #     sig { returns(Integer) }
    #     def git_http_port; end
    #   end
    # end
    # ~~~

    class TestServicePorts < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(::TestServicePorts) } }

      sig { override.returns(T::Enumerable[Module]) }
      def self.gather_constants
        [::TestServicePorts]
      end

      sig { override.void }
      def decorate
        return if constant.reserved_range_names.empty?

        root.create_path(constant) do |namespace|
          namespace.create_module("GeneratedReservedRangeAccessors") do |mod|
            constant.reserved_range_names.each do |name|
              mod.create_method("#{name}_port", return_type: "Integer")
            end
          end

          namespace.create_extend("GeneratedReservedRangeAccessors")
        end
      end
    end
  end
end
