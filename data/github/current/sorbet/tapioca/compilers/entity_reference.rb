# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    # The #entity_reference method exists to help migrate an existing ActiveRecord Association to a Prelude batched
    # method that preloads its data through a public domain interface method. As a result, the return type of the
    # association accessor typically changes from an instance of an ActiveRecord model to a public interface exposed
    # by the domain.
    #
    # Example:
    # ~~~rb
    # class Issue < ApplicationRecord::Base
    #   belongs_to_repository_via_domain
    # end
    # ~~~
    #
    # Generates the following RBI file:
    #
    # ~~~rb
    # class Issue
    #   include GeneratedEntityReferenceMethods
    #
    #   module GeneratedEntityReferenceMethods
    #     sig { returns(Repositories::IRepository) }
    #     def repository; end
    #   end
    # end
    # ~~~

    class EntityReference < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(::GH::Associations::BatchMethodAdapters) } }

      sig { returns(String) }
      def self.name
        # this name needs to sort after "Tapioca::Dsl::Compilers::ActiveRecordAssociations" since #entity_reference
        # may patch and optionally change the return values of association methods
        "Tapioca::Patch::Compilers::EntityReference"
      end

      sig { override.returns(T::Enumerable[Module]) }
      def self.gather_constants
        all_classes.select { |c| c < ::GH::Associations::BatchMethodAdapters }
      end

      sig { override.void }
      def decorate
        return if T.cast(constant, ::GH::Associations::BatchMethodAdapters::ClassMethods).entity_reference_return_types.empty?

        root.create_path(constant) do |model|
          model.create_module("GeneratedEntityReferenceMethods") do |mod|
            T.cast(constant, ::GH::Associations::BatchMethodAdapters::ClassMethods).entity_reference_return_types.each do |name, return_type|
              mod.create_method(name.to_s, return_type: return_type || "T.untyped")
            end
          end

          model.create_include("GeneratedEntityReferenceMethods")
        end
      end
    end
  end
end
