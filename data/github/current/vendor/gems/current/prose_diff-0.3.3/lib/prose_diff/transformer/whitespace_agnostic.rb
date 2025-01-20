# encoding: utf-8

module ProseDiff

  module Transformer

    class WhitespaceAgnostic < Base

      def default_options
        {
          enable: 'true',
          preserve_self: %w{code tt fixed body article div},
          preserve_self_and_ancestor: %w{pre}
        }
      end

      def transform_document(document)

        unless options['enable'] == 'no' || options['enable'] == 'false'

          self_subquery = (options["preserve_self"] + options["preserve_self_and_ancestor"]).map do |tag|
            "not(self::#{tag})"
          end.join ' and '

          ancestor_subquery = options["preserve_self_and_ancestor"].map do |tag|
            "not(ancestor::#{tag})"
          end.join ' and '

          document.xpath("//*[#{self_subquery} and #{ancestor_subquery} and text()]").each do |text_container|
            cmd = text_container.children.reduce({
              swap: false,
              nkotb: Nokogiri::XML::NodeSet.new(document, [])
            }) do |acc, child|
              acc.tap do
                acc[:nkotb] << if child.kind_of?(Nokogiri::XML::Text)
                  its_text = child.text()
                  clean_text = WhitespaceAgnostic.clean(its_text)
                  acc[:swap] ||= its_text != clean_text
                  Node.TEXT clean_text, document
                else
                  child
                end
              end
            end
            text_container.children = cmd[:nkotb] if cmd[:swap]
          end

        end

      end

      def self.clean(str)
        str.gsub /\s+/, ' '
      end

    end
  end
end
