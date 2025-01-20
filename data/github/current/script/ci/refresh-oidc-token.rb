#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true

require "json"
require "net/http"
require "optparse"
require "uri"

MAX_RETRIES = 3

def parse_args(args)
  options = {}

  parser = OptionParser.new do |opts|
    opts.banner = "Usage: ruby refresh-oidc-token.rb [options]"

    opts.on("-p", "--path PATH", "Filepath to write the refreshed OIDC token to") do |path|
      options[:path] = path
    end

    opts.on("-c", "--config CONFIG", "Path to the Docker config file to update with the OIDC token") do |config|
      options[:config] = config
    end

    opts.on("-h", "--help", "Prints help message") do
      puts opts
      exit
    end
  end

  parser.parse!(args)
  options
end

def fetch_new_oidc_token
  puts("Fetching new OIDC token...")

  base_uri = ENV.fetch("ACTIONS_ID_TOKEN_REQUEST_URL")
  request_params = { "audience": "ang-custom-audience" }

  uri = URI.parse(base_uri)
  uri.query = URI.encode_www_form(request_params)

  request_token = ENV.fetch("ACTIONS_ID_TOKEN_REQUEST_TOKEN")
  request_headers = {
    "User-Agent": "actions/oidc-client",
    "Authorization": "Bearer #{request_token}"
  }

  request = Net::HTTP::Get.new(uri, request_headers)
  request_options = { use_ssl: uri.scheme == "https" }

  retries = 0

  while retries <= MAX_RETRIES
    response = Net::HTTP.start(uri.hostname, uri.port, request_options) do |http|
      http.request(request)
    end

    if response.code == "200"
      puts("Success: #{response.code}")
      parsed_response = JSON.parse(response.body)
      return parsed_response["value"]
    else
      puts("Error: #{response.code}. Response: #{response.body}")
      retries += 1
      sleep(2)
    end
  end

  puts("Failed to fetch OIDC token despite #{MAX_RETRIES} retries")
  nil
end

def parse_docker_config(config_file)
  output = File.read(config_file)
  JSON.parse(output)
end

def update_docker_config_with_new_token(config_file, config_hash, oidc_token)
  config_hash["HttpHeaders"]["X-Meta-X-Ang-Authentication"] = oidc_token

  File.open(config_file, "w") do |f|
    f.write(JSON.pretty_generate(config_hash))
  end
end

oidc_token = fetch_new_oidc_token

if oidc_token.nil?
  puts("Did not successfully request an OIDC token")
  exit(1)
end

parsed_args = parse_args(ARGV)

token_filepath = parsed_args[:path]

if token_filepath
  puts("Writing refreshed oidc token to #{token_filepath}")
  File.open(token_filepath, "w") { |file| file.write(oidc_token) }
end

docker_config_file = parsed_args[:config]

if docker_config_file
  puts("Updating Docker config with new OIDC token")
  config_hash = parse_docker_config(docker_config_file)
  update_docker_config_with_new_token(docker_config_file, config_hash, oidc_token)
end
