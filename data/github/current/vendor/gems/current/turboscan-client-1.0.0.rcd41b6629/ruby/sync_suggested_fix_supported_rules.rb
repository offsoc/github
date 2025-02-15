#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"

root_dir = File.expand_path("../", __dir__)
path = Dir.glob("#{root_dir}/ts/cocofix/.rule_coverages.json").first
output_path = "#{__dir__}/lib/turboscan/suggested_fix.rb"

supported_rules = File.read(path).scan(/"([^"]+)"/).flatten

File.open(output_path, "w") do |file|
  file.write <<~RUBY
    # frozen_string_literal: true

    # Code generated by #{File.basename(__FILE__)}, DO NOT EDIT.

    module Turboscan
      module SuggestedFix
        # rubocop:disable Metrics/CollectionLiteralLength
        SUPPORTED_RULES = %w[
          #{supported_rules.join("\n      ")}
        ].freeze
        # rubocop:enable Metrics/CollectionLiteralLength
      end
    end
  RUBY
end
