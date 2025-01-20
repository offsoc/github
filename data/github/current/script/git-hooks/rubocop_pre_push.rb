#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

# This script runs during a pre-push git hook. It applies a separate set of RuboCop rules
# and only runs against changed or newly created Ruby files.
#
# The intention is to enable progressive enhancement of our standard RuboCop rules by first enabling a new rule
# for new files only and then later enabling it for all files.

require "serviceowners"
require "open3"
require "optparse"

PRE_PUSH_RUBOCOP_CONFIG = ".rubocop_ci.yml"

options = {}
opts = OptionParser.new do |opts|
  opts.on("-a", "--auto-correct") do
    options[:autocorrect] = true
  end
end.parse!

runtime_data = { base_ref: "origin/master" }
runtime_env = Serviceowners::RuntimeEnv.new(runtime_data)
new_files = if ENV["RUBOCOP_NEW_ONLY"] == "1"
  runtime_env.changed_paths.select(&:created?).map(&:path).select { |f| f.end_with?(".rb") }
else
  runtime_env.changed_paths.map(&:path).select { |f| f.end_with?(".rb") }
end

return if new_files.length == 0

rubocop_err = []
rubocop_command = "bin/rubocop --format quiet --config #{PRE_PUSH_RUBOCOP_CONFIG}"
rubocop_command += " -a" if options[:autocorrect]
rubocop_command += " #{new_files.join(' ')}"

Open3.popen3(rubocop_command) do |_stdin, stdout, _stderr, _thread|
  while line = stdout.gets do
    rubocop_err << line
  end
  STDERR.puts rubocop_err
end
