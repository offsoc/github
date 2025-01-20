require "codeowners"
require "minitest/spec"
require "minitest/autorun"

describe Codeowners::Matcher::Graph do
  describe "#traverse" do
    it "returns the nodes arrived at by traversing the graph with the given input" do
      #
      # ┌────┐      ┌──┐      ┌──┐
      # │root├─────►│A ├─────►│B │
      # └────┘ foo  └──┘ bar  └──┘
      #

      graph = Codeowners::Matcher::Graph.new
      graph.root = Codeowners::Matcher::Node.new(graph)
      node_a = Codeowners::Matcher::Node.new(graph)
      graph.root.add_literal_transition("foo", node_a)
      node_b = Codeowners::Matcher::Node.new(graph)
      node_a.add_literal_transition("bar", node_b)

      assert_equal Set[graph.root], graph.traverse([])
      assert_equal Set[node_a], graph.traverse(["foo"])
      assert_equal Set[node_b], graph.traverse(["foo", "bar"])
      assert_equal Set[], graph.traverse(["foo", "bar", "baz"])
      assert_equal Set[], graph.traverse(["bar"])
      assert_equal Set[], graph.traverse(["bar", "foo"])
    end

    it "follows free transitions without matching part of the input" do
      #
      # ┌────┐      ┌──┐       ┌──┐      ┌──┐
      # │root├─────►│A ├─ ─ ─ ►│B ├─────►│C │
      # └────┘ foo  └──┘ free  └──┘ bar  └──┘
      #

      graph = Codeowners::Matcher::Graph.new
      graph.root = Codeowners::Matcher::Node.new(graph)
      node_a = Codeowners::Matcher::Node.new(graph)
      graph.root.add_literal_transition("foo", node_a)
      node_b = Codeowners::Matcher::Node.new(graph)
      node_a.add_free_transition("free", node_b)
      node_c = Codeowners::Matcher::Node.new(graph)
      node_b.add_literal_transition("bar", node_c)

      assert_equal Set[node_a, node_b], graph.traverse(["foo"])
      assert_equal Set[node_c], graph.traverse(["foo", "bar"])
    end

    it "follows free transitions from the root node" do
      #
      # ┌────┐       ┌──┐      ┌──┐
      # │root├─ ─ ─ ►│A ├─────►│B │
      # └────┘ free  └──┘ bar  └──┘
      #

      graph = Codeowners::Matcher::Graph.new
      graph.root = Codeowners::Matcher::Node.new
      node_a = Codeowners::Matcher::Node.new
      graph.root.add_free_transition("free", node_a)
      node_b = Codeowners::Matcher::Node.new
      node_a.add_literal_transition("bar", node_b)

      assert_equal Set[graph.root, node_a], graph.traverse([])
      assert_equal Set[node_b], graph.traverse(["bar"])
    end

    it "can follow multiple paths of the tree" do
      #
      #              ┌──┐
      #     ┌───────►│A │
      #     │  foo*  └──┘
      # ┌───┴┐
      # │root│
      # └───┬┘
      #     │        ┌──┐
      #     └───────►│B │
      #        *bar  └──┘
      #

      graph = Codeowners::Matcher::Graph.new
      graph.root = Codeowners::Matcher::Node.new(graph)
      node_a = Codeowners::Matcher::Node.new(graph)
      node_b = Codeowners::Matcher::Node.new(graph)
      graph.root.add_fuzzy_transition("foo*", node_a)
      graph.root.add_fuzzy_transition("*bar", node_b)

      assert_equal Set[node_a], graph.traverse(["foo x"])
      assert_equal Set[node_b], graph.traverse(["x bar"])
      assert_equal Set[node_a, node_b], graph.traverse(["foo bar"])
    end
  end
end
