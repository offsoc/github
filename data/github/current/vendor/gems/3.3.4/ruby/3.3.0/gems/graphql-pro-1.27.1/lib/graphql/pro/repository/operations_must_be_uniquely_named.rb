# frozen_string_literal: true
module GraphQL
  module Pro
    class Repository
      class OperationsMustBeUniquelyNamed
        if defined?(GraphQL::StaticValidation::Error) # 1.9+
          include GraphQL::StaticValidation::Error::ErrorHelper
          ERROR_METHOD = :error
        else
          include GraphQL::StaticValidation::Message::MessageHelper
          ERROR_METHOD = :message
        end

        def validate(ctx)
          op_names = Hash.new { |h, k| h[k] = [] }

          ctx.visitor[GraphQL::Language::Nodes::OperationDefinition].enter << ->(node, _parent) {
            op_names[node.name] << node
          }

          ctx.visitor[GraphQL::Language::Nodes::Document].leave << ->(node, _parent) {
            op_names.each do |name, nodes|
              nodes_count = nodes.length

              if name == nil
                ops = if nodes_count == 1
                  "is 1 unnamed operation"
                else
                  "are #{nodes_count} unnamed operations"
                end

                ctx.errors << public_send(ERROR_METHOD, "A Repository requires named operations, but there #{ops}", node, context: ctx)
              elsif nodes_count > 1
                ctx.errors << public_send(ERROR_METHOD, %|A Repository requires unique operation names, but #{nodes_count} operations are named "#{name}"|, nodes, context: ctx)
              end
            end
          }
        end
      end
    end
  end
end
