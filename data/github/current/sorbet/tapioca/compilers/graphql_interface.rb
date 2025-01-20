# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    # GraphQL interfaces are dynamically extended to include a number of methods defined in
    # their ancestry's DefinitionMethods modules. This compiler generates RBI files to make
    # this explicit.
    # This Compiler affects all modules defined in Platform::Interfaces.
    #
    # ~~~rb
    # module Platform
    #   module Interfaces
    #     module Billable
    #       include Platform::Interfaces::Base
    #       # etc...
    #     end
    #   end
    # end
    # ~~~
    #
    # The following RBI files will be generated:
    #
    # ~~~rb
    # module Platform::Interfaces::Billable
    #   extend GraphQL::Schema::Interface::DefinitionMethods
    #   extend Platform::Interfaces::Base::BaseDefinitionMethods
    # end
    # ~~~

    class GraphqlInterface < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: Module } }

      sig { override.returns(T::Array[Module]) }
      def self.gather_constants
        interfaces(Platform::Interfaces)
      end

      sig { override.void }
      def decorate
        root.create_path(constant) do |model|
          model.create_extend("GraphQL::Schema::Interface::DefinitionMethods")
          model.create_extend("Platform::Interfaces::Base::BaseDefinitionMethods")
        end
      end

      sig { params(mod: Module).returns(T::Array[Module]) }
      def self.interfaces(mod)
        interface_list = T.let([], T::Array[Module])
        interface_list << mod if mod.ancestors.include?(GraphQL::Schema::Interface)

        values = mod.constants.map { |c| mod.const_get(c) }
        values.each do |v|
          next unless v.is_a?(Module)
          interface_list += interfaces(v)
        end

        interface_list
      end
    end
  end
end
