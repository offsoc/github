# frozen_string_literal: true
module GraphQL
  module Pro
    class Repository
      module AddTypenameVisitor
        def self.mount(visitor)
          typename_field = GraphQL.parse("{ __typename }").definitions.first.selections.first
          add_typename = ->(node, _parent) {
            if node.selections.any?
              node.selections.unshift(typename_field)
            end
          }
          visitor[GraphQL::Language::Nodes::Field].enter << add_typename
          visitor[GraphQL::Language::Nodes::FragmentDefinition].enter << add_typename
          visitor[GraphQL::Language::Nodes::InlineFragment].enter << add_typename
        end
      end
    end
  end
end
