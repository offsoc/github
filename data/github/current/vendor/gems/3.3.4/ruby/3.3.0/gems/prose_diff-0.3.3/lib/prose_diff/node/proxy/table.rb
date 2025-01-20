# encoding: utf-8

module ProseDiff
  class Node
    module Proxy
      class Table

        include CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

        # FIXME: Document the GFM assumptions, including
        #        * Every column has a TH
        #        * No colspans or colgroups
        #        * at least one row

        def valid?(node)
          if node['data-github-valid'].nil?
            inner_valid(node).tap { |it| node['data-github-valid'] = it.to_s }
          else
            node['data-github-valid'] == 'true'
          end
        end

        def diff_children(node, before, options)

          sanitize_rows(node, before)

          diff_captions(node, before, options)

          assign_rows_and_columns(node, before, options)

          clean_up(node, options)

          node

        end

        def have_comparable_text?(node, other_node)
          node_a = own_ths(node).to_a
          other_node_a = own_ths(other_node).to_a
          if node_a.length == other_node_a.length
            node_text, other_node_text = node_a.join, other_node_a.join
            is_comparable_text?(node_text, other_node_text)
          end
        end

        def have_comparable_children?(node, other_node)
          node_headings = node.css('tr:first-of-type > th').map { |h| Node.to_text_string(h) }
          other_node_headings = other_node.css('tr:first-of-type > th').map { |h| Node.to_text_string(h) }
          are_comparable_lists?(node_headings, other_node_headings)
        end

        private

        def inner_valid(node)
          all_rows = own_rows(node)

          return false if all_rows.length == 0

          header_row = all_rows.first
          header_lengths = header_row.css('> th').length
          body_rows = all_rows[1..-1]
          body_lengths = body_rows.map { |row| row.css('> td').length }
          header_lengths > 0 && header_lengths == body_lengths.max && header_lengths == body_lengths.min
        end

        def sanitize_rows(node, before)
          (own_rows(node)[1..-1] + own_rows(before)[1..-1]).each do |tr|
            tr.children.each do |child|
              child.remove unless child.name == 'td'
            end
          end
          node
        end

        # FIXME: Test adding and removing captions
        def diff_captions(node, before, options)
          ProseDiff::Diff.diff_node_set node.css('caption'), before.css('caption'), options
          node
        end

        def own_rows(node)
          rows = node.css('> tr').to_a
          rows.concat node.css('> thead > tr').to_a
          rows.concat node.css('> tbody > tr').to_a
        end

        def own_ths(node)
          rows = node.css('> tr').to_a
          rows.concat node.css('> thead > tr').to_a
          rows.concat node.css('> tbody > tr').to_a
          rows.first.css('> th')
        end

        def assign_rows_and_columns(node, before, options)

          # rows

          number_of_rows = ProseDiff::LCS.fold_diff(
            ProseDiff::Node.method(:appear_to_correspond?),
            own_rows(node)[1..-1].to_a,
            own_rows(before)[1..-1].to_a,
            0
          ) do |index, after_row, before_row|

            if after_row
              raise "after rows should never be duplicated" if after_row['data-github-row-index']
              after_row['data-github-row-index'] = index
            end
            if before_row
              raise "before rows should never be duplicated" if before_row['data-github-row-index']
              before_row['data-github-row-index'] = index
            end
            index + 1
          end

          node_tds_by_row = own_rows(node)[1..-1].map { |tr| tr.css('> td').to_a }
          node_cols = (0..(own_ths(node).length - 1)).map do |index|
            [ own_ths(node)[index] ] + node_tds_by_row.map { |row_a| row_a[index] }
          end

          before_tds_by_row = own_rows(before)[1..-1].map { |tr| tr.css('> td').to_a }
          before_cols = (0..(own_ths(before).length - 1)).map do |index|
            [ own_ths(before)[index] ] + before_tds_by_row.map { |row_a| row_a[index] }
          end

          number_of_columns = ProseDiff::LCS.fold_diff(
            method(:are_comparable_lists_of_nodes?),
            node_cols,
            before_cols,
            0
          ) do |index, after_col, before_col|

            if after_col
              after_col.each do |th_or_td|
                th_or_td['data-github-column-index'] = index
              end
            end
            if before_col
              before_col.each do |th_or_td|
                th_or_td['data-github-column-index'] = index
              end
            end
            index + 1
          end

          ths = (0..(number_of_columns - 1)).map do |column_index|
            after_th = node.xpath(%Q{.//th[@data-github-column-index="#{column_index}"]}).first
            before_th = before.xpath(%Q{.//th[@data-github-column-index="#{column_index}"]}).first
            if after_th.nil? && before_th.nil?
              raise "logic error, there should be a th for column #{column_index}"
            elsif after_th.nil?
              becomes_removed(before_th)
            elsif before_th.nil?
              becomes_added(after_th)
            else
              ProseDiff::Node.diff_with_before( after_th, before_th, options )
            end
          end

          ths = Transformer.transform_nodes(Transformer::SimpleTextDiff, ths, options)

          header_html = ProseDiff::Node.NodeSet(ths).map(&:to_html).join('')

          trs = (0..(number_of_rows - 1)).map do |row_index|
            Nokogiri::XML::Node.new('tr', node.document).tap do |tr|
              after_tr  = node.xpath(".//tr[@data-github-row-index = '#{row_index}']").first
              before_tr = before.xpath(".//tr[@data-github-row-index = '#{row_index}']").first
              if after_tr.nil? && before_tr.nil?
                raise "logic error, there should be an after or before row index #{row_index}"
              elsif after_tr.nil?
                (0..(number_of_columns - 1)).each do |column_index|
                  td = (before_tr.xpath(%Q{.//td[@data-github-column-index = '#{column_index}']}).first ||
                    Nokogiri::XML::Node.new('td', node.document))
                  tr << becomes_removed(td)
                end
                becomes_removed(tr)
              elsif before_tr.nil?
                (0..(number_of_columns - 1)).each do |column_index|
                  if td = after_tr.xpath(%Q{.//td[@data-github-column-index = '#{column_index}']}).first
                    tr << becomes_added(td)
                  else
                    tr << becomes_removed(Nokogiri::XML::Node.new('td', node.document))
                  end
                end
                becomes_added(tr)
              else
                (0..(number_of_columns - 1)).each do |column_index|
                  after_td = after_tr.xpath(%Q{.//td[@data-github-column-index = '#{column_index}']}).first
                  before_td = before_tr.xpath(%Q{.//td[@data-github-column-index = '#{column_index}']}).first
                  if after_td.nil? && before_td.nil?
                    td = Nokogiri::XML::Node.new('td', node.document)
                    becomes_removed(td)
                  elsif after_td.nil?
                    td = before_td
                    becomes_removed(td)
                  elsif before_td.nil?
                    td = after_td
                    becomes_added(td)
                  else
                    td = after_td
                    ProseDiff::Node.diff_with_before( td, before_td, options )
                  end
                  tr << ProseDiff::Node.NodeSet(Transformer.transform_nodes(Transformer::ChangedNode, [td], options))
                end
              end
              tr.children = ProseDiff::Node.NodeSet(Transformer.transform_nodes(Transformer::ChangedNode, tr.children, options))
            end
          end

          node_head = node.children.find { |c| c.name == 'thead'}
          node_body = node.children.find { |c| c.name == 'tbody'}
          new_rows = ProseDiff::Node.NodeSet(Transformer.transform_nodes(Transformer::ChangedNode, trs, options))

          if node_head && (head_row = node_head.at('tr')) && node_body
            head_row.inner_html = header_html
            node_body.children = new_rows
          else
            head_row = Nokogiri::XML::Node.new('tr', node.document)
            head_row.inner_html = header_html
            if node_body
              node_body.children = head_row
              node_body << new_rows
            else
              node.children = head_row
              node << new_rows
            end
          end

          head_rows = ProseDiff::Node.NodeSet(Transformer.transform_nodes(Transformer::ChangedNode, [head_row], options))
          head_row.replace(head_rows.first) if head_rows.first != head_row

          node

        end

        def clean_up(node, options)

          node.css('th,td,tr').each do |element|
            element.remove_attribute('data-github-row-index')
            element.remove_attribute('data-github-column-index')
          end

          node.children = ProseDiff::Node.NodeSet(
            Transformer.transform_nodes(:after_diff, node.children, options)
          )

          node

        end

      end
    end
  end
end
