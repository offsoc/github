# typed: true
# frozen_string_literal: true

module Tapioca
  module Compilers
    # Workflows generate numerous methods based on the possible states and their events.
    #
    # For example, for the following workflow enabled ActiveRecord:
    #
    # ~~~yml
    # class MyModel < ActiveRecord::Base
    #   include Workflow
    #
    #   workflow :state do
    #     state :created, 0 do
    #       event :start, transitions_to: :started
    #     end
    #   end
    # end
    # ~~~
    #
    # The following RBI files will be generated:
    # class MyModel < ActiveRecord::Base
    #   extend GeneratedWorkflowClassMethods
    #   include GeneratedWorkflowMethods
    #
    #   module GeneratedWorkflowClassMethods
    #     sig { params(val: String).returns(T.untyped) }
    #     def state=(val); end
    #
    #     sig { returns(PrivateRelationWhereChain) }
    #     def with_created_state; end
    #
    #     sig { returns(PrivateRelationWhereChain) }
    #     def without_created_state; end
    #   end
    #
    #   module GeneratedWorkflowMethods
    #     sig { returns(T::Boolean) }
    #     def created?; end
    #
    #     sig { void }
    #     def start!; end
    #
    #     sig { returns(T::Boolean) }
    #     def started?; end
    #
    #     sig { returns(PrivateRelationWhereChain) }
    #     def without_created_state; end
    #   end
    # end
    # ~~~rb
    class Workflow < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(::ApplicationRecord::Base) } }

      sig { override.returns(T::Enumerable[T.class_of(::ApplicationRecord::Base)]) }
      def self.gather_constants
        descendants_of(::ApplicationRecord::Base).select { |klass| klass < ::Workflow }
      end

      sig { override.void }
      def decorate
        return unless constant.respond_to?(:workflow_spec)

        spec = T.cast(constant, ::Workflow::ClassMethods).workflow_spec

        root.create_path(constant) do |model|
          model.create_module("GeneratedWorkflowClassMethods") do |mod|
            mod.create_method("#{T.cast(constant, ::Workflow::ClassMethods).workflow_column}=", parameters: [create_param("val", type: "String")])

            spec.state_names.each do |state|
              create_method("with_#{state}_state", mod, "PrivateRelationWhereChain")
              create_method("without_#{state}_state", mod, "PrivateRelationWhereChain")
            end
          end

          model.create_module("GeneratedWorkflowMethods") do |mod|
            spec.states.values.each do |state|
              create_instance_method("without_#{state.name}_state", mod, "PrivateRelationWhereChain")
              create_instance_method("#{state.name}?", mod, "T::Boolean")

              state.events.each_key do |event_name|
                create_instance_method("#{event_name}!", mod, "void")
                create_instance_method("can_#{event_name}?", mod, "T::Boolean")
              end
            end
          end

          model.create_extend("GeneratedWorkflowClassMethods")
          model.create_include("GeneratedWorkflowMethods")

          model.create_class("PrivateRelation", superclass_name: "::ActiveRecord::Relation") do |kls|
            kls.create_include("GeneratedWorkflowClassMethods")
          end

          model.create_class("PrivateCollectionProxy",
            superclass_name: "::ActiveRecord::Associations::CollectionProxy",
          ) do |kls|
            kls.create_include("GeneratedWorkflowClassMethods")
          end

          model.create_class("PrivateAssocationRelation",
            superclass_name: "::ActiveRecord::AssociationRelation",
          ) do |kls|
            kls.create_include("GeneratedWorkflowClassMethods")
          end
        end
      end

      private

      def create_instance_method(method_name, mod, return_type)
        return unless constant.instance_methods.include?(method_name.to_sym)

        mod.create_method(method_name, return_type: return_type)
      end

      def create_method(method_name, mod, return_type)
        return unless constant.methods.include?(method_name.to_sym)

        mod.create_method(method_name, return_type: return_type)
      end
    end

  end
end
