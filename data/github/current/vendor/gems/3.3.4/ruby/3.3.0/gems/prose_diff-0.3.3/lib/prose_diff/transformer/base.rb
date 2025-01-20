module ProseDiff

  module Transformer

    class Base
      ANALYSES = %w{removed added changed unchanged}

      attr_reader :options

      def initialize(options = {})
        @options = split_keys(default_options)
        split_keys(options).each do |key, value|
          key = key.to_s
          if @options[key].kind_of?(Hash) && value.kind_of?(Hash)
            @options[key].merge!(value)
          else
            @options[key] = value
          end
        end
      end

      def split_keys(options)
        Hash.new.tap do |h|
          options.each do |key, value|
            key.to_s.split(',').map(&:strip).each do |inner_key|
              h[inner_key] = value
            end
          end
        end
      end

      def add_class(node, *new_clazzes)
        return if node.nil?
        new_clazzes = new_clazzes.map(&:strip).select { |it| it != '' }
        return if new_clazzes.empty?
        old_clazzez = (node['class'] || '').split(' ')
        node['class'] = (old_clazzez + new_clazzes).compact.uniq.join(' ')
      end

      def transform_nodes(node_enumerable)
        node_enumerable.each { |node| self.transform_node(node) }
        node_enumerable
      end

      def default_options
        {}
      end
      
      # evaluate an option as a predicate
      def option?(key)
        return nil if options[key].nil?
        !(/^0$|^n$|^no$|^f$|^false$|^disable|^disallow/ =~ options[key].to_s)
      end
    end
  end
end
