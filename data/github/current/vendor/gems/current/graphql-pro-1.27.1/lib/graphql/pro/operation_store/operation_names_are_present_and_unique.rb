# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      module OperationNamesArePresentAndUnique
        if defined?(GraphQL::StaticValidation::Error) # 1.9+
          include GraphQL::StaticValidation::Error::ErrorHelper
          ERROR_METHOD = :error
        else
          include GraphQL::StaticValidation::Message::MessageHelper
          ERROR_METHOD = :message
        end

        def initialize(document, context)
          @op_names = Hash.new { |h, k| h[k] = [] }
          super
        end

        def on_operation_definition(node, _parent)
          @op_names[node.name] << node
          super
        end

        def on_document(node, _parent)
          super
          @op_names.each do |name, nodes|
            nodes_count = nodes.length

            if name == nil
              ops = if nodes_count == 1
                "is 1 unnamed operation"
              else
                "are #{nodes_count} unnamed operations"
              end

              @context.errors << public_send(ERROR_METHOD, "Operation names are required, but there #{ops}", node, context: @context)
            elsif nodes_count > 1
              @context.errors << public_send(ERROR_METHOD, %|Operation names must be unique, but #{nodes_count} operations are named "#{name}"|, nodes, context: @context)
            end
          end
        end
      end
    end
  end
end
