# typed: false
# frozen_string_literal: true

module DX
  module Actions
    # This module contains some helper methods to generate markdown content specifically for the CI Report.
    module Markdown
      def self.section(title:, level: 2, open: false, blockquote: false, &block)
        puts "<details#{open ? " open" : ""}><summary><h#{level}>#{title}</h#{level}></summary>#{blockquote ? "<blockquote>" : ""}"
        puts ""
        block.call
        puts ""
        puts "#{blockquote ? "</blockquote>" : ""}</details>"
        puts ""
      end

      def self.alert(type: "NOTE", message:)
        puts "> [!#{type}]"
        message.split("\n") do |line|
          puts "> #{line}"
        end
        puts ""
      end

      def self.green_circle
        ":green_circle:"
      end

      def self.red_circle
        ":red_circle:"
      end

      def self.orange_circle
        ":orange_circle:"
      end

      def self.white_circle
        ":white_circle:"
      end
    end
  end
end
