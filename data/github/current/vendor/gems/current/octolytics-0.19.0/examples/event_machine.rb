$:.unshift File.expand_path("../../lib", __FILE__)

require "octolytics"
require "octolytics/adapters/em"

Signal.trap("INT") { EM.stop }

EM.run do
  puts "Making request, ctrl + c to stop...\n\n"

  client = Octolytics::Client.new("github", {
    environment: "development",
    secret: "...",
    adapter: Octolytics::Adapters::EM.new,
  })

  client.record("testing", {"foo" => "bar", "baz" => "wick"}).callback { |response|
    puts "response: #{response.inspect}"
    EM.stop
  }.errback { |error|
    puts "error: #{error.inspect}"
    EM.stop
  }
end
