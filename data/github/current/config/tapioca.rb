# typed: strict
# frozen_string_literal: true

$stdout.print "\n  Loading GitHub environment ... "

# Disable the debug gem, otherwise when Tapioca loads it the process will
# never exit.
ENV["RUBY_DEBUG_ENABLE"] = "0"

# Load `database.yml`: our heavy use of `connect_to` means that Tapioca
# won't be able to load model files without the database configuration being
# available. However, we don't want to load the full environment here, because
# doing so will result in references to application code in Gem RBI files.
require File.expand_path("../../lib/github/config/mysql", __FILE__)
GitHub.load_activerecord

# Ensure the correct KV version is loaded.
require File.expand_path("../../lib/github/config/kv", __FILE__)

Failbot.disable

$stdout.puts "Ready!"
