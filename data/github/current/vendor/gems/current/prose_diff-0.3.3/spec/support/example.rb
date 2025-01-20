module ProseDiff
  # Parses the fixtures in the examples/ directory.
  #
  # See _template.html for an example of the format.
  class Fixture
    def self.all
      files = Dir[File.expand_path('../../examples/[^_]*.html', __FILE__)].map do |filename|
        new(filename)
      end
    end

    def initialize(filename)
      @filename = filename
      @doc = Nokogiri::HTML(File.read(filename))
    end

    def title
      @doc.at('title').inner_text.strip
    end

    def filename
      File.basename(@filename)
    end

    def examples
      @doc.css('.example').map { |node| Example.new(node) }
    end

    def options
      h = value( @doc.at('.options') )
      return {} if h.nil?
      return {} if h.kind_of?(String) && h =~ /\A\s*\Z/
      return h
    end

    class Example
      def initialize(node)
        @node = node
      end

      def pending_message
        @node.attr('data-pending')
      end

      def pending?
        !!pending_message
      end

      def description
        @node.at('h2').inner_text.strip
      end

      def before
        @node.at_css('.before') && @node.at_css('.before').inner_html
      end

      def after
        @node.at_css('.after') && @node.at_css('.after').inner_html
      end

      def diff
        @node.css('.diff').inner_html
      end

    end

    private

    def value(node)
      return nil if node.nil?
      pairs = node.xpath("./*[@data-key != '']")
      if pairs.empty?
        node.text
      else
        pairs.to_a.reduce({}) do |hash, child_node|
          child_key = child_node['data-key'].to_sym
          child_value = value(child_node)
          if child_value.kind_of?(String)
            if hash[child_key].nil?
              hash[child_key] = child_value
            elsif hash[child_key].kind_of? String
              hash[child_key] = [hash[child_key], child_value]
            else
              hash[child_key] << child_value
            end
          else
            hash[child_key] = child_value
          end
          hash
        end
      end
    end

  end
end
