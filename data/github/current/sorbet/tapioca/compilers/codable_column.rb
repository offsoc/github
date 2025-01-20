# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    # ActiveRecord models can define custom column coders for serializing and deserializing data to and
    # from the database. This is useful for columns that store complex data structures or need to
    # perform custom serialization.
    #
    # These coders define data accessor methods that the models delegate to the coder class.
    #
    # This compiler generates RBI files for these data accessor methods declared in the coder.
    #
    # For example, for the following model:
    #
    # ~~~rb
    # class Coders::OauthAccessCoder < Coders::Base
    #   data_accessors :note
    # end
    #
    # class OauthAccess < ApplicationRecord::Base
    #   include Coders::ColumnCoder
    #   serialize_with_coder :data, Coders::OauthAccessCoder
    # end
    # ~~~
    #
    # The following RBI files will be generated:
    #
    # ~~~rb
    # class OauthAccess
    #   include GeneratedCoderAccessors
    #
    #   module GeneratedCoderAccessors
    #     sig { returns(T.untyped) }
    #     def note; end
    #
    #     sig { returns(T.untyped) }
    #     def note?; end
    #
    #     sig { params(value: T.untyped).void }
    #     def note=(arg0); end
    #   end
    # end
    # ~~~

    class CodableColumn < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.all(Module, ::Coders::CodableColumn::ClassMethods) } }

      sig { override.returns(T::Array[T::Class[T.anything]]) }
      def self.gather_constants
        descendants_of(::ApplicationRecord::Base).select { |klass| klass < Coders::CodableColumn }
      end

      sig { override.void }
      def decorate
        return if constant.enabled_coders.empty?
        # return unless constant.const_defined?(:GeneratedColumnCoderAccessors)

        root.create_path(constant) do |model|
          model.create_module("GeneratedColumnCoderAccessors") do |mod|
            constant.enabled_coders.values.each do |handler|
              handler.send(:coder).members.each do |member|
                case member.to_s.last
                when "?"
                  mod.create_method(member, return_type: "T::Boolean")
                when "="
                  mod.create_method(member, parameters: [create_param("value", type: "T.untyped")], return_type: "T.untyped")
                else
                  mod.create_method(member, return_type: "T.untyped")
                end
              end
            end
          end

          model.create_include("GeneratedColumnCoderAccessors")
        end
      end
    end
  end
end
