# frozen_string_literal: true

require "set"
require_relative "matcher/linear"
require_relative "matcher/path_tree"
require_relative "matcher/result"
require_relative "matcher/rule_graph"
require_relative "matcher/graph_builder"
require_relative "matcher/graph_visualizer"

module Codeowners
  module Matcher
    def self.build_graph(rules)
      GraphBuilder.from_rules(rules)
    end

    def self.visualize_graph(graph, file = $stdout)
      GraphVisualizer.write_dot(graph, file)
    end
  end
end
