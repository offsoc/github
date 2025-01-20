# typed: true
# frozen_string_literal: true

module ERBLint
  module Linters
    module ComponentHelpers
      include Kernel
      def components(processed_source)
        processed_source.ast.descendants(:erb).each do |erb_node|
          _, _, code_node = *erb_node
          code = code_node.children.first.strip.gsub(/do$/, "")
          ast = erb_ast(code)

          next if ast.blank?
          next unless ast.type == :send

          tag = BetterHtml::Tree::Tag.from_node(code_node)
          kwargs = if ast.method_name == :render && code.match?(/Primer::|Component/)
                     ast.arguments.first.arguments.last
                   elsif ast.method_name == :primer_octicon || ast.method_name == :octicon
                      ast.arguments.last
          end

          classes = []

          if kwargs&.type == :hash
            classes_arg = kwargs.pairs.find { |x| x.key.value == :"classes" }&.value
            classes = classes_arg.value&.split(" ") if classes_arg&.type == :str
          end

          yield(tag, kwargs, classes)
        end
      end

      def erb_ast(code)
        RuboCop::AST::ProcessedSource.new(code, stable_ruby_version.to_f).ast
      end

      # During the RUBY_NEXT builds, we can run into situations where gems such as Rubocop don't yet support the
      # latest minor version. To get around this, we temporarily downgrade the Ruby version used to the previous
      # stable minor version. This does not affect production code.
      # Reference: https://github.com/github/ruby-architecture/issues/679
      def stable_ruby_version
        if RUBY_DESCRIPTION.match? /dev/
          major = T.let(nil, T.nilable(String))
          minor = T.let(nil, T.nilable(String))
          /^(?<major>\d+)\.(?<minor>\d+)\./ =~ RUBY_VERSION

          if minor.to_i != 0
            minor = (minor.to_i - 1).to_s
            "#{major}.#{minor}"
          else
            raise NotImplementedError
            # It's not possible to predict what will be the last supported ruby 3.X minor version
            # before ruby gets the next major upgrade to 4.X
            # if you hit this error feel free to delete the `raise`,
            # hardcode the most recent minor 3.X version and uncomment the lines below:
            # major = (major.to_i - 1).to_s
            # minor = "?"
          end
        else
          RUBY_VERSION
        end
      end
    end
  end
end
