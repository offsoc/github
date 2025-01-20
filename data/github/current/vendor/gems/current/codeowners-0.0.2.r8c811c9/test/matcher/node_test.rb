require "codeowners"
require "minitest/spec"
require "minitest/autorun"

describe Codeowners::Matcher::Node do
  describe "#follow_transitions" do
    it "returns unconditional transitions" do
      graph = Codeowners::Matcher::Graph.new
      target_node = Codeowners::Matcher::Node.new(graph)
      node = Codeowners::Matcher::Node.new(graph)
      node.add_unconditional_transition("**", target_node)

      assert_equal Set[target_node], node.follow_transitions("something")
    end

    it "returns matching literal transitions" do
      graph = Codeowners::Matcher::Graph.new
      target_node = Codeowners::Matcher::Node.new(graph)
      node = Codeowners::Matcher::Node.new(graph)
      node.add_literal_transition("foo", target_node)

      assert_equal Set[target_node], node.follow_transitions("foo")
      assert_equal Set[], node.follow_transitions("bar")
    end

    it "returns matching fuzzy transitions" do
      graph = Codeowners::Matcher::Graph.new
      target_node = Codeowners::Matcher::Node.new(graph)
      node = Codeowners::Matcher::Node.new(graph)
      node.add_fuzzy_transition("fo*", target_node)

      assert_equal Set[target_node], node.follow_transitions("foo")
      assert_equal Set[target_node], node.follow_transitions("fox")
      assert_equal Set[], node.follow_transitions("something-foo")
      assert_equal Set[], node.follow_transitions("bar")
    end
  end

  describe "#reachable_by_free_transitions" do
    it "always returns the node itself" do
      graph = Codeowners::Matcher::Graph.new
      node = Codeowners::Matcher::Node.new(graph)

      assert_equal Set[node], node.reachable_by_free_transitions
    end

    it "also returns nodes added as free transitions" do
      graph = Codeowners::Matcher::Graph.new
      target_node = Codeowners::Matcher::Node.new(graph)
      node = Codeowners::Matcher::Node.new(graph)
      node.add_free_transition("**", target_node)

      assert_equal Set[node, target_node], node.reachable_by_free_transitions
    end
  end

  describe "#transitions" do
    it "returns all non-free transitions" do
      graph = Codeowners::Matcher::Graph.new
      target_node = Codeowners::Matcher::Node.new(graph)
      node = Codeowners::Matcher::Node.new(graph)
      node.add_unconditional_transition("unconditional", target_node)
      node.add_literal_transition("literal", target_node)
      node.add_fuzzy_transition("fuz*y", target_node)
      node.add_free_transition("free", target_node)

      assert_equal(
        {
          "unconditional" => target_node,
          "literal" => target_node,
          "fuz*y" => target_node,
        },
        node.transitions,
      )
    end
  end

  describe "#free_transitions" do
    it "returns all free transitions" do
      graph = Codeowners::Matcher::Graph.new
      target_node = Codeowners::Matcher::Node.new(graph)
      node = Codeowners::Matcher::Node.new(graph)
      node.add_unconditional_transition("unconditional", target_node)
      node.add_literal_transition("literal", target_node)
      node.add_fuzzy_transition("fuz*y", target_node)
      node.add_free_transition("free", target_node)

      assert_equal(
        {
          "free" => target_node,
        },
        node.free_transitions,
      )
    end
  end
end
