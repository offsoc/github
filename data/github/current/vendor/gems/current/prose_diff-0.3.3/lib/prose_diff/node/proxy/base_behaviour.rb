# encoding: utf-8

module ProseDiff
  class Node

    module Proxy

      module BaseBehaviour

        def valid?(node)
          true
        end

        EMPTY_TEXT_HASH = Digest::SHA1.hexdigest('')

        def significant(options, array_of_attrs)
          array_of_attrs & ProseDiff::OPTIONS[:significant_attrs]
        end

        def at(options, category, key)
          dictionary = options[category] || options[category.to_s] || {}
          dictionary[key] || dictionary[key.to_s]
        end

        def add_class(node, new_class)
          clazzes = (node['class'] || '').split ' '
          clazzes << new_class unless clazzes.include?(new_class)
          node['class'] = clazzes.join ' '
        end

        def text_hash(node)
          node.instance_variable_set :@text_hash_memo, node.instance_variable_get(:@text_hash_memo) || begin
            my_text = Node.to_text_string(node)
            if my_text == ''
              EMPTY_TEXT_HASH
            else
              Digest::SHA1.hexdigest(my_text)
            end
          end
        end

        def has_same_content_as?(node, other_node)
          text_hash(node) == text_hash(other_node)
        end

        def is_textlike? node
          false
        end

        def unsplit(node, other_node)
          Nokogiri::XML::NodeSet.new(node.document, [node, other_node])
        end

        def unsplit_all(args_or_set, additional = [])
          if args_or_set.kind_of?(Nokogiri::XML::Element) || args_or_set.kind_of?(Nokogiri::XML::Text) || args_or_set.kind_of?(Nokogiri::XML::Comment)
            left, right = [args_or_set], additional
          else
            a = args_or_set + additional
            return Nokogiri::XML::NodeSet.new(node.document, []) if a.empty?
            left, right = [a.first], a[1..-1]
          end
          while !right.empty?
            last, butLast = left.last, left[0..-2]
            first, butFirst = right.first, right[1..-1]
            left, right = butLast + ProseDiff::Node.unsplit(last, first).to_a, butFirst
          end
          if left.empty?
            Nokogiri::XML::NodeSet.new(Nokogiri::HTML::Document.new, [])
          else
            Nokogiri::XML::NodeSet.new(left.first.document, left)
          end
        end

        # returns the split children as a list
        def split_children(node)
          node.children.map { |it| ProseDiff::Node.split(it) }.flatten
        end

        def is_a_simple_text_container?(node)
          node.children.length == 1 && node.children.first.kind_of?(Nokogiri::XML::Text)
        end

        def replace_children(node, nkotb)
          while node.children.last
            node.children.last.remove
          end
          nkotb.each do |child|
            node << child
          end
          node
        end

        def natural_keys(node)
          node.keys.reject { |k| k.match(Node::RE) && k != "data-github-wrapped-text" }
        end

        def has_natural_keys?(node)
          !natural_keys(node).empty?
        end

        def doesnt_have_natural_keys?(node)
          natural_keys(node).empty?
        end

        def natural_attrs(node)
          node.keys.reject { |k| k.match(Node::RE) && k != "data-github-wrapped-text" }.reduce({}) { |h, k| h[k] = node[k]; h }
        end

        TEXT_DIFFERENCE_THRESHOLD = 0.25
        NODE_CLOSENESS_THRESHOLD  = 0.1

        def is_compatible_with?(node, other_node)
          true
        end

        def valid_and_compatible?(node, other_node)
          self.valid?(node) &&
          ProseDiff::Node.valid?(other_node) &&
          ProseDiff::Node.is_compatible_with?(node, other_node) &&
          ProseDiff::Node.is_compatible_with?(other_node, node)
        end

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)

          corresponds = have_same_identification?(node, other_node)
          return corresponds unless corresponds.nil?

          corresponds = have_comparable_text?(node, other_node)
          return corresponds unless corresponds.nil?

          have_comparable_children?(node, other_node)
        end

        # tri:state: true, false, nil
        def have_same_identification?(node, other_node)
          if node['id'] || other_node['id']
            return node['id'] == other_node['id']
          elsif node['itemprop'] || other_node['itemprop']
            return node['itemprop'] == other_node['itemprop']
          end
        end

        # tri:state: true, false, nil
        def have_comparable_text?(node, other_node)
          if is_dominated_by_text?(node) && is_dominated_by_text?(other_node)
            is_comparable_text?(node, other_node)
          elsif is_dominated_by_text?(node) || is_dominated_by_text?(other_node)
            false
          end
        end

        def is_comparable_text?(text, other_text)
          str = if text.respond_to?(:inner_text)
                  text.inner_text
                else
                  text
                end
          other_str = if other_text.respond_to?(:inner_text)
                        other_text.inner_text
                      else
                        other_text
                      end

          return true if str == other_str
          # str, other_str = Transformer::WhitespaceAgnostic.clean(str.downcase), Transformer::WhitespaceAgnostic.clean(other_str.downcase)
          # return true if str.downcase == other_str.downcase

          lengths = [str.length, other_str.length]
          min, max = lengths.min, lengths.max
          if ((max - min).to_f / max) < TEXT_DIFFERENCE_THRESHOLD
            (text_differences_metric(text, other_text) < TEXT_DIFFERENCE_THRESHOLD)
          else
            false
          end
        end

        # tri:state: true, false, nil
        def have_comparable_children?(node, other_node)
          are_comparable_lists_of_nodes?(node.children, other_node.children)
        end

        # tri:state: true, false, nil
        def are_comparable_lists?(a_list, b_list)
          list_length = a_list.length + b_list.length
          return true if list_length == 0
          lcs_of_list_length = LCS.length a_list, b_list
          similarity = ((lcs_of_list_length).to_f / [a_list.length + b_list.length].max)
          similarity > NODE_CLOSENESS_THRESHOLD
        end

        # tri:state: true, false, nil
        def are_comparable_lists_of_nodes?(a_list, b_list)
          list_length = a_list.length + b_list.length
          return true if list_length == 0
          lcs_of_list_length = LCS.length a_list, b_list do |a_child, b_child|
            ProseDiff::Node.appear_to_correspond?(a_child, b_child)
          end
          similarity = ((lcs_of_list_length).to_f / [a_list.length + b_list.length].max)
          similarity > NODE_CLOSENESS_THRESHOLD
        end

        DOMINATION_THRESHOLD = 0.75

        # not meant to be polymorphic through proxies, but maybe that should change?
        def is_dominated_by_text?(node)
          return true if node.kind_of?(Nokogiri::XML::Text)
          all_text_length = node.inner_text.length
          all_text_length > 0 && begin
            text_kids = node.children.select { |kid| kid.kind_of?(Nokogiri::XML::Text) || ProseDiff::Node::SPANS.include?(kid.name) || is_dominated_by_text?(kid) }
            text_kid_length = text_kids.map(&:inner_text).map(&:length).reduce(0,&:+)
            (text_kid_length.to_f / all_text_length) > DOMINATION_THRESHOLD
          end
        end

        def wordz(node)
          (node.text or return []).split(/\W/).compact.reject { |it| it == ''}
        end

        def text_differences_metric(list_a, list_b)
          list_a = list_a.inner_text if list_a.respond_to?(:inner_text)
          list_a = list_a.chars.to_a if list_a.kind_of?(String)
          list_b = list_b.inner_text if list_b.respond_to?(:inner_text)
          list_b = list_b.chars.to_a if list_b.kind_of?(String)

          longest_length = [list_a.length, list_b.length].max
          if longest_length == 0
            0
          else
            change_regions = ::Diff::LCS.diff(list_a.map(&:downcase), list_b.map(&:downcase)) # N.B. this is not *our* diff
            change_lengths_in_words = change_regions.map { |reg| positions = reg.map(&:position); positions.max - positions.min + 1  }
            longest_change, number_of_changes = change_lengths_in_words.max || 0, change_regions.length
            [longest_change, number_of_changes].max.to_f / longest_length
          end
        end

          # code smell: couldn't figure out setting a namespaced attribute
          class NamespacedAttributeProxy

            def initialize(node)
              @node = node
            end

            def [] attr
              @node["data-github-#{attr}"]
            end

            def []= attr, value
              @node["data-github-#{attr}"] = value
              value
            end

            def to_hash
              @node.keys.reduce({}) do |acc, k|
                if name = k[Node::RE, 1]
                  acc[name] = @node[k]
                end
                acc
              end
            end

            def values
              @node.keys.reduce([]) do |acc, k|
                if name = k[Node::RE, 1]
                  acc << @node[k]
                else
                  acc
                end
              end
            end

          end


          def was_moved? node
            node[Node::MOVED] && node[Node::MOVED] == 'moved'
          end

          def becomes_moved(node)
            node[Node::MOVED] = 'moved'
            node
          end

          def analysis(node)
            node[Node::ANALYSIS] || begin
              return 'unchanged' unless node['class']
              clazzes = node['class'].split ' '
              return 'added' if clazzes.include?('added')
              return 'removed' if clazzes.include?('removed')
              return 'changed' if clazzes.include?('changed')
              'unchanged'
            end
          end

          def set_analysis(node, something)
            node[Node::ANALYSIS] = something
          end

          def is_uncomplicated?(node)
            ProseDiff::Node.natural_keys(node).empty? && (Node.analysis(node).nil? || Node.was_unchanged?(node))
          end

          def was_changed? node
            analysis(node) == 'changed'
          end

          def becomes_changed(node)
            set_analysis node, 'changed'
            node
          end

          def other_changed? node
            self.private_attrs(node).values.include?('changed')
          end

          def set_before(after_node, before_node)
            after_node[Node::BEFORE_TEXT] = before_node.text if ProseDiff::Node.is_a_simple_text_container?(after_node)
            after_node[Node::BEFORE_NATURAL_ATTR_KEYS] = ProseDiff::Node.natural_keys(before_node).join(' ')
            after_node
          end

          def before_text(after_node)
            after_node[Node::BEFORE_TEXT]
          end

          def before_natural_attr_keys(after_node)
            (after_node[Node::BEFORE_NATURAL_ATTR_KEYS] || '').split(' ')
          end

          def was_unchanged? node
            analysis(node) == 'unchanged'
          end

          # now recursive
          def becomes_unchanged(node)
            set_analysis node, 'unchanged'
            node.children.select { |child| child.children.length > 0 }.each { |child| becomes_unchanged(child) }
            node
          end

          def was_added? node
            analysis(node) == 'added'
          end

          def becomes_added(node)
            set_analysis node, 'added'
            node
          end

          def was_removed? node
            analysis(node) == 'removed'
          end

          def becomes_removed(node)
            set_analysis node, 'removed'
            node
          end

          def private_attrs(node)
            NamespacedAttributeProxy.new(node)
          end

          def classify_before(node, attr, value)
            node["data-before-#{attr}"] = value
          end

          def diff_attributes(node, before, options)
            return node if before.nil?

            if node.name != before.name
              self.add_class node, 'changed_tag'
              self.becomes_changed(node)
              classify_before(node, 'tag', before.name) if (at(options, :before_attributes, :attrs) || []).include?('tag')
            end

            before_attr_names, node_attr_names = ProseDiff::Node.natural_keys(before), self.natural_keys(node)

            significant(options, before_attr_names - node_attr_names).each do |removed|
              self.add_class node, "removed_#{removed}"
              self.becomes_changed(node) if self.was_unchanged?(node)
              classify_before(node, removed, before[removed]) if (at(options, :before_attributes, :attrs) || []).include?(removed)
            end

            significant(options, node_attr_names - before_attr_names).each do |added|
              self.add_class node, "added_#{added}"
              self.becomes_changed(node)
            end

            significant(options, node_attr_names & before_attr_names).each do |both|
              before_value, node_value = before[both], node[both]
              if before_value != node_value
                self.add_class node, "changed_#{both}"
                self.becomes_changed(node)
                classify_before(node, both, before_value) if (at(options, :before_attributes, :attrs) || []).include?(both)
              end
            end

            before_clazzes = (before['class'] || '').split(' ')
            node_clazzes = (node['class'] || '').split(' ')

            deadbeef = before_clazzes - node_clazzes
            frshbeef = node_clazzes - before_clazzes

            unless deadbeef.empty?
              node['data-github-removed-class'] = deadbeef.sort.join(' ')
              self.becomes_changed(node)
            end

            unless frshbeef.empty?
              node['data-github-added-class'] = frshbeef.sort.join(' ')
              self.becomes_changed(node)
            end

            node

          end

          def diff_with_before(node, before, options)
            set_before( node, before )
            diff_attributes( node, before, options )
            diff_children( node, before, options )
          end

          def diff_children(node, before, options)

            node_nodes  = self.split_children(node)
            before_nodes = ProseDiff::Node.split_children(before)

            diffed_children = ProseDiff::Diff.diff_node_set(node_nodes, before_nodes, options)

            unsplit_children = unsplit_nodeset(diffed_children)

            self.replace_children( node, unsplit_children )

            if self.was_unchanged?(node) && node.children.any? { |ch| ProseDiff::Node.was_changed?(ch) || ProseDiff::Node.was_added?(ch) || ProseDiff::Node.was_removed?(ch) }
              self.becomes_changed(node)
            end

            node

          end

          def split(node)
            Nokogiri::XML::NodeSet.new(node.document, [node]) # default is that nodes don't split
          end

          private

          def unsplit_nodeset(nodeset)
            if nodeset.length > 1
              first, butFirst = nodeset.first, nodeset[1..-1]
              nodeset = ProseDiff::Node.unsplit_all(first, butFirst)
            end
            nodeset
          end

      end
    end
  end
end
