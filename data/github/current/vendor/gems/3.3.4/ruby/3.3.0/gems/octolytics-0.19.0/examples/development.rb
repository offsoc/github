$:.unshift File.expand_path("../../lib", __FILE__)

require "octolytics"

client = Octolytics::Client.new("github")
response = client.record("testing", {"foo" => "bar", "baz" => "wick"})
p response
p response.status
p response.body
p response.data
