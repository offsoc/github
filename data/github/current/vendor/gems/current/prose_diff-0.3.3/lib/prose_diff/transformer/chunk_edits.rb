# encoding: utf-8

module ProseDiff

  module Transformer

    class ChunkEdits < Base

      CHUNKABLES = %w{span text}

      # FIXME: These should be configurable
      def transform_nodes(nodes)
        ChunkParser.new(nodes, CHUNKABLES).transform()
      end

      class ChunkParser

        def initialize(nodes, separatable_node_names)
          @doc = nodes.first && nodes.first.document
          @separatable_node_names = separatable_node_names
          @nodes = nodes
          @position = 0
          @state = :ready
        end

        def transform
          while @state != :accepted
            set_next_state
            self.send("#{@state}_to_#{@next_state}")
          end
          @nodes
        end

        def set_next_state
          node = @nodes[@position]
          if node
            analysis = ProseDiff::Node.analysis(node) || 'unchanged'
            @next_state = {
              removed:   :last_removed,
              added:     :last_added,
              changed:   :ready,
              unchanged: begin
                if node.name == 'span' && node.text.nil? || node.text.strip.empty?
                  :separator
                else
                  :ready
                end
              end
            }[analysis.to_sym]
          else
            @next_state = :accepted
          end
        end

        def update_nodes
          extract_trailing_separators()
          replace_range = @pos..(@position - 1)
          changes = @removed + @added + @separator
          @nodes[replace_range] = @removed + @added + @separator
        end

        def extract_trailing_separators
          while (r_last = @removed.last) && (a_last = @added.last)
            return unless @separatable_node_names.include?(r_last.name) && r_last.name == a_last.name
            return unless Node.is_a_simple_text_container?(r_last)
            return unless Node.is_a_simple_text_container?(a_last)
            return unless Node.natural_keys(r_last).empty? && Node.natural_keys(a_last).empty?
            r_last_text, a_last_text = r_last.text, a_last.text
            while (r_last_char = r_last_text[-1]) && (a_last_char = a_last_text[-1])
              return unless r_last_char == a_last_char
              return unless r_last_char =~ /[^\p{word}]/
              @separator.unshift(
                r_last.dup.tap do |separator|
                  separator.children = Node.TEXT(r_last_char, @doc)
                  Node.becomes_unchanged(separator)
                end
              )
              r_last_text = r_last_text[0..-2]
              a_last_text = a_last_text[0..-2]
              r_last.children = Node.TEXT(r_last_text, @doc)
              a_last.children = Node.TEXT(a_last_text, @doc)
            end
            @removed.pop() if r_last_text == ''
            @added.pop() if a_last_text == ''
          end
        end

        def amalgamate_separators
          r_separators = @separator.map do |node|
            Nokogiri::XML::Node.new('span', node.document).tap do |span|
              span << Node.TEXT(node.text, node.document)
              ProseDiff::Node.becomes_removed(span)
            end
          end
          a_separators = @separator.map do |node|
            Nokogiri::XML::Node.new('span', node.document).tap do |span|
              span << Node.TEXT(node.text, node.document)
              ProseDiff::Node.becomes_added(span)
            end
          end
          @removed.concat(r_separators)
          @added.concat(a_separators)
          @separator = []
        end

        # ready_to_*

        def ready_to_ready
          @state = @next_state; @position += 1
        end

        def ready_to_last_removed
          @removed, @added, @separator = [ @nodes[@position] ], [], []
          @pos = @position
          @state = @next_state; @position += 1
        end

        def ready_to_last_added
          @removed, @added, @separator  = [], [ @nodes[@position] ], []
          @pos = @position
          @state = @next_state; @position += 1
        end

        def ready_to_separator
          @state = :ready; @position += 1
        end

        def ready_to_accepted
          @state = @next_state; @position += 1
        end

        # last_added_to_*

        def last_added_to_ready
          update_nodes
          @state = @next_state; @position += 1
        end

        def last_added_to_last_added
          @added << @nodes[@position]
          @state = @next_state; @position += 1
        end

        def last_added_to_last_removed
          @removed << @nodes[@position]
          @state = @next_state; @position += 1
        end

        def last_added_to_separator
          @separator = [ @nodes[@position] ]
          @state = @next_state; @position += 1
        end

        def last_added_to_accepted
          update_nodes
          @state = @next_state; @position += 1
        end

        # last_removed_to_*

        def last_removed_to_ready
          update_nodes
          @state = @next_state; @position += 1
        end

        def last_removed_to_last_added
          @added << @nodes[@position]
          @state = @next_state; @position += 1
        end

        def last_removed_to_last_removed
          @removed << @nodes[@position]
          @state = @next_state; @position += 1
        end

        def last_removed_to_separator
          @separator = [ @nodes[@position] ]
          @state = @next_state; @position += 1
        end

        def last_removed_to_accepted
          update_nodes
          @state = @next_state; @position += 1
        end

        # separator_to_*

        def separator_to_ready
          update_nodes
          @state = @next_state; @position += 1
        end

        def separator_to_last_added
          amalgamate_separators
          @added << @nodes[@position]
          @state = @next_state; @position += 1
        end

        def separator_to_last_removed
          amalgamate_separators
          @removed << @nodes[@position]
          @state = @next_state; @position += 1
        end

        def separator_to_separator
          @separator << @nodes[@position]
          @state = @next_state; @position += 1
        end

        def separator_to_accepted
          update_nodes
          @state = @next_state; @position += 1
        end

        # there is no accepted_to_*

      end
    end
  end
end