# frozen_string_literal: true

module GraphQL
  module Pro
    module PunditIntegration
      # Base error class for everything from this integration
      class PunditIntegrationError < GraphQL::Error
      end

      # Raised when we try to check something that has no `pundit_role` configured
      class RoleNotConfiguredError < PunditIntegrationError
      end

      # Raised when Pundit can't find a Policy for an object
      class PolicyNotFoundError < PunditIntegrationError
        def initialize(owner, object, pundit_error)
          graphql_category = if owner.is_a?(Module)
            "Type"
          else
            owner.class
          end
          required_pundit_class = "policy"
          array_msg = if object.is_a?(Array)
            if pundit_error.message.include?("uninitialized constant") && pundit_error.message.include?("::Scope")
              required_pundit_class = "scope"
              <<-MSG

This policy needs a nested `Scope` class. Define `#{pundit_error.name}` as a Pundit scope class: https://github.com/varvet/pundit#scopes

Or, skip scoping by adding `scope: false` to the field definition.

MSG
            else
              <<-MSG

Since this value is an **Array**, Pundit can't find a scope for it. To fix this:

- Configure a policy class with `pundit_policy_class` in the definition for `#{owner.path}`
- Or, skip scoping by adding `scope: false` to the field definition

MSG
            end
          else
            "\n"
          end

          super <<-MSG
No #{required_pundit_class} found for:

- #{graphql_category}: #{owner.path}
- Runtime value: `#{object.inspect}`
#{array_msg}
Pundit error: #{pundit_error.class}, #{pundit_error.message}
MSG
        end
      end

      # Include this in your base object to configure `pundit_role`s at object-level
      module ObjectIntegration
        def self.included(object_class)
          object_class.extend(HasPunditRole)
          object_class.extend(AuthorizeByPolicy)
          object_class.extend(ScopeByPolicy)
        end
      end

      # Include this in your base Union class to get scoping for
      # lists and connections of union type.
      module UnionIntegration
        def self.included(union_class)
          # Just for `.path` ?
          union_class.extend(HasPunditRole)
          union_class.extend(ScopeByPolicy)
        end
      end

      # Include this in your base interface module to get scoping for
      # lists and connections of interface type.
      module InterfaceIntegration
        def self.included(interface_module)
          interface_module.definition_methods do
            # Just for `.path` ?
            include(HasPunditRole)
            include(ScopeByPolicy)
          end
        end
      end

      # Include this in your base field to configure `pundit_role`
      # at class-level or as a per-field option
      module FieldIntegration
        def self.included(field_class)
          field_class.include(HasPunditRoleKeyword)
          field_class.include(HasPunditRole)
          field_class.include(AuthorizeByPolicy)
          field_class.extend(HasPunditRole)
          field_class.extend(AuthorizeByPolicy)
        end
      end

      # Include this in your base argument to configure `pundit_role`
      # at class-level or as a per-argument option
      module ArgumentIntegration
        def self.included(argument_class)
          argument_class.include(HasPunditRoleKeyword)
          argument_class.include(HasPunditRole)
          argument_class.include(AuthorizeByPolicy)
          argument_class.include(AuthorizeArgumentByPolicy)
          argument_class.extend(HasPunditRole)
          argument_class.extend(AuthorizeByPolicy)
        end

        # TODO upstream
        attr_reader :default_value
      end

      # Include this in your base mutation to add a mutation-level check
      # and add `pundit_role:` configurations to loaded objects
      module ResolverIntegration
        def self.included(mutation_class)
          mutation_class.extend(HasPunditRole)
          mutation_class.include(HasPunditRole)
          mutation_class.include(AuthorizeMutationByPolicy)
        end
      end

      MutationIntegration = ResolverIntegration

      # Leverage the integration for `authorized?`
      module AuthorizeByPolicy
        def authorized?(object, args_or_ctx, context = nil)
          if context.nil?
            # This is for <1.10, or object authorization hooks
            context = args_or_ctx
            super(object, context) && authorized_by_policy?(object, context)
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
              super(object, args, context) && authorized_by_policy?(auth_subject, context)
            end
          end
        end
      end

      module AuthorizeArgumentByPolicy
        def authorized_as_type?(object, value, ctx, as_type:)
          if as_type.non_null?
            as_type = as_type.of_type
          end

          auth_subject = if object.is_a?(GraphQL::Schema::Resolver) && (self.loads || value.is_a?(GraphQL::Schema::InputObject))
            value # A loaded value
          else
            object
          end

          authed_by_policy = authorized_by_policy?(auth_subject, ctx)
          authed = authed_by_policy && super

          if authed
            true
          elsif self.owner.is_a?(Class) && self.owner < GraphQL::Schema::Mutation && object.is_a?(self.owner)
            # Call the mutation's `unauthorized_by_pundit` hook if this argument belongs to a mutation directly
            unauth_result = object.unauthorized_by_pundit(self, value)
            case unauth_result
            when false, true, nil
              unauth_result
            when Array
              if unauth_result.first == false
                # It's already a compound response with
                # an instruction to halt and errors as data
                unauth_result
              else
                # Maybe it's an array of errors:
                [false, unauth_result]
              end
            else
              # It's some object ot be errors-as-data
              [false, unauth_result]
            end
          else
            false
          end
        end
      end

      # Leverage the integration for list scoping
      module ScopeByPolicy
        def scope_items(items, context)
          scoped = super(items, context)
          scope_by_pundit_policy(context, scoped)
        end

        # Fetch a Pundit policy scope and apply it to `items`.
        # It should raise if a policy can't be found for `items`.
        #
        # @param context [GraphQL::Query::Context]
        # @param items [Object] A collection returned by the application, eg `ActiveRecord::Relation`
        # @return [Object] A scoped list derived from `items` for `current_user`
        # @raise [PolicyNotFoundError] If no policy is found (this is a developer error)
        def scope_by_pundit_policy(context, items)
          current_user = get_current_user(context)
          # Pundit will raise if the scope is missing.
          # This calls `resolve` on the scope.
          if (custom_class = pundit_policy_class)
            # Imitate `Pundit.policy_scope!`:
            begin
              scope_class = custom_class::Scope
            rescue NameError => err
              raise PolicyNotFoundError.new(self, items, err)
            end
            scope_instance = scope_class.new(current_user, items)
            scope_instance.resolve
          else
            Pundit.policy_scope!(current_user, items)
          end
        rescue Pundit::NotDefinedError => err
          raise PolicyNotFoundError.new(self, items, err)
        end
      end

      module AuthorizeMutationByPolicy
        # Check the policy defined on the mutation class before loading arguments
        def ready?(**inputs)
          super && if authorized_by_policy?(self, context)
            true
          else
            return false, unauthorized_by_pundit(self.class, self)
          end
        end

        def inspect
          "mutation #{self.class.graphql_name}"
        end

        # This hook is called when a check fails
        def unauthorized_by_pundit(owner, value)
          raise GraphQL::UnauthorizedError.new(object: value, type: owner, context: context)
        end
      end

      # For Arguments and Fields, their instances store a pundit_role
      module HasPunditRoleKeyword
        NO_ROLE = Object.new

        def initialize(*args, pundit_role: NO_ROLE, pundit_policy_class: NO_ROLE, **kwargs, &block)
          if pundit_role != NO_ROLE
            self.pundit_role(pundit_role)
          end

          if pundit_policy_class != NO_ROLE
            self.pundit_policy_class(pundit_policy_class)
          end

          super(*args, **kwargs, &block)
        end
      end

      # Accept the configuration of a pundit role,
      # expose a hook to call that role on some object.
      module HasPunditRole
        READING_ROLE = Object.new

        # @param new_role [Symbol] set a role for this object
        # @return [false] If no role was configured
        # @return [Symbol] the role that was configured
        def pundit_role(new_role = READING_ROLE)
          if new_role != READING_ROLE
            @pundit_role = new_role
          elsif defined?(@pundit_role)
            @pundit_role
          elsif self.is_a?(Class) && superclass.respond_to?(:pundit_role)
            superclass.pundit_role
          elsif self.use_owner_role? && defined?(@owner) && @owner.respond_to?(:pundit_role)
            @owner.pundit_role
          elsif self.class.respond_to?(:pundit_role)
            self.class.pundit_role
          else
            false
          end
        end

        # @return [Boolean] If true, inherit `pundit_role`
        #   from this object's owner instead of from its class.
        def use_owner_role?
          if defined?(@use_owner_role)
            @use_owner_role
          elsif self.class.respond_to?(:use_owner_role?)
            self.class.use_owner_role?
          else
            false
          end
        end

        # Set `use_owner_role(true)` in Field or Argument classes
        # to modify the lookup algorithm for `pundit_role`.
        #
        # By default, Field and Argument instances check their class to
        # get a default role. This setting changes that lookup to get one
        # from the "owner" (for Fields, the Object or Interface type is the owner;
        # for Arguments, the Field or Input Object type is the owner). Using the
        # owner role makes the lookup algorithm match `pundit_policy_class`.
        #
        # @param new_value [Boolean]
        def use_owner_role(new_value)
          @use_owner_role = new_value
        end

        # Override this method to pick a method for authorization checks at runtime.
        # (Defaults to {#pundit_role}.)
        # @param object [Object] The application object being used by GraphQL
        # @param context [GraphQL::Query::Context]
        # @return [Symbol, nil] The method to use on the policy class (a `?` will be added to it)
        def pundit_role_for(object, context)
          pundit_role
        end

        # @param new_class [String, Class] the Pundit policy class to use
        # @return [String, Class, nil] The configured class or name, if there is one
        def pundit_policy_class(new_class = READING_ROLE)
          class_or_string_or_nil = if new_class != READING_ROLE
            @pundit_policy_class = new_class
          elsif defined?(@pundit_policy_class)
            @pundit_policy_class
          elsif respond_to?(:superclass) && superclass.respond_to?(:pundit_policy_class)
            # Find an inherited policy class, or this will return `nil`
            superclass.pundit_policy_class
          elsif defined?(@owner) && @owner.respond_to?(:pundit_policy_class)
            @owner.pundit_policy_class
          elsif self.class.respond_to?(:pundit_policy_class)
            # Mutation instances get the configuration from their classes
            self.class.pundit_policy_class
          else
            # Let `Pundit.policy!` find the class
            nil
          end
          if class_or_string_or_nil.is_a?(String)
            Object.const_get(class_or_string_or_nil)
          else
            class_or_string_or_nil
          end
        end

        # Override this method to pick a pundit policy class at runtime.
        # (Defaults to {#pundit_policy_class}.)
        # @param object [Object] The application object being used by GraphQL
        # @param context [GraphQL::Query::Context]
        # @return [Class, nil] The class to use for the current object and context
        def pundit_policy_class_for(object, context)
          pundit_policy_class
        end

        # Look up a pundit policy for `object`, with `current_user`.
        #
        # If this method doesn't return a policy, it should raise an error,
        # because the caller is assuming that a policy will be returned.
        #
        # @param context [GraphQL::Query::Context]
        # @param object [Object] the application object being authorized
        # @return [Object] A policy instance, which will receive `#{role}?` to perform a check
        # @raise [PolicyNotFoundError] if no policy is found
        def pundit_policy(context, object)
          current_user = get_current_user(context)
          # Make sure that policy was found, pundit will re-raise
          if (policy_cls = pundit_policy_class_for(object, context))
            policy_cls.new(current_user, object)
          else
            Pundit.policy!(current_user, object)
          end
        rescue Pundit::NotDefinedError => err
          raise PolicyNotFoundError.new(self, object, err)
        end

        # @param object [Object] some application object
        # @param context [Query::Context] the current query context (with `:current_user`)
        # @return [Boolean] True if authorized
        # @raise [RoleNotConfiguredError] if no pundit_role was configured
        # @raise [PolicyNotFoundError] if no policy could be found for `object`
        def authorized_by_policy?(object, context)
          # See if this object has a role to authorize with.
          # This'll raise unless some value has been given.
          role = pundit_role_for(object, context)
          case role
          when nil
            # This was explicitly opted out with `pundit_role nil`
            true
          when false
            # No role was ever set
            raise RoleNotConfiguredError, "No role was configured for `#{self.inspect}` (#{path}) (while authorizing #{object.inspect})"
          else
            policy = pundit_policy(context, object)
            policy.public_send("#{role}?")
          end
        end

        # TODO use upstreamed version after 1.9+ is required
        def path
          path_str = if self.respond_to?(:graphql_name)
            self.graphql_name
          elsif self.class.respond_to?(:graphql_name)
            self.class.graphql_name
          else
            self.class.name # mutations
          end
          if self.respond_to?(:owner)
            path_str = "#{self.owner.graphql_name}.#{path_str}"
            if self.owner.respond_to?(:owner)
              path_str = "#{self.owner.owner.graphql_name}.#{path_str}"
            end
          end
          path_str
        end

        private

        def get_current_user(context)
          if context.respond_to?(:pundit_user)
            context.pundit_user
          else
            context[:current_user]
          end
        end
      end
    end
  end
end
