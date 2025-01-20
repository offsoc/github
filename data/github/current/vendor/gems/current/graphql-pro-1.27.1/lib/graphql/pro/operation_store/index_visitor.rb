# frozen_string_literal: true
require "set"

module GraphQL
  module Pro
    class OperationStore
      # Find references in the document and accumulate them in a set.
      # Then, set members will be joined to the operation record.
      #
      # - [x] owners of fields
      # - [x] return types of fields
      # - [x] interface possible types
      # - [x] enum values
      # - [x] arguments
      # - [x] inputobject fields
      # - [x] inline fragment references
      # - [x] fragment defn references
      # - [x] variable definition references
      #
      # @api private
      module IndexVisitor
        def initialize(document, context)
          super
          @context = context
          @query = context.query
          @entries = @query.context[:index_entries] = Set.new
          # Before `context` was added as a param:
          @legacy_get_argument = GraphQL::Schema::Member::HasArguments.instance_method(:get_argument).arity == 1
        end

        def on_fragment_definition(node, parent)
          @entries << node.type.name
          super
        end

        def on_variable_definition(node, parent)
          type = node.type
          while type.respond_to?(:of_type)
            type = type.of_type
          end
          @entries << type.name
          super
        end

        def on_field(node, parent)
          each_field do |owner, field|
            @entries << "#{owner.graphql_name}.#{field.graphql_name}"
            @entries << "#{owner.graphql_name}"
            @entries << field.type.unwrap.graphql_name
          end
          super
        end

        def on_inline_fragment(node, parent)
          @entries << node.type.name
          super
        end

        def on_argument(node, parent)
          arg_name = node.name
          each_field do |owner, field|

            if field
              @entries << "#{owner.graphql_name}.#{field.graphql_name}.#{arg_name}"
              defn = @legacy_get_argument ? field.get_argument(arg_name) : field.get_argument(arg_name, @query.context)
            else
              # it's an input object
              @entries << "#{owner.graphql_name}.#{arg_name}"
              defn = @legacy_get_argument ? owner.get_argument(arg_name) : owner.get_argument(arg_name, @query.context)
            end

            if defn # Maybe a typo :S
              arg_type = defn.type.unwrap
              @entries << arg_type.graphql_name
              if arg_type.kind.enum?
                vals = Array(node.value)
                vals.each do |val|
                  @entries << "#{arg_type.graphql_name}.#{val.name}"
                end
              end
            end
          end
          super
        end

        def index_type(node, parent)
          @entries << node.name
          super
        end

        # Call the block zero or more times
        # for each possible field at this point
        #
        # Including input fields
        def each_field
          input_object_arg = @context.argument_definition
          if input_object_arg
            yield(input_object_arg.type.unwrap, nil)
          else
            field = @context.field_definition
            if field
              owner = @context.parent_type_definition.unwrap
              all_owners = @context.schema.possible_types(owner)
              if !all_owners.include?(owner)
                all_owners += [owner]
              end
              all_owners.each do |owner_type|
                yield(owner_type, field)
              end
            end
          end
        end
      end
    end
  end
end
