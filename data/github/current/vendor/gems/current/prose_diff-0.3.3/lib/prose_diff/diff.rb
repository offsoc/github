module ProseDiff

  class Diff

    NAMES = ProseDiff::Node::TOPLEVEL | ProseDiff::Node::SPANLIKE

    def initialize(before, after, options = {})

      @options = options

      @document       = if after.kind_of?(Nokogiri::XML::Document)
                          after
                        else
                          Nokogiri::HTML(after)
                        end

      before_document = if before.kind_of?(Nokogiri::XML::Document)
                          before
                        else
                          Nokogiri::HTML(before)
                        end

      @document       = Nokogiri.HTML('<body/>') if @document.root().nil?
      before_document = Nokogiri.HTML('<body/>') if before_document.root().nil?

      # strip system messages
      @document.css('div.system-message').each(&:remove)
      before_document.css('div.system-message').each(&:remove)
      @document.css('div').select { |div| div.inner_text =~ /^\s*System Message: ERROR/ }.each(&:remove)
      before_document.css('div').select { |div| div.inner_text =~ /^\s*System Message: ERROR/ }.each(&:remove)

      # new strip section
      after_body, before_body = @document.at('body'), before_document.at('body')
      after_top = @document.at('article') || after_body
      before_top = before_document.at('article') || before_body

      # wrap top-level text elements
      wrap_text(after_body)
      wrap_text(before_body)

      after_children  = flattened after_top.children
      before_children = flattened before_top.children

      after_prefix = []
      while after_children.first && before_children.first && Node.digested(after_children.first) == Node.digested(before_children.first)
        after_prefix.push ProseDiff::Node.becomes_unchanged(after_children.first) unless after_children.first.kind_of?(Nokogiri::XML::Text)
        after_children.shift
        before_children.shift
      end

      after_suffix = []
      while after_children.last && before_children.last && Node.digested(after_children.last) == Node.digested(before_children.last)
        after_suffix.unshift ProseDiff::Node.becomes_unchanged(after_children.last) unless after_children.last.kind_of?(Nokogiri::XML::Text)
        after_children.pop
        before_children.pop
      end

      after_top.children = after_children
      before_top.children = before_children

      Transformer.transform_document(:before_all, @document,       @options)
      Transformer.transform_document(:before_all, before_document, @options)

      self.class.diff_node(after_body, before_body, options)

      after_top = @document.at('article') || after_body
      after_children = after_top.children

      after_top.children  = Node.NodeSet( after_prefix  + after_children  + after_suffix  )

      strip_wrapped_text(after_top.children)

    end

    def node_set
      ProseDiff::Node.NodeSet(
        @document.xpath('//body').first.children.select do |it|
           NAMES.include?(it.name)
        end
      )
    end

    def document
      Transformer.transform_document(
        :after_all, @document, @options
      )
    end

    def flattened(nodeset)
      return nodeset if nodeset.empty?
      Nokogiri::XML::NodeSet.new(nodeset.first.document,
        nodeset.to_a.reduce([]) do |acc, node|
          if node.name != 'div'
            acc << node
          elsif node['class'] == 'system-message'
            acc
          elsif node['id'].nil?
            acc + flattened(node.children).to_a
          else
            anchor = Nokogiri::XML::Node.new('a', node.document)
            anchor['id'] = node['id']
            acc + [anchor] + flattened(node.children).to_a
          end
        end
      )
    end

    class << self

      def diff_node_set( after_node_sets, before_node_sets, options)

        diff_cache = {}
        comparator = lambda do |node, other_node|
          index = "#{Node.digested(node)}-#{Node.digested(other_node)}"
          diff_cache[index] = ProseDiff::Node.appear_to_correspond?(node, other_node) if diff_cache[index].nil?
          diff_cache[index]
        end

        after_node_sets = after_node_sets.to_a
        before_node_sets = before_node_sets.to_a

        prefix, suffix = [], []

        while (after = after_node_sets.first) && (before = before_node_sets.first)
          if ProseDiff::Node.are_identical?( after, before )
            prefix.push( ProseDiff::Node.becomes_unchanged(after) )
            after_node_sets.shift(); before_node_sets.shift()
          elsif comparator.call( after, before )
            prefix.push( diff_node(after, before, options) )
            after_node_sets.shift(); before_node_sets.shift()
          else
            break
          end
        end

        while (after = after_node_sets.last) && (before = before_node_sets.last)
          if ProseDiff::Node.are_identical?( after, before )
            suffix.unshift( ProseDiff::Node.becomes_unchanged(after) )
            after_node_sets.pop(); before_node_sets.pop()
          elsif comparator.call( after, before )
            suffix.unshift( diff_node(after, before, options) )
            after_node_sets.pop(); before_node_sets.pop()
          else
            break
          end
        end

        nodes = ProseDiff::LCS.fold_diff(
          comparator,
          after_node_sets,
          before_node_sets,
          prefix
        ) do |acc, after, before|
          acc << diff_node(after, before, options)
        end + suffix

        nodes = Transformer.transform_nodes(:after_diff, nodes, options)

        Nokogiri::XML::NodeSet.new((nodes.first && nodes.first.document) || Nokogiri::XML::Document.new, nodes)

      end

      def diff_node(after, before, options)

        (after || before).tap do |diffed|

          if before.nil?
            ProseDiff::Node.becomes_added( diffed )

          elsif after.nil?
            ProseDiff::Node.becomes_removed( diffed )

          elsif ProseDiff::Node.are_identical?( diffed, before )
            ProseDiff::Node.becomes_unchanged( diffed )

          else

            ProseDiff::Node.diff_with_before( diffed, before, options )

          end

        end

      end
    end

    def wrap_text(node)
      node.children.each do |child|
        if child.kind_of?(Nokogiri::XML::Text) && !child.content.strip.empty?
          span = Nokogiri::XML::Element.new("span", node.document)
          span.set_attribute "data-github-wrapped-text", "true"
          span.add_child(Nokogiri::XML::Text.new(child.content, node.document))
          child.replace(span)
        end
      end
    end

    def strip_wrapped_text(nodeset)
      nodeset.each do |node|
        removed = node.remove_attribute("data-github-wrapped-text")
        if removed && node.kind_of?(Nokogiri::XML::Element) && node.name == "span" && node.children.length == 1 && node["data-github-analysis"] == "unchanged"
          node.replace(node.children.first)
        end
      end
    end
  end
end
