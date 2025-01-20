# encoding: utf-8

module ProseDiff
  class Node
    module Proxy
      class Text

        include BaseBehaviour

        WHITESPACE = /[^\p{Word}']/u

        # text never compares children
        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)
          have_comparable_text?(node, other_node)
        end

        def was_moved? node
          false
        end

        def analysis(node)
          'unchanged'
        end

        def is_uncomplicated? node
          ProseDiff::Node.natural_keys(node).empty?
        end

        def was_changed? node
          false
        end

        def other_changed? node
          false
        end

        def before(node)
          nil
        end

        def was_unchanged? node
          true
        end

        def was_added? node
          false
        end

        def was_removed? node
          false
        end

        def private_attrs(node)
          {}
        end

        def text(node)
          node.inner_text
        end

        # see http://stackoverflow.com/questions/7724135/ruby-string-split-on-more-than-one-character
        def split(node)

          split_words = ProseDiff::Node::WordSplitting.split_by_word(node.text)

          split_words = split_words.map do |fragment|
            if ProseDiff::Node::WordSplitting.word?(fragment)
              ProseDiff::Node.WORD(fragment, node.document)
            else
              ProseDiff::Node.WHITESPACE(fragment, node.document)
            end
          end

          ProseDiff::Node.NodeSet(split_words)

        end

        def unsplit(node, other_node)

          if other_node.kind_of?(Nokogiri::XML::Text)
            Nokogiri::XML::NodeSet.new(node.document,
              [
                Node.TEXT(node.text + other_node.text)
              ]
            )
          elsif ProseDiff::Node.is_textlike?(other_node) && ProseDiff::Node.is_uncomplicated?(other_node)
            ProseDiff::Node.unsplit_all(node, other_node.children)
          else
            Nokogiri::XML::NodeSet.new(node.document, [node, other_node])
          end

        end

        def has_same_content_as? node, other_node
          node.text == other_node.text
        end

      end
    end
  end
end
