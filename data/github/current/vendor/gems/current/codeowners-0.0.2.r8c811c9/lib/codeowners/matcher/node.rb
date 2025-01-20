# frozen_string_literal: true

require "set"

module Codeowners
  module Matcher
    class Node
      attr_accessor :rule, :graph
      attr_reader :transitions
      attr_reader :free_transitions
      attr_reader :reachable_by_free_transitions

      def initialize(graph = nil)
        @rule = nil
        @transitions = {}
        @unconditional_transitions = Set.new
        @fuzzy_transitions = {}
        @literal_transitions = {}
        @free_transitions = {}
        @reachable_by_free_transitions = Set[self]
        @graph = graph
      end

      def follow_transitions(path_fragment)
        @unconditional_transitions +
          @fuzzy_transitions
            .select { |pattern_fragment, _| @graph.match?(pattern_fragment, path_fragment) }
            .map(&:last)
            .to_set +
          @literal_transitions.values_at(path_fragment).compact.to_set
      end

      def add_unconditional_transition(pattern_fragment, target)
        # An unconditional transition represents part of a pattern that can
        # match any one part of a path, e.g. the pattern `*` could match `foo`,
        # `bar, or `README.md`, so we would model `*` as an unconditional
        # transition.
        @transitions[pattern_fragment] = target
        @unconditional_transitions << target
      end

      def add_fuzzy_transition(pattern_fragment, target)
        # A fuzzy transition represents part of a pattern that can match
        # some path components but not others and needs to be checked against
        # each path component to see if it matches, e.g. the pattern `*.md`
        # could match `README.md` or `CONTRIBUTING.md` but not `app.rb`,
        # so we would model `*.md` as a fuzzy transition.
        @transitions[pattern_fragment] = target
        @fuzzy_transitions[pattern_fragment] = target
      end

      def add_literal_transition(pattern_fragment, target)
        # A literal transition represents part of a pattern that can only
        # match any one specific thing, e.g. the pattern `foo.txt` could only
        # ever match the path component `foo.txt`, so we would model `foo.txt`
        # as a literal transition.
        @transitions[pattern_fragment] = target
        @literal_transitions[pattern_fragment] = target
      end

      def add_free_transition(label, target)
        # A free transition represents a place where we are allowed to move to
        # another node in the graph without leaving the current node or looking
        # at the next path component.
        #
        # These are used to model situations where the way forward is ambiguous,
        # so we want to be in multiple states until we figure out which path
        # actually matches. Specifically, this is used for the ambiguity that
        # arises from `**` patterns.
        @free_transitions[label] = target
        @reachable_by_free_transitions << target
      end
    end
  end
end
