$:.unshift File.expand_path("../../lib", __FILE__)

require "pp"
require "octolytics/metrics"

# truncate if you want...
# system("~/github/metrics-api/script/dbtruncate")

metrics = Octolytics::Metrics.new({
  secret: "javasux",
  logger: $stdout,
})

puts "*" * 50
puts "Creating metrics"

metrics.create({
  name: "large_organizations",
  label: "Large organizations",
  prose: "Orgs. That are large.",
  units: "what goes here",
  source: "https://inc.githubapp.com/initiatives/businesses/#large-organizations",
})

metrics.create({
  name: "new_organizations",
  label: "New organizations",
  prose: "Orgs. That are new.",
  units: "what goes here",
  source: "https://inc.githubapp.com/initiatives/businesses/#new-organizations",
})
puts "\n\n"

puts "*" * 50
puts "All metrics"
metrics.metrics
puts "\n\n"

puts "*" * 50
puts "Loading metric data"
metrics.load([
  {name: "large_organizations", measurement: 887, timestamp: Time.utc(2014, 3, 3).to_i * 1_000},
  {name: "large_organizations", measurement: 877, timestamp: Time.utc(2014, 2, 24).to_i * 1_000},
  {name: "large_organizations", measurement: 860, timestamp: Time.utc(2014, 2, 17).to_i * 1_000},
  {name: "large_organizations", measurement: 859, timestamp: Time.utc(2014, 2, 10).to_i * 1_000},
  {name: "large_organizations", measurement: 859, timestamp: Time.utc(2014, 2, 3).to_i * 1_000},
  {name: "large_organizations", measurement: 839, timestamp: Time.utc(2014, 1, 27).to_i * 1_000},

  {name: "new_organizations", measurement: 5833, timestamp: Time.utc(2014, 3, 3).to_i * 1_000},
  {name: "new_organizations", measurement: 5862, timestamp: Time.utc(2014, 2, 24).to_i * 1_000},
  {name: "new_organizations", measurement: 5590, timestamp: Time.utc(2014, 2, 17).to_i * 1_000},
  {name: "new_organizations", measurement: 5380, timestamp: Time.utc(2014, 2, 10).to_i * 1_000},
  {name: "new_organizations", measurement: 4951, timestamp: Time.utc(2014, 2, 3).to_i * 1_000},
  {name: "new_organizations", measurement: 5448, timestamp: Time.utc(2014, 1, 27).to_i * 1_000},
])
puts "\n\n"

puts "*" * 50
puts "Querying metric data"
metric_names = [
  "large_organizations",
  "new_organizations",
]
response = metrics.query_weekly(metric_names, from: "-5w", day_of_week: 1)
puts "\n\n"

puts "*" * 50
puts "Finding metrics"
metrics.find("new_organizations")
metrics.find("large_organizations")
puts "\n\n"

# milli based query
to = Time.utc(2014, 3, 3).to_i * 1_000
from = Time.utc(2014, 1, 27).to_i * 1_000

pp metrics.query_weekly(["large_organizations", "new_organizations"], {
  from: from,
  to: to,
  day_of_week: 1,
}).data
