# typed: true
# frozen_string_literal: true

require "open3"
require "parser/current"

require "serviceowners/parse_error"

module Serviceowners
  module Internal
    # NOTE: this was inspired by and shares a lot of code with GitHub::BonesExporter::TestSuiteParser
    # a good opportunity for refactoring if anyone wants to get into some AST and refactoring!
    class ClassParser
      attr_accessor :path, :source

      EMPTY = [].freeze

      def initialize(path, source = nil)
        @path = path
        @source = source
      end

      def parse
        parser        = Parser::CurrentRuby.new(builder)
        buffer        = Parser::Source::Buffer.new(path)
        buffer.source = (source || File.read(path))

        root_node = parser.parse(buffer)
        extract_klass_and_module_nodes(root_node).map do |klass_node|
          class_name(klass_node)
        end
      rescue StandardError
        raise Serviceowners::ParseError, "problem parsing #{path}"
      end

      private

      def class_name(node)
        # Ruby definition:
        #    module CoffeeShop
        #      class CountersController < ApplicationController
        #
        # node s exp:
        #    s(:module,
        #      s(:const, nil, :CoffeeShop),
        #      s(:begin,
        #        s(:class,
        #          s(:const, nil, :CountersController),
        #          s(:const, nil, :ApplicationController),

        klass, = *node.children

        names = [klass.source]

        # traverse backwards up to root node to find classes/modules in namespace
        parent = node.parent
        while parent
          parent_class, = *parent.children

          names << parent_class.source if class_or_module?(parent)

          parent = parent.parent
        end

        # names is backwards, so reverse it
        names.reverse.join("::")
      end

      def builder
        require "rubocop"
        RuboCop::AST::Builder.new
      rescue LoadError
        raise "rubocop unavailable in current environment"
      end

      def extract_klass_and_module_nodes(node)
        return EMPTY unless node

        klass_nodes = []
        klass_nodes << node if class_or_module?(node)

        node.child_nodes.each do |child|
          klass_nodes.concat extract_klass_and_module_nodes(child)
        end

        klass_nodes
      end

      def class_or_module?(node)
        node.class_type? || node.module_type?
      end
    end
  end
end
