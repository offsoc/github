# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      module Analyzer
        # @api private
        module UnauthorizedFields
          def self.call(irep_nodes, ctx)
            fields = irep_nodes
              .map { |node| "#{node.owner_type.name}.#{node.definition.name}" }
              .uniq
              .join(", ")

            GraphQL::AnalysisError.new("Not authorized for fields: #{fields}")
          end
        end
      end
    end
  end
end
