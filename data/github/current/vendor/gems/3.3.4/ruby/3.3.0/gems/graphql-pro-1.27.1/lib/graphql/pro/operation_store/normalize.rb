# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      module Normalize
        include GraphQL::Language
        module_function
        # @param ast_node [GraphQL::Language::Nodes::AbstractNode]
        # @return [String] Normalized GraphQL string, whitespace removed
        def to_normalized_graphql(ast_node)
          case ast_node
          when Nodes::Document
            ast_node
              .definitions
              .sort_by { |d|
                # operations first, then by op type, then by name
                if d.is_a?(Nodes::OperationDefinition)
                  "A-#{d.operation_type || "query"}-#{d.name}"
                else
                  "Z-#{d.name}"
                end
              }
              .map { |d| to_normalized_graphql(d) }
              .join("") # no whitespace required
          when Nodes::OperationDefinition
            "#{ast_node.operation_type || "query"}#{ast_node.name ? " #{ast_node.name}" : ""}#{normalize_variables(ast_node.variables)}#{normalize_directives(ast_node.directives)}#{normalize_selections(ast_node.selections)}"
          when Nodes::FragmentDefinition
            "fragment #{ast_node.name} on #{to_normalized_graphql(ast_node.type)}#{normalize_directives(ast_node.directives)}#{normalize_selections(ast_node.selections)}"
          when Nodes::Field
            "#{ast_node.alias ? "#{ast_node.alias}:" : ""}#{ast_node.name}#{normalize_arguments(ast_node.arguments)}#{normalize_directives(ast_node.directives)}#{normalize_selections(ast_node.selections)}"
          when Nodes::Directive
            "@#{ast_node.name}#{normalize_arguments(ast_node.arguments)}"
          when Nodes::Argument
            "#{ast_node.name}:#{to_normalized_graphql(ast_node.value)}"
          when Nodes::InputObject
            "{#{normalize_arguments(ast_node.arguments, parens: false)}}"
          when Nodes::FragmentSpread
            "...#{ast_node.name}#{normalize_directives(ast_node.directives)}"
          when Nodes::InlineFragment
            "...#{ast_node.type ? "on #{to_normalized_graphql(ast_node.type)}" : ""}#{normalize_directives(ast_node.directives)}#{normalize_selections(ast_node.selections)}"
          when Nodes::VariableDefinition
            "$#{ast_node.name}:#{to_normalized_graphql(ast_node.type)}#{!ast_node.default_value.nil? ? "=#{to_normalized_graphql(ast_node.default_value)}" : ""}"
          when Nodes::VariableIdentifier
            "$#{ast_node.name}"
          when Nodes::TypeName
            ast_node.name
          when Nodes::NonNullType
            "#{to_normalized_graphql(ast_node.of_type)}!"
          when Nodes::ListType
            "[#{to_normalized_graphql(ast_node.of_type)}]"
          when Nodes::Enum
            ast_node.name
          when String
            "\"#{ast_node}\""
          when Integer, Float, TrueClass, FalseClass
            ast_node.to_s
          when Nodes::NullValue
            "null"
          when Array
            "[#{ast_node.map {|v| to_normalized_graphql(v) }.join(",")}]"
          else
            raise "AST node not supported: #{ast_node}"
          end
        end

        def normalize_selections(selections)
          if selections.empty?
            ""
          else
            fields = selections.size > 1 ? selections.sort_by { |s| selection_sort_key(s) } : selections.dup
            fields.map! { |s| to_normalized_graphql(s) }
            "{#{fields.join(",")}}"
          end
        end

        def normalize_directives(directives)
          if directives.empty?
            ""
          else
            # Don't sort directives -- their order is significant
            directives
              .map { |d| to_normalized_graphql(d) }
              .join("")
          end
        end

        def normalize_arguments(arguments, parens: true)
          if arguments.empty?
            ""
          else
            args = arguments.size > 1 ? arguments.sort_by(&:name) : arguments.dup
            args.map! { |a| to_normalized_graphql(a) }
            args = args.join(",")
            if parens
              "(#{args})"
            else
              args
            end
          end
        end

        def normalize_variables(variables)
          if variables.none?
            ""
          else
            vars = variables.size > 1 ? variables.sort_by(&:name) : variables.dup
            vars.map! { |v| to_normalized_graphql(v) }
            vars = vars.join(",")
            "(#{vars})"
          end
        end

        def selection_sort_key(selection)
          case selection
          when Nodes::Field
            "00-#{selection.alias ? "#{selection.alias}-#{selection.name}" : selection.name}"
          when Nodes::InlineFragment
            t = if selection.type
              to_normalized_graphql(selection.type)
            else
              ""
            end
            "01-#{t}--#{normalize_selections(selection.selections)}"
          when Nodes::FragmentSpread
            "02-#{selection.name}"
          else
            raise "Unexpected selection: #{s}"
          end
        end
      end
    end
  end
end
