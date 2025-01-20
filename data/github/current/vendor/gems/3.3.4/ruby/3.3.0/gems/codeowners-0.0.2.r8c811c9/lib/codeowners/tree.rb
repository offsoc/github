# frozen_string_literal: true

require "pathspec/gitignorespec"

module Codeowners
  class Tree
    # Regexp to check whether a string contains a special glob or escape character
    GLOB_OR_ESCAPE_CHECK = /\[|\?|\*|\\/

    # A single node in the tree.
    class Node
      attr_accessor :value
      attr_reader :children

      def initialize
        @children = {}
        @value = nil
      end

      def insert(segment)
        @children[segment] = self.class.new
      end

      def lookup(segment)
        @children[segment]
      end

      def match(segments, pos)
        pattern = segments[pos]
        if (node = @children[pattern])
          yield node, pos + 1
        elsif GLOB_OR_ESCAPE_CHECK.match?(pattern)
          # If the pattern is '**' and we're not at the last segment,
          # move to the next segment
          if pattern == '**' && pos != (segments.length - 1)
            yield self, pos + 1
          end

          @children.each do |key, child_node|
            # If this is a single '*', it shouldn't match any deeper than the
            # current directory.
            if pattern == '*' && pos == segments.length - 1
              yield child_node, pos + 1 if child_node.value
              next
            end

            if ::File.fnmatch?(pattern, key, ::File::FNM_DOTMATCH)
              yield child_node, pos + 1
            end

            # If the pattern is '**' and we're not at the last segment,
            # yield the child child_node and see if it matches against the next segment
            if pattern == '**' && pos != (segments.length - 1)
              yield child_node, pos
            end
          end
        end
      end

      def each_value
        queue = children.values

        yield value if queue.empty?

        while child = queue.pop
          yield child.value if child.value

          queue.concat(child.children.values)
        end
      end
    end

    def initialize
      @root = Node.new

      @leafs = {}
    end

    def insert(path)
      node = @root

      path = path.b
      segments = path.split("/")

      (@leafs[segments.last] ||= []) << path

      segments.each do |segment|
        node = node.lookup(segment) || node.insert(segment)
      end

      node.value = path
    end

    def match(input)
      input = input.b

      return match_filename(input) unless input.include?("/")

      # Split with -1 so we retain trailing slashes
      segments = input.split("/", -1)

      # If the rule begins with a slash, it should only match on the root dir.
      if segments[0] == ""
        segments.shift
      # If the pattern doesn't begin with a slash, or it is a single pattern with
      # a trailing slash, prepend `**` so it will match any nested path.
      elsif segments.length == 1 || (segments.length == 2 && segments[-1] == "")
        segments.insert(0, "**") if segments[0] != "**"
      end

      # If the pattern ends with a slash, replace with '**' so all nested paths match.
      if segments[-1] == "" && segments.length > 1
        segments[-1] = "**"
      end

      match_path(segments)
    end

    protected

    def match_path(segments)
      results = []

      queue = [[@root, segments.first.empty? ? 1 : 0]]
      while (node, iter = queue.pop)
        if iter == segments.length
          node.each_value do |result|
            results << result
          end
        else
          node.match(segments, iter) do |child_node, pos|
            queue << [child_node, pos]
          end
        end
      end

      results
    end

    def match_filename(input)
      results = []

      spec = PathSpec::GitIgnoreSpec.new(input)
      regex = spec.instance_variable_get(:@regex)
      return results unless regex

      @leafs.each do |_filename, paths|
        paths.each do |path|
          if regex.match?(path)
            results << path
          end
        end
      end

      results
    end
  end
end
