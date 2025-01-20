# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    class MagicShell < Tapioca::Dsl::Compiler

      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(::MagicShell) } }

      sig { override.returns(T::Enumerable[Module]) }
      def self.gather_constants
        [::MagicShell]
      end

      sig { override.void }
      def decorate
        root.create_path(constant) do |model|
          constant.data_delegations.each do |method_name, strategy_klass|
            model.create_method(method_name, return_type: "T.nilable(#{strategy_klass.data_type})")
          end
        end
      end
    end
  end
end
