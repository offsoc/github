# frozen_string_literal: true
module GraphQL
  module Pro
    class Repository
      # Gather some metrics about the repository:
      # - [x] How much is each field used?
      # - [ ] How much is each argument used?
      # - [x] How much is each fragment used?
      # - [ ] How much is each type used? (incl. input types)
      # - [ ] Trace variable usages
      class UsageVisitor
        attr_reader :field_usages, :fragment_usages

        def initialize(schema, visitor, type_stack)
          @field_usages = Hash.new { |h1, k1| h1[k1] = Hash.new { |h2, k2| h2[k2] = FieldUsage.new(owner: k1, field: k2) } }
          @fragment_usages = Hash.new { |h, k| h[k] = { usages: [], definition: nil } }
          current_definition = nil

          # Ensure unused fields are present:
          # TODO instrumentation could change the names etc
          schema.types.each do |t_name, t|
            if !t.introspection? && t.kind.fields?
              t.all_fields.each do |f|
                @field_usages[t][f]
              end
            end
          end

          visitor[GraphQL::Language::Nodes::Field].enter << ->(node, _parent) {
            owner_type = type_stack.object_types[-2].unwrap
            field_defn = type_stack.field_definitions.last
            @field_usages[owner_type][field_defn].used(node: node, definition: current_definition)
          }

          visitor[GraphQL::Language::Nodes::FragmentSpread] << ->(node, _parent) {
            @fragment_usages[node.name][:usages] << NodeUsage.new(node: node, definition: current_definition)
          }

          visitor[GraphQL::Language::Nodes::FragmentDefinition] << ->(node, _parent) {
            current_definition = node
            @fragment_usages[node.name][:definition] = node
          }

          visitor[GraphQL::Language::Nodes::OperationDefinition] << ->(node, _parent) {
            current_definition = node
          }
        end

        class FieldUsage
          attr_reader :owner, :field, :usages
          def initialize(owner:, field:)
            @owner = owner
            @field = field
            @usages = []
          end

          def used(node:, definition:)
            @usages << NodeUsage.new(node: node, definition: definition)
          end
        end
      end

      class NodeUsage
        attr_reader :definition, :node
        def initialize(definition:, node:)
          @node = node,
          @definition = definition
        end
      end
    end
  end
end
