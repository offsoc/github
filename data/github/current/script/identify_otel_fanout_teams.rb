# typed: true
# frozen_string_literal: true
#!/usr/bin/env ruby
#/ Usage: ruby identify-otel-fanout-teams.rb
#/ Generate a list of codoenwer teams that must do monolith OTel fanout work
#/ becaues they own files that make calls to the specified logger.
#/ Specified logger defaults to `GitHub::Logger`.

require_relative "../lib/logger_tracker"
require_relative "../lib/logger_tracker/result"
require_relative "../lib/logger_tracker/codeowner_identifier"
class ScriptLogger
  def self.log(msg)
    puts msg
  end
end

local = true

puts "Generating list of teams that own files that make calls to GitHub::Logger"
codeowner_identifier = LoggerTracker::CodeownerIdentifier.new
teams = codeowner_identifier.list_unique_codeowner_teams
puts "Found #{teams.size} unique teams"
puts "################################################################################"
puts "Looking for logger calls for each team..."
results = codeowner_identifier.logger_calls_for_teams(teams, ScriptLogger, local)
puts "################################################################################"
puts "Found #{results.keys.length} teams owning files that make calls to GitHub::Logger:"
puts results.keys
puts "################################################################################"
puts "Map of teams and files that make calls to GitHub::Logger:"
results.each do |team, result|
  puts "- Team: #{team}"
  puts "  - file count:  #{result[:file_count]}"
  puts "  - files: "
  result[:files].each do |file|
    puts "    - #{file}"
  end
end
