# frozen_string_literal: true

module GraphQL
  module Pro
    module CanCanIntegration
      class CanCanIntegrationError < GraphQL::Error
      end

      class ActionNotConfiguredError < CanCanIntegrationError
        def initialize(owner, object)
          message = <<-ERR
Couldn't authorize #{object.inspect} (#{object.class.name}) because
#{owner.inspect} doesn't have a configured `can_can_action`. Either:

- Configure an action, for example `can_can_action(:read)`; OR
- Opt out of authorization with `can_can_action(nil)`
ERR
          super(message)
        end
      end

      module ObjectIntegration
        def self.included(obj_class)
          obj_class.extend(HasCanCanAction)
          obj_class.extend(AuthorizeByAction)
          obj_class.extend(ScopeByAccessibleBy)
        end
      end

      module UnionIntegration
        def self.included(union_class)
          union_class.extend(HasCanCanAction)
          union_class.extend(ScopeByAccessibleBy)
        end
      end

      module InterfaceIntegration
        def self.included(interface_module)
          interface_module.definition_methods do
            include(HasCanCanAction)
            include(ScopeByAccessibleBy)
          end
        end
      end

      module FieldIntegration
        def self.included(field_class)
          field_class.extend(HasCanCanAction)
          field_class.include(HasCanCanAction)
          field_class.include(AuthorizeByAction)
        end
      end

      module ArgumentIntegration
        def self.included(arg_class)
          arg_class.extend(HasCanCanAction)
          arg_class.include(HasCanCanAction)
          arg_class.include(AuthorizeByAction)
          arg_class.include(AuthorizeArgumentByAction)
        end
        # TODO upstream
        attr_reader :default_value
      end

      module ResolverIntegration
        def self.included(resolver_class)
          resolver_class.extend(HasCanCanAction)
          resolver_class.include(HasCanCanAction)
          resolver_class.include(AuthorizeResolverByAction)
        end
      end

      MutationIntegration = ResolverIntegration

      module AuthorizeArgumentByAction
        def authorized_as_type?(object, value, ctx, as_type:)
          if as_type.non_null?
            as_type = as_type.of_type
          end

          auth_subject = if object.is_a?(GraphQL::Schema::Resolver) && (self.loads || value.is_a?(GraphQL::Schema::InputObject))
            value # A loaded value
          else
            object
          end

          authed_by_action = authorized_by_can_can_action?(auth_subject, ctx)
          authed = authed_by_action && super

          if authed
            true
          elsif self.owner.is_a?(Class) && self.owner < GraphQL::Schema::Mutation && object.is_a?(self.owner)
            # Call the mutation's `unauthorized_by_can_can` hook if this argument belongs to a mutation directly
            [false, object.unauthorized_by_can_can(self, value)]
          else
            false
          end
        end
      end

      module HasCanCanAction
        NO_ACTION = Object.new

        def initialize(*args, can_can_action: NO_ACTION, can_can_subject: NO_ACTION, can_can_attribute: NO_ACTION, **kwargs, &block)
          if can_can_action != NO_ACTION
            self.can_can_action(can_can_action)
          end

          if can_can_subject != NO_ACTION
            self.can_can_subject(can_can_subject)
          end

          if can_can_attribute != NO_ACTION
            self.can_can_attribute(can_can_attribute)
          end
          super(*args, **kwargs, &block)
        end

        READING_ACTION = Object.new
        # Get or set the action for this part of the schema
        # @param new_action [Symbol, nil] If provided, set the action for this part of the schema
        # @param [Symbol, nil] The configured action
        def can_can_action(new_action = READING_ACTION)
          if new_action != READING_ACTION
            @can_can_action = new_action
          elsif defined?(@can_can_action)
            @can_can_action
          elsif self.is_a?(Class) && superclass.respond_to?(:can_can_action)
            superclass.can_can_action
          elsif self.class.respond_to?(:can_can_action)
            self.class.can_can_action
          else
            false # Shows that it was never set
          end
        end

        # Get or set the attribute for this part of the schema
        # @param new_attribute [Symbol, nil] If provided, set the attribute for this part of the schema
        # @param [Symbol, nil] The configured attribute
        def can_can_attribute(new_attribute = READING_ACTION)
          if new_attribute != READING_ACTION
            @can_can_attribute = new_attribute
          elsif defined?(@can_can_attribute)
            @can_can_attribute
          elsif self.is_a?(Class) && superclass.respond_to?(:can_can_attribute)
            superclass.can_can_attribute
          elsif self.class.respond_to?(:can_can_attribute)
            self.class.can_can_attribute
          else
            false # Shows that it was never set
          end
        end

        # Get or set an override `subject` for CanCan (instead of `object`)
        #
        # A setting of `false` will be ignored.
        #
        # @param new_subject [Object] Something to use instead of `object` when authorizing
        # @return [Object] The configured override, or `false` if nothing was set
        def can_can_subject(new_subject = READING_ACTION)
          if new_subject != READING_ACTION
            @can_can_subject = new_subject
          elsif defined?(@can_can_subject)
            @can_can_subject
          elsif self.is_a?(Class) && superclass.respond_to?(:can_can_subject)
            superclass.can_can_subject
          elsif self.class.respond_to?(:can_can_subject)
            self.class.can_can_subject
          else
            false # this shows it was unset.
          end
        end

        def authorized_by_can_can_action?(object, context)
          subject = can_can_subject
          if subject == false
            subject = object
          end

          if subject.nil?
            # `nil`s are always visible
            # (this can happen for root types and argument values)
            return true
          end

          action = can_can_action
          if action == false
            raise ActionNotConfiguredError.new(self, object)
          elsif action.nil?
            # Opted out, don't apply
            true
          else
            # Make an instance if it isn't already set
            ability = get_can_can_ability(context)
            attribute = can_can_attribute

            # Check the ability + action for this subject
            if attribute
              ability.can?(action, subject, attribute)
            else
              ability.can?(action, subject)
            end
          end
        end

        def get_can_can_ability(context)
          if context.respond_to?(:can_can_ability)
            context.can_can_ability
          else
            context[:can_can_ability] ||= ::Ability.new(context[:current_user])
          end
        end
      end

      module AuthorizeByAction
        def authorized?(object, args_or_ctx, context = nil)
          if context.nil?
            context = args_or_ctx
            super(object, context) && authorized_by_can_can_action?(object, context)
          else
            args = args_or_ctx
            auth_subject = if object.is_a?(GraphQL::Schema::Resolver) && (self.loads || args.is_a?(GraphQL::Schema::InputObject))
              args # A loaded value
            else
              object
            end
            if self.is_a?(GraphQL::Schema::Argument) && self.respond_to?(:authorized_as_type?)
              # This will hit `authorized_as_type?`
              super(object, args, context)
            else
              super(object, args, context) && authorized_by_can_can_action?(auth_subject, context)
            end
          end
        end
      end

      module ScopeByAccessibleBy
        def scope_items(items, context)
          scoped = super(items, context)
          if scoped.is_a?(ActiveRecord::Relation)
            # Make an instance if it isn't already set
            ability = get_can_can_ability(context)
            action = can_can_action
            if action == false
              raise ActionNotConfiguredError.new(self, items)
            elsif action == nil
              # Opted out
              items
            else
              scoped.accessible_by(ability, action)
            end
          else
            scoped.select { |i| authorized_by_can_can_action?(i, context) }
          end
        end
      end

      module AuthorizeResolverByAction
        def ready?(**inputs)
          super && if authorized_by_can_can_action?(self, context)
            true
          else
            return false, unauthorized_by_can_can(self.class, self)
          end
        end

        def unauthorized_by_can_can(owner, value)
          raise GraphQL::UnauthorizedError.new(object: value, type: owner, context: context)
        end
      end
    end
  end
end
