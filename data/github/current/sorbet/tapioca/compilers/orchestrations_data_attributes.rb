# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    # Orchestrations contain a generic and nested JSON column named `data`. In an attempt to add some
    # type safety to this, a DSL can be included to automatically add ActiveRecord style methods.
    #
    # For example, for the following model:
    #
    # ~~~rb
    # class PullRequestDeleteOrchestration < PullRequestOrchestration
    #   data :reason, String
    # end
    # ~~~
    #
    # The following RBI files will be generated:
    #
    # ~~~rb
    # class PullRequestDeleteOrchestration
    #   include GeneratedOrchestrationsDataAccessors
    #
    #   module GeneratedOrchestrationsDataAccessors
    #     sig { returns(String) }
    #     def reason; end
    #
    #     sig { params(value: String).returns(String) }
    #     def reason=(arg0); end
    #   end
    # end
    # ~~~
    class OrchestrationsDataAttributes < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.all(Module, ::PullRequests::Orchestrations::DataAttributes::ClassMethods) } }

      sig { override.returns(T::Array[T::Class[T.anything]]) }
      def self.gather_constants
        descendants_of(::ApplicationRecord::Base).select { |klass| klass < PullRequests::Orchestrations::DataAttributes }
      end

      sig { override.void }
      def decorate
        return if constant.data_attributes.empty?

        root.create_path(constant) do |model|
          model.create_module("GeneratedOrchestrationsDataAccessors") do |mod|
            constant.data_attributes.each do |name, attribute|
              return_type = attribute.klass.to_s
              return_type = "T::Boolean" if return_type == PullRequests::Orchestrations::DataAttributes::Types::Boolean.name
              return_type = as_nilable_type(return_type) if !attribute.required?
              mod.create_method(name.to_s, return_type:, visibility: RBI::Private.new)
              mod.create_method("#{name}=", return_type:, parameters: [create_param("value", type: return_type)], visibility: RBI::Private.new)
            end
          end

          model.create_include("GeneratedOrchestrationsDataAccessors")
        end
      end
    end
  end
end
