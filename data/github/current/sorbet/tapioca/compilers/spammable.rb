# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    class Spammable < Tapioca::Dsl::Compiler

      extend T::Sig

      ConstantType = type_member { { fixed: T.all(Module, ::Spam::Spammable::ClassMethods) } }

      sig { override.returns(T::Array[T::Class[T.anything]]) }
      def self.gather_constants
        Spam::Spammable.tables_classes_including.values
      end

      sig { override.void }
      def decorate
        root.create_path(constant) do |model|
          model.create_module("GeneratedSpammableMethods") do |mod|
            mod.create_method("spammy?", return_type: "T::Boolean")
            mod.create_method("user_association_for_spammy", return_type: "Symbol")
            mod.create_method("user_authored_content?", parameters: [create_param("viewer", type: "User")], return_type: "T::Boolean")
            mod.create_method("async_hide_from_user?", parameters: [create_param("viewer", type: "User")], return_type: "Promise[T::Boolean]")
            mod.create_method("hide_from_user?", parameters: [create_param("viewer", type: "User")], return_type: "T::Boolean")
            mod.create_method("set_user_hidden", return_type: "Integer")
          end

          model.create_module("GeneratedSpammableClassMethods") do |mod|
            mod.create_method("spammable_user_foreign_key", return_type: "Symbol")
          end

          model.create_include("GeneratedSpammableMethods")
          model.create_extend("GeneratedSpammableClassMethods")
        end
      end
    end
  end
end
