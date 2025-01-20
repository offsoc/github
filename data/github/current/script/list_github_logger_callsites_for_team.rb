# typed: true
# frozen_string_literal: true
#!/usr/bin/env ruby
#/ Usage:
#/ ruby list_github_logger_callsites_for_team.rb @github/team-reviewers
#/ outputs a list of callsites with line numbers
#/ ruby list_github_logger_callsites_for_team.rb @github/team-reviewers --markdown
#/ outputs the list in markdown. Useful for pasting into a GitHub issue.
#/ Generate a list of GitHub::Logger callsites in files owned by that team


require "optparse"

require_relative "../lib/logger_tracker/result"
require_relative "../lib/logger_tracker/presenter"
require_relative "../lib/logger_tracker"

ENV["COMMIT_SHA"] ||= `git rev-parse HEAD`.chomp
options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: ruby list_github_logger_callsites_for_team.rb @github/team-reviewers [options]"

  opts.on("--markdown") do |v|
    options[:markdown] = v
  end
end.parse!

callsites = LoggerTracker.call(owner: ARGV[0], local: true)
if options[:markdown]
  puts LoggerTracker::Presenter.render_callsites_markdown(callsites, ENV["COMMIT_SHA"])
else
  puts callsites.map(&:render)
end
