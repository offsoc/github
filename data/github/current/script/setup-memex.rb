#!/usr/bin/env safe-ruby
# frozen_string_literal: true

require "optparse"
require "json"
require "sorbet-runtime"
require "./app/helpers/memex_assets_helper"
require "./app/helpers/memexes_helper"
require_relative "../config/environment"
include MemexesHelper

# setting default values for variables
options = {
  all_features: false,
}

OptionParser.new do |opt|
  opt.on("-af", "Enable all Memex feature flags for 'monalisa' user.") { |_o| options[:all_features] = true }
  opt.on("--all-features") { |_o| options[:all_features] = true }
end.parse!

if options[:all_features]
  all_feature_flags = ""

  if MemexesHelper::MEMEX_CLIENT_FEATURE_FLAGS.any?
    all_feature_flags += " -F " + MemexesHelper::MEMEX_CLIENT_FEATURE_FLAGS.join(" -F ")
  end

  # Finding memex server feature flags
  if MemexesHelper::MEMEX_BACKEND_FEATURE_FLAGS.any?
    all_feature_flags += " -F " + MemexesHelper::MEMEX_BACKEND_FEATURE_FLAGS.join(" -F ")
  end

  # Finding memex feature previews
  if MemexesHelper::MEMEX_FEATURE_PREVIEWS.any?
    all_feature_flags += " -F " + MemexesHelper::MEMEX_FEATURE_PREVIEWS.join(" -F ")
  end

  system("bin/toggle-feature-flag enable #{all_feature_flags}")
  if MemexesHelper::MEMEX_FEATURE_PREVIEWS.any?
    puts "Enable memex feature previews"
    MemexesHelper::MEMEX_FEATURE_PREVIEWS.each do |flag|
      puts "=> #{flag} feature preview found" && next if Feature.find_by(slug: flag)
      Feature.create(
        public_name: flag.to_s,
        slug: flag,
        flipper_feature: FlipperFeature.find_by(name: flag),
        feedback_link: "https://github.com",
        enrolled_by_default: true
      )
      puts "=> #{flag} feature preview enabled"
    end
  end
end


puts
puts
puts "✅ Memex is set up!"
puts
puts "From '/workspaces/github':"
puts "  - Start the dotcom server: script/server"
puts "  - Seed some project data: bin/seed memex_projects --p50"
