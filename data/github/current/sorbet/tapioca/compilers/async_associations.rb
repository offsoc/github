# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    # The ApplicationRecord::Base class overrides the various association methods on ActiveRecord::Base
    # in order to have them also generate async_<association_name> versions that return Promises of the
    # regular return type. This is helpful for batching, graphql compatibility, and performance reasons.
    #
    # However, as Sorbet doesn't evaluate the running Ruby process, it has no way to statically determine
    # that these methods should exist and thinks they are missing. This is where RBI files come in.
    #
    # This DSL Compiler detects associations defined in ActiveRecords and generates the expected
    # async versions of their accessor methods.
    #
    # For example, for the following model:
    #
    # ~~~rb
    # class Release < ApplicationRecord::Base
    #   belongs_to :user
    #   has_many :release_assets
    # end
    # ~~~
    #
    # The following RBI files will be generated:
    #
    # ~~~rb
    # class Release
    #   include GeneratedAsyncReflectionAssociations
    #
    #   module GeneratedAsyncReflectionAssociations
    #     sig { returns(Promise) }
    #     def async_user; end
    #
    #     sig { returns(Promise) }
    #     def async_release_assets; end
    #   end
    # end
    # ~~~

    class AsyncAssociations < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(::ApplicationRecord::Base) } }

      sig { override.returns(T::Enumerable[T.class_of(::ApplicationRecord::Base)]) }
      def self.gather_constants
        descendants_of(::ApplicationRecord::Base)
      end

      sig { override.void }
      def decorate
        return if constant.reflections.empty?
        return unless constant.const_defined?(:GeneratedAsyncReflectionAssociations)

        async_module = constant.const_get(:GeneratedAsyncReflectionAssociations)
        async_methods = async_module.instance_methods(false)

        root.create_path(constant) do |model|
          model.create_module("GeneratedAsyncReflectionAssociations") do |mod|
            constant.reflections.each do |name, _reflection|
              method_name = "async_#{name}"
              next unless async_methods.include?(method_name.to_sym)

              mod.create_method(method_name, return_type: "Promise[T.untyped]")
            end
          end

          model.create_include("GeneratedAsyncReflectionAssociations")
        end
      end
    end
  end
end
