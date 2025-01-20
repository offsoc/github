# frozen_string_literal: true

require "shellwords"

Bundler::Plugin.add_hook(Bundler::Plugin::Events::GEM_AFTER_INSTALL_ALL) do |dependencies|
  next if (
    ENV["BOOTSTRAPPING"] ||
    ENV["GITHUB_SKIP_RBI"] ||
    ENV["ENTERPRISE"] ||
    ENV["RAILS_ENV"] == "production"
  )

  END {
    bold = "\e[1m"
    reset = "\e[22m"

    puts
    puts "#{bold}**********************************************"
    puts "Attempting to automatically rebuild RBI files."
    puts "Please report any issues to #sorbet in Slack."
    puts "**********************************************#{reset}"
    puts

    ENV["GITHUB_SKIP_BOOTSTRAP_CACHE_CHECK"] = "true"

    tapioca_path = File.expand_path("../../../bin/tapioca", __FILE__)
    system "#{Shellwords.escape(tapioca_path)} gem"

    puts
    puts "#{bold}**********************************************"
    puts "RBI generation complete! Back to bundler."
    puts "**********************************************#{reset}"
    puts
  }
end
