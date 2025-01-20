# first, helpers neeced by the transformers
module ProseDiff

  module Transformer

    def self.analysis_is?(node, value, *names)
      node['data-github-analysis'] == value && names.include?(node.name)
    end

    def self.where_analysis_is(value, *names)
      names = ['*'] if names.empty? # allows where_analysis_is('added')
      names.map { |it| "//#{it}[@data-github-analysis='#{value}']" }.join('|')
    end

    def self.where_name_is(*names)
      names.map { |it| "//#{it}" }.join('|')
    end

    def self.symbol(clazz)
      underscore(clazz.name.split('::').last).to_sym
    end

    def self.computed_list(options)
      if options.empty?.nil? || options.empty?
        []
      else
        only   = Array(options[:only] || options['only'] || [])
        except = Array(options[:except] || options['except'] || [])
        only = ProseDiff::Node.tags_seen if only.empty?
        only - except
      end
    end

    def self.underscore(string)
      string.gsub(/(.)([A-Z])/,'\1_\2').downcase
    end

  end

end

require_relative 'base'
require_relative 'simple_text_diff'
require_relative 'changed_classes'
require_relative 'changed_node'
require_relative 'check_boxes'
require_relative 'chunk_edits'
require_relative 'moved'
require_relative 'propagate_changed'
require_relative 'replace'
require_relative 'wrap'
require_relative 'redundant_span'
require_relative 'all_redundant_divs'
require_relative 'vicinity'
require_relative 'css'
require_relative 'strip_private_data_attributes'
require_relative 'expandables'
require_relative 'whitespace_agnostic'
require_relative 'sort_classes'

module ProseDiff

  module Transformer

    TRANSFORMERS = {
     before_all: [
       Transformer::AllRedundantDivs,
       Transformer::WhitespaceAgnostic
     ],
     after_diff: [
       Transformer::SimpleTextDiff,
       Transformer::ChangedNode,
       Transformer::RedundantSpan,
       Transformer::ChunkEdits
     ],
     after_all: [
       Transformer::Moved,
       Transformer::ChangedClasses,
       Transformer::PropagateChanged,
       Transformer::Replace,
       Transformer::Wrap,
       Transformer::Vicinity,
       Transformer::Css,
       Transformer::StripPrivateDataAttributes,
       Transformer::Expandables,
       Transformer::CheckBoxes,
       Transformer::SortClasses
     ]
    }

    TRANSFORMERS[:all] = TRANSFORMERS.values.reduce([], &:|)

    def transform_nodes(selector, nodes, options = {})

      transformers = if TRANSFORMERS[selector]
                       TRANSFORMERS[selector]
                     elsif selector.respond_to?(:new)
                       [selector]
                     elsif selector.respond_to?(:reduce)
                       selector
                     else
                       raise "Don't know how to use #{selector} to transform #{nodes}"
                     end

      transformers.reduce(nodes) do |acc, transformer_clazz|
        transformer_options = options[symbol(transformer_clazz)] || {}
        transformer_clazz.new(transformer_options).transform_nodes(acc)
      end

    end

    module_function :transform_nodes

    def transform_document(selector, value, options = {})

      transformers = if TRANSFORMERS[selector]
                       TRANSFORMERS[selector]
                     elsif selector.respond_to?(:new)
                       [selector]
                     elsif selector.respond_to?(:reduce)
                       selector
                     else
                       raise "Don't know how to use #{selector} to transform #{in_nodeset}"
                     end

      document = ProseDiff::Node.Document(value)

      transformers.each do |transformer_clazz|
        transformer_options = options[symbol(transformer_clazz)] || {}
        transformer_clazz.new(transformer_options).transform_document(document)
      end

      out_nodeset = ProseDiff::Node.NodeSet(document)

      if value.kind_of? Nokogiri::XML::NodeSet
        out_nodeset
      elsif value.kind_of? String
        out_nodeset.to_html
      elsif value.kind_of? Nokogiri::XML::Document
        document
      elsif value.kind_of? Nokogiri::XML::Node
        out_nodeset.first
      elsif value.kind_of? Array
        out_nodeset.to_a
      end

    end

    module_function :transform_document

  end

end
