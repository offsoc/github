# frozen_string_literal: true

module GraphQL
  module Pro
    module Access
      module Extensions
        # Extend some built-in types for permissions
        [
          GraphQL::Schema::Field,
          GraphQL::Schema::Argument,
          GraphQL::Schema::EnumValue,
          GraphQL::Schema::Object,
          GraphQL::Schema::Union,
          GraphQL::Schema::Interface,
          GraphQL::Schema::Enum,
          GraphQL::Schema::Scalar,
          GraphQL::Schema::InputObject,
        ].each do |t|
          if t.respond_to?(:accepts_definition)
            t.class_eval do
              accepts_definition :access
              accepts_definition :view
              accepts_definition :authorize
            end
          end
        end

        if ::GraphQL::Schema.respond_to?(:accepts_definition)
          class ::GraphQL::Schema # rubocop:disable Style/ClassAndModuleChildren
            accepts_definition :authorization
          end
        end

        module MutationExtension
          def authorize(config)
            own_access_config[:authorize] = config
          end

          def access(config)
            own_access_config[:access] = config
          end

          def view(config)
            own_access_config[:view] = config
          end

          def field_options
            super.merge(access_config)
          end

          def generate_field
            raise NotImplementedError, "This version of GraphQL-Pro supports GraphQL-Ruby 1.7.x or 1.8.4+"
          end

          private

          def own_access_config
            @own_access_config ||= {}
          end

          def access_config
            inherited_config = superclass.respond_to?(:access_config) ? superclass.access_config : {}
            inherited_config.merge(own_access_config)
          end
        end

        class GraphQL::Schema::Mutation  # rubocop:disable Style/ClassAndModuleChildren
          class << self
            prepend MutationExtension
          end
        end
      end
    end
  end
end
