$:.unshift File.expand_path("../../lib", __FILE__)

require "octolytics"

# TODO: 2377 was hardcoded for local testing against some Pond data. It's https://github.com/technoweenie/acts_as_versioned
repository_id = ARGV[0] || 2377
client = Octolytics::Pond.new(:secret => "javasux", :url => "http://pond.dev")

puts "Repo hourly traffic counts"
puts "================================"
p client.counts(repository_id).data

puts
puts "Referring traffic"
puts "================================"
p client.referrers(repository_id).data

puts
puts "Top paths for Google referrals"
puts "================================"
p client.referrer_paths(repository_id, 'Google').data

puts
puts "Top content paths"
puts "================================"
p client.content(repository_id).data
