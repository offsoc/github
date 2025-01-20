# encoding: utf-8

module ProseDiff
  class Node

    DIGEST = 'data-github-digest'

    RE = Regexp.new "^data-github-(.*)$"

    CLAZZ = "data-github-clazz"

    MOVED = "data-github-moved"

    ANALYSIS = "data-github-analysis"

    ID = "data-github-id"

    BEFORE_ID = "data-github-before_id"

    BEFORE_TEXT = "data-github-before_text"

    BEFORE_NATURAL_ATTR_KEYS = "data-github-keys"

    # Types of nodes

    CONTAINERS = %w{article section div p blockquote pre h1 h2 h3 h4 h5 h6 ol ul li div}

    ATOMS = %w{img hr br}

    TOPLEVEL = CONTAINERS + ATOMS

    SPANLIKE = %w{em strong i b u a strike fixed tt}

    SPANS = SPANLIKE + %w{span}

    INLINES = SPANS + %w{text code del ins}

    WHITELISTED = TOPLEVEL + INLINES

    DEFAULT_XPATH_QUERY = begin
      subquery = (TOPLEVEL | SPANLIKE | %w{table}).map { |name| "self::#{name}" }.join(' or ')
      "//body/*[#{subquery}]"
    end

    CALL_COUNTS = {}

    OPAQUE = ProseDiff::Node::Proxy::Opaque.new

    class << self

      def NodeSet(value)
        if value.kind_of?(Nokogiri::XML::NodeSet)
          return value
        elsif value.kind_of?(Nokogiri::XML::Document)
          return value.at('body').children
        elsif value.kind_of?(Nokogiri::XML::Node)
          return Nokogiri::XML::NodeSet.new(value.document, [value])
        elsif value.respond_to?(:to_a) && value.respond_to?(:empty?) && value.empty?
          return Nokogiri::XML::NodeSet.new(Nokogiri::HTML::Document.new, [])
        elsif value.respond_to?(:to_a) && value.respond_to?(:first)
          return Nokogiri::XML::NodeSet.new(value.first.document, value.to_a)
        elsif value.kind_of?(String)
          HTML(value)
        else
          raise ArgumentError, "Cannot make a NodeSet out of a #{value.class}"
        end
      end

      def Document (value = [])
        return value if value.kind_of?(Nokogiri::XML::Document)
        Nokogiri::HTML('<html><body></body></html>').tap do |doc|
          doc.at('body') << NodeSet(value)
        end
      end

      # an undistinguished span
      def SPAN(text, doc = Nokogiri::HTML::Document.new)
        Nokogiri::XML::Element.new('span', doc).tap do |span|
          span << Node.TEXT(text, doc)
          yield span if block_given?
        end
      end

      def PARENT(node_or_text_or_string, doc = Nokogiri::HTML::Document.new)
        if node_or_text_or_string.kind_of?(Nokogiri::XML::Text)
          SPAN(node_or_text_or_string.text(), doc)
        elsif node_or_text_or_string.kind_of?(Nokogiri::XML::Element)
          node_or_text_or_string
        else
          SPAN(to_text_string(node_or_text_or_string), doc)
        end
      end

      def WORD(text, doc = Nokogiri::HTML::Document.new)
        SPAN(text, doc).tap do |it|
          it[CLAZZ] = 'word'
          yield it if block_given?
        end
      end

      def TEXT(something, doc = Nokogiri::HTML::Document.new)
        text = to_text_string(something)
        Nokogiri::XML::Text.new(text, doc).tap do |it|
          yield it if block_given?
        end
      end

      def WHITESPACE(text, doc = Nokogiri::HTML::Document.new)
        SPAN(text, doc).tap do |it|
          it[CLAZZ] = 'unword'
          yield it if block_given?
        end
      end

      def LINE(html, doc = Nokogiri::HTML::Document.new)
        Nokogiri::XML::Element.new('span', doc).tap do |span|
          span.inner_html = html
          yield span if block_given?
        end
      end

      def HTML(text, query = nil)
        Nokogiri::HTML(text).xpath(query || DEFAULT_XPATH_QUERY)
      end

      def are_identical?(node, other_node)
        Node.digested(node) == Node.digested(other_node)
      end

      def proxies_by_tag
        @proxies_by_tag ||= Hash.new.tap do |h|

          (1..6).each do |level|
            clazz_name = "H#{level}"
            unless ProseDiff::Node::Proxy.const_defined?(clazz_name)
              ProseDiff::Node::Proxy.const_set clazz_name, Class.new(Proxy::H) do |new_clazz|
                new_class.name = clazz_name
              end
            end
          end

          TOPLEVEL.each do |tag_name|
            clazz_name = tag_name[0].upcase + tag_name[1..-1].downcase
            unless ProseDiff::Node::Proxy.const_defined?(clazz_name)
              ProseDiff::Node::Proxy.const_set clazz_name, Class.new(Proxy::Block) do |new_clazz|
                new_class.name = clazz_name
              end
            end
          end

          SPANLIKE.each do |tag_name|
            clazz_name = tag_name[0].upcase + tag_name[1..-1].downcase
            unless ProseDiff::Node::Proxy.const_defined?(clazz_name)
              ProseDiff::Node::Proxy.const_set clazz_name, Class.new(Proxy::Inline) do |new_clazz|
                new_class.name = clazz_name
              end
            end
          end

          # classes defined by name of the tag

          ProseDiff::Node::Proxy.tap do |tag|
            tag.constants.each do |konst_name|
              tag_name = konst_name.downcase.to_s
              if tag.const_defined?(konst_name)
                clazz_or_module = tag.const_get(konst_name)
                if clazz_or_module.respond_to?(:new) && clazz_or_module.include?(ProseDiff::Node::Proxy::BaseBehaviour)
                  h[tag_name] = clazz_or_module.new
                end
              end
            end
          end

        end
      end

      def tags_seen
        proxies_by_tag.keys
      end

      def plural?(node_like_thing)
        node_like_thing.kind_of?(Nokogiri::XML::NodeSet) || node_like_thing.kind_of?(Array)
      end

      def define_method_that_delegates(method_name)
        self.send :define_singleton_method, method_name do |*args, &block|
          receiver_or_receiver_set = args.first
          if receiver_or_receiver_set.nil?
            raise "Node.#{method_name}(#{args.map(&:inspect).join(', ')}) called on a nil node."
          end
          if plural?(receiver_or_receiver_set) && receiver_or_receiver_set.empty?
            return Nokogiri::XML::NodeSet.new(Nokogiri::HTML::Document.new, [])
          elsif plural?(receiver_or_receiver_set)
            if receiver_or_receiver_set.any?(&:nil?)
              raise "Node.#{method_name}(#{args.map(&:inspect).join(', ')}) called on a nil node."
            end
            Nokogiri::XML::NodeSet.new(
              receiver_or_receiver_set.first.document,
              receiver_or_receiver_set.map do |receiver|
                new_args = [receiver] + args[1..-1]
                dispatch_through_proxy(receiver, method_name, new_args, &block)
              end
            )
          else
            dispatch_through_proxy(receiver_or_receiver_set, method_name, args, &block)
          end
        end
      end

      def instance_methods_for_all_proxies
        proxies_by_tag.values.reduce([]) { |method_names, proxy| method_names + proxy.methods }.uniq! - Object.instance_methods
      end

      def to_text_string(node)
        return node if node.kind_of?(String)
        return node.text if node.respond_to?(:text)
        return node.content if node.respond_to?(:content)
        return node.inner_text if node.respond_to?(:inner_text)
        return node.to_s
      end

      def digested(node)
        node['data-github-html-digest'] ||= Digest::SHA1.hexdigest(significant_html(node))[0..7]
      end

      def significant_html(node)
        html = node.to_html
        html = html.gsub /href\s*=\s*(?<quote>'|")#(id)?\d+\k<quote>/, 'href="#_"'
        html = html.gsub /(?<attr>href|src)\s*=\s*(?<quote>'|")\/(?<prefix>[^'"]+\/(blob|raw)\/)[^\/]+(?<suffix>\/[^'"]+)\k<quote>/, '\k<attr>=\k<quote>/\k<prefix>_\k<suffix>\k<quote>'
        html = html.gsub /(?<attr>id|name)\s*=\s*(?<quote>'|")(id)?\d+\k<quote>/, '\k<attr>="_"'
        html = html.gsub /(?<attr>data-github[^ =]+)\s*=\s*(?<quote>'|")[^'"]+\k<quote>/, ''
        html
      end

      private

      def dispatch_through_proxy(receiver, method_name, argv, &block)
        proxy = begin
          clazz_name = receiver[CLAZZ]
          if clazz_name == '' || clazz_name.nil?
            clazz_name = receiver.name
          end
          proxies_by_tag[clazz_name] ||= OPAQUE
        end
        if !proxy.valid?(receiver)
          proxy = OPAQUE
        end
        begin
          proxy.send(method_name, *argv, &block)
        rescue NoMethodError => e
          raise "NoMethodError raised invoking #{e.name} while sending #{method_name} to a <#{receiver.name}>'s proxy"
        end
      end

    end

    instance_methods_for_all_proxies.each { |method_name| define_method_that_delegates(method_name) }

  end

end
