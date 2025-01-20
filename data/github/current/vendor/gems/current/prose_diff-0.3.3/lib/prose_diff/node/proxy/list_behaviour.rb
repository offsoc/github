# encoding: utf-8
require 'digest/md5'

module ProseDiff
  class Node

    module Proxy

      module ListBehaviour

        HAS_DOPPEL = 'data-github-has-doppel'

        def appear_to_correspond?(node, other_node)

          return false unless valid_and_compatible?(node, other_node)

          corresponds = have_same_identification?(node, other_node)
          return corresponds unless corresponds.nil?

          have_comparable_children?(node, other_node)
        end

        def have_comparable_text?(node, other_node)
          is_comparable_text?(node, other_node)
        end

        def have_comparable_children?(node, other_node)
          node_digests = digests(node)
          other_node_digests = digests(other_node)
          number_that_must_match = [1, [(node_digests.length / 2), (other_node_digests.length / 2)].min.floor].max
          number_of_exact_matches = number_that_match_exactly(node_digests, other_node_digests)
          if number_of_exact_matches >= number_that_must_match
            true
          else
            node_significants = significants(node)
            other_node_significants = significants(other_node)
            number_that_correspond(node_significants, other_node_significants) >= number_that_must_match
          end
        end

        def diff_children(node, before, options)

          node_children, before_children = children_of(node), children_of(before)

          preanalyze_moves(node_children, before_children)

          children = ProseDiff::Diff.diff_node_set(node_children, before_children, options)

          transform_children(children, options)

          node.children = Nokogiri::XML::NodeSet.new node.document, children

          node

        end

        def preanalyze_moves(node_children, before_children)
          befores_by_digest = {}
          before_children.each do |child|
            digest = (child[Node::DIGEST]||= digest(child))
            (befores_by_digest[digest] ||= []) << child
          end
          node_children.each do |child|
            digest = (child[Node::DIGEST]||= digest(child))
            if befores = befores_by_digest[digest]
              child[HAS_DOPPEL] = 'true'
              befores.each do |before|
                before[HAS_DOPPEL] = 'true'
              end
            end
          end
        end

        def transform_children(children, options)
          before_orphans, after_orphans = {}, {}
          children.each do |after|
            if ProseDiff::Node.was_added?(after)
              digest = (after[Node::DIGEST] ||= digest(after))
              if before = before_orphans[digest]
                ProseDiff::Node.diff_children(after, doppelganger(before), options)
                add_class(after, 'moved')
                add_class(after, 'moved-down')
                add_class(before, 'moved')
                add_class(before, 'moved-down')
                before_orphans[digest] = nil
              else
                after_orphans[digest] = after
              end
            elsif ProseDiff::Node.was_removed?(after)
              before = after
              digest = (before[Node::DIGEST] ||= digest(before))
              if after = after_orphans[digest]
                ProseDiff::Node.diff_children(after, doppelganger(before), options)
                add_class(after, 'moved')
                add_class(after, 'moved-up')
                add_class(before, 'moved')
                add_class(before, 'moved-up')
                after_orphans[digest] = nil
              else
                before_orphans[digest] = before
              end
            end
          end
        end

        def doppelganger(node)
          Nokogiri::HTML.fragment(node.to_html).children.first
        end

        def number_that_match_exactly(a_digests, b_digests)
          b_digests = Set.new(b_digests)
          a_digests.reduce(0) do |n, a_digest|
            if b_digests.member?(a_digest)
              n + 1
            else
              n
            end
          end
        end

        def number_that_correspond(a_significants, b_significants)
          b_significants = Set.new(b_significants)
          a_significants.reduce(0) do |n, a_significant_text|
            if b_significants.member?(a_significant_text)
              n + 1
            elsif b_significants.any? { |b_significant_text| LevenshteinDistanceBehaviour.is_comparable_text?(a_significant_text, b_significant_text) }
              n + 1
            else
              n
            end
          end
        end

        def digests(node)
          node.children.select { |c| c.name == 'li' }.map do |li|
            li[Node::DIGEST] ||= digest(li)
          end
        end

        def significants(node)
          node.children.select { |c| c.name == 'li' }.map do |li|
            Li.significant_text(li)
          end
        end

        def digest(li)
          Digest::MD5.hexdigest(Li.significant_text(li))[0,7]
        end

      end

    end

  end
end