# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    class UserProfile < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(User) } }

      sig { override.returns(T::Array[T.class_of(User)]) }
      def self.gather_constants
        [User]
      end

      sig { override.void }
      def decorate
        root.create_path(constant) do |model|
          model.create_module("GeneratedUserProfileMethods") do |mod|
            User::PROFILE_ATTRIBUTES.each do |attr|
              mod.create_method("profile_#{attr}", return_type: "T.untyped")
              mod.create_method("profile_#{attr}=", parameters: [create_param(attr, type: "T.untyped")], return_type: "T.untyped")
            end

            User::PROFILE_HTML_ATTRIBUTES.each do |attr, _|
              mod.create_method("profile_#{attr}_html", return_type: "String")
              mod.create_method("async_profile_#{attr}_html", return_type: "String")
            end
          end

          model.create_include("GeneratedUserProfileMethods")
        end
      end
    end
  end
end
