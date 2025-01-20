require "codeowners"
require "minitest/spec"
require "minitest/autorun"

describe Codeowners::Matcher::GraphBuilder do
  describe ".from_rules" do
    it "builds a graph from a simple rule" do
      rule = Codeowners::Rule.new(1, "/foo", [])
      graph = Codeowners::Matcher::GraphBuilder.from_rules([rule])

      #
      # ┌────┐      ┌────┐
      # │root├─────►│rule├───┐
      # └────┘ foo  └────┘   │
      #                ▲     │(open-ended rule)
      #                └─────┘
      #

      assert_transitional_node(graph.root, transitions: ["foo"])

      rule_node = graph.root.transitions.fetch("foo")
      assert_open_ended_match(rule_node, rule)

      assert_equal Set[rule_node], graph.traverse(["foo"])
      assert_equal Set[rule_node], graph.traverse(["foo", "bar"])
      assert_equal Set[], graph.traverse(["bar"])
    end

    it "builds a graph from a rule with multiple parts" do
      rule = Codeowners::Rule.new(1, "/foo/b*r", [])
      graph = Codeowners::Matcher::GraphBuilder.from_rules([rule])

      #
      # ┌────┐      ┌──┐      ┌────┐
      # │root├─────►│A ├─────►│rule├───┐
      # └────┘ foo  └──┘ b*r  └────┘   │
      #                          ▲     │(open-ended rule)
      #                          └─────┘
      #

      assert_transitional_node(graph.root, transitions: ["foo"])

      node_a = graph.root.transitions.fetch("foo")
      assert_transitional_node(node_a, transitions: ["b*r"])

      rule_node = node_a.transitions.fetch("b*r")
      assert_open_ended_match(rule_node, rule)

      assert_equal Set[node_a], graph.traverse(["foo"])
      assert_equal Set[rule_node], graph.traverse(["foo", "bar"])
      assert_equal Set[rule_node], graph.traverse(["foo", "bxyzr"])
      assert_equal Set[], graph.traverse(["bar"])
    end

    it "builds a single graph from multiple rules" do
      foo_rule = Codeowners::Rule.new(1, "/foo", [])
      bar_rule = Codeowners::Rule.new(2, "/bar", [])
      graph = Codeowners::Matcher::GraphBuilder.from_rules([foo_rule, bar_rule])

      #
      #                     ┌─────┐
      #                     ▼     │(open-ended rule)
      #              ┌────────┐   │
      #     ┌───────►│foo_rule├───┘
      #     │  foo   └────────┘
      # ┌───┴┐
      # │root│
      # └───┬┘
      #     │        ┌────────┐
      #     └───────►│bar_rule├───┐
      #        bar   └────────┘   │
      #                     ▲     │(open-ended rule)
      #                     └─────┘
      #

      assert_transitional_node(graph.root, transitions: ["foo", "bar"])

      foo_rule_node = graph.root.transitions.fetch("foo")
      assert_open_ended_match(foo_rule_node, foo_rule)

      bar_rule_node = graph.root.transitions.fetch("bar")
      assert_open_ended_match(bar_rule_node, bar_rule)

      assert_equal Set[foo_rule_node], graph.traverse(["foo"])
      assert_equal Set[bar_rule_node], graph.traverse(["bar"])
      assert_equal Set[foo_rule_node], graph.traverse(["foo", "bar"])
      assert_equal Set[bar_rule_node], graph.traverse(["bar", "foo"])
      assert_equal Set[], graph.traverse(["baz"])
    end

    it "builds a graph from a ** rule" do
      rule = Codeowners::Rule.new(1, "**", [])
      graph = Codeowners::Matcher::GraphBuilder.from_rules([rule])

      #
      #       free   ┌──┐
      #      ── ── ─►│A │
      #     │  **    └──┘
      # ┌───┴┐
      # │root│
      # └───┬┘
      #     │        ┌────┐
      #     └───────►│rule├───┐
      #        **    └────┘   │
      #                 ▲     │**
      #                 └─────┘
      #

      assert_transitional_node(graph.root, transitions: ["**"], free_transitions: ["**"])

      # We always generate a free node to support the "** matches nothing" case,
      # but this is only actually useful when there is another part to the rule
      # after the **
      node_a = graph.root.free_transitions.fetch("**")
      assert_dead_end(node_a)

      rule_node = graph.root.transitions.fetch("**")
      assert_open_ended_match(rule_node, rule, label: "**")

      assert_equal Set[graph.root, node_a], graph.traverse([])
      assert_equal Set[rule_node], graph.traverse(["foo"])
      assert_equal Set[rule_node], graph.traverse(["anything", "really"])
    end

    it "assumes a **/ prefix for rules not containing a / character" do
      rule = Codeowners::Rule.new(1, "foo", [])
      graph = Codeowners::Matcher::GraphBuilder.from_rules([rule])

      #
      #       free   ┌──┐
      #      ── ── ─►│A ├──────┐
      #     │  **    └──┘ foo  ▼
      # ┌───┴┐               ┌────┐
      # │root│         ┌────►│rule├───┐
      # └───┬┘         │foo  └────┘   │
      #     │        ┌─┴┐       ▲     │(open-ended rule)
      #     └───────►│B │       └─────┘
      #        **    └──┴──┐
      #                ▲   │**
      #                └───┘
      #

      assert_transitional_node(graph.root, transitions: ["**"], free_transitions: ["**"])

      node_b = graph.root.transitions.fetch("**")
      assert_transitional_node(node_b, transitions: ["**", "foo"])
      assert_equal node_b, node_b.transitions["**"]

      node_a = graph.root.free_transitions.fetch("**")
      assert_transitional_node(node_a, transitions: ["foo"])
      assert_equal node_a.transitions["foo"], node_b.transitions["foo"]

      foo_rule_node = node_b.transitions.fetch("foo")
      assert_open_ended_match(foo_rule_node, rule)

      assert_equal Set[graph.root, node_a], graph.traverse([])
      assert_equal Set[node_b], graph.traverse(["anything", "really"])
      assert_equal Set[node_b, foo_rule_node], graph.traverse(["foo"])
      assert_equal Set[node_b, foo_rule_node], graph.traverse(["anything", "really", "foo"])
    end

    it "assumes a /** suffix for rules ending in a / character" do
      rule = Codeowners::Rule.new(1, "/foo/", [])
      graph = Codeowners::Matcher::GraphBuilder.from_rules([rule])

      #
      #                 free   ┌──┐
      #                ── ── ─►│B │
      #               │  **    └──┘
      # ┌────┐      ┌─┴┐
      # │root├─────►│A │
      # └────┘ foo  └─┬┘
      #               │        ┌────┐
      #               └───────►│rule├───┐
      #                  **    └────┘   │
      #                           ▲     │**
      #                           └─────┘
      #

      assert_transitional_node(graph.root, transitions: ["foo"])

      node_a = graph.root.transitions.fetch("foo")
      assert_transitional_node(node_a, transitions: ["**"], free_transitions: ["**"])

      rule_node = node_a.transitions.fetch("**")
      assert_open_ended_match(rule_node, rule, label: "**")

      node_b = node_a.free_transitions.fetch("**")
      assert_dead_end(node_b)

      assert_equal Set[], graph.traverse(["anything", "really"])
      assert_equal Set[node_a, node_b], graph.traverse(["foo"])
      assert_equal Set[rule_node], graph.traverse(["foo", "anything", "really"])
    end

    it "created a closed-ended graph for a rule ending in /*" do
      rule = Codeowners::Rule.new(1, "/foo/*", [])
      graph = Codeowners::Matcher::GraphBuilder.from_rules([rule])

      #
      # ┌────┐      ┌──┐      ┌────┐
      # │root├─────►│A ├─────►│rule│
      # └────┘ foo  └──┘  *   └────┘
      #

      assert_transitional_node(graph.root, transitions: ["foo"])

      node_a = graph.root.transitions.fetch("foo")
      assert_transitional_node(node_a, transitions: ["*"])

      rule_node = node_a.transitions.fetch("*")
      assert_closed_ended_match(rule_node, rule)

      assert_equal Set[node_a], graph.traverse(["foo"])
      assert_equal Set[rule_node], graph.traverse(["foo", "bar"])
      assert_equal Set[], graph.traverse(["foo", "bar", "baz"])
    end
  end

  def assert_transitional_node(node, transitions: [], free_transitions: [])
    # A node somewhere in the middle of the graph: it doesn't match a rule,
    # but does have onward transitions to other nodes.
    #
    #         ┌──┐
    #   - - ─►│X ├── - - ─►
    #         └──┘

    if transitions.empty? && free_transitions.empty?
      raise ArgumentError, "For nodes with no transitions, `assert_dead_end` is clearer!"
    end

    assert_equal transitions.sort, node.transitions.keys.sort
    assert_equal free_transitions.sort, node.free_transitions.keys.sort
    assert_nil node.rule
  end

  def assert_open_ended_match(node, rule, label: "open-ended-rule")
    # A common pattern for the last node in the path through the graph
    # that represents a rule that can match a file, a directory, or anything
    # nested under that directory.
    #
    #         ┌────┐
    #   - - ─►│rule├───┐
    #         └────┘   │
    #            ▲     │(open-ended rule)
    #            └─────┘

    assert_equal [label], node.transitions.keys
    assert_equal node, node.transitions[label]
    assert_empty node.free_transitions.keys
    assert_equal rule, node.rule
  end

  def assert_closed_ended_match(node, rule)
    # The last node in the path through the graph that represents a rule
    # that can only match at a specific level of the file tree, but cannot
    # match any deeper children.
    #
    #          ┌────┐
    #    - - ─►│rule│
    #          └────┘

    assert_empty node.transitions.keys
    assert_empty node.free_transitions.keys
    assert_equal rule, node.rule
  end

  def assert_dead_end(node)
    # A node with no onward path.
    #
    #          ┌──┐
    #    - - ─►│Y │
    #          └──┘

    assert_empty node.transitions.keys
    assert_empty node.free_transitions.keys
    assert_nil node.rule
  end
end
