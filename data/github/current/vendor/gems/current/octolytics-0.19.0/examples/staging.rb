$:.unshift File.expand_path("../../lib", __FILE__)

require "octolytics"

client = Octolytics::Client.new("github", secret: "821f917501aa3ae08dfc78d480131d88", environment: "staging")
response = client.record("testing", {"foo" => "bar", "baz" => "wick"})
p response
p response.data
