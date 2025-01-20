#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

# This script submits a snapshot with one or more sample dependencies to
#  dependency-snapshots-api, via dependency-graph-api. This is useful for
#  locally testing out end-to-end snapshot workflows, and not much else.

# Requirements:
#   * dependency-graph-api must be running locally on port 9596 (codespace-compose is fine)
#   * dependency-snapshots-api must be running and reachable by dependency-graph-api
#   * all relevant feature flags must be enabled
#   * not a requirement, but it's probably best to use a repository created by ./script/create_dependabot_example_vulnerable_repo.rb
#
# Usage:
# ./script/create_dependabot_example_vulnerabilities.rb monalisa/vulnerable-repo-1650039814
#    -or-
# ./script/create_dependabot_example_vulnerabilities.rb monalisa/vulnerable-repo-1650039814 "pkg:gem/rails@1.2.3"

require_relative "../config/environment"
require_relative "create-dependabot-github-app"
require_relative "create_dependabot_example_vulnerabilities"

unless Rails.env.development?
  abort "This can only be run in development"
end

def create_snapshot(repo, purls: [])
  client = DependencySnapshot::DependencySnapshotClient.new
  ref = "refs/heads/#{repo.default_branch}"
  sha = repo.ref_to_sha(ref)

  body = {
    version: 0,
    sha: sha,
    ref: ref,
    job: {
      correlator: "script",
      id: "0"
    },
    detector: {
      name: "create-dependabot-example-repo-with-snapshot",
      version: "0.0.1",
      url: "http://example.com"
    },
    scanned: Time.now.utc,
    manifests: {
      "Gemfile" => {
        name: "Gemfile",
        file: {
          source_location: "Gemfile",
        },
        resolved: {}
      }
    }
  }

  purls.each do |purl|
    body[:manifests]["Gemfile"][:resolved][purl] = {
      package_url: purl
    }
  end

  GitHub.dependency_graph_api_url = "http://127.0.0.1:9596/query"
  GitHub.dependency_graph_api_slow_query_url = "http://127.0.0.1:9596/query"

  begin
    client.create_dependency_snapshot(
      repository_id: repo.id,
      repository_nwo: repo.nwo,
      repository_public: repo.public,
      repository_owner_id: repo.owner.id,
      req_body: body# .to_json
    )
  rescue StandardError => e # rubocop:todo Lint/GenericRescue
    puts "Failed to create snapshot for #{repo.nwo}: #{e.message}"
    puts "Perhaps the dependency-graph-api and/or dependency-snapshots-api service is not running?"
    exit 1
  end
end

def usage
  puts "Usage: #{File.basename(__FILE__)} nwo [package_url] [package_url] ..."
  puts "If no package urls are provided, a default package url is used."
  exit 1
end

def main
  nwo = ARGV[0]
  purls = ARGV[1..-1]

  return usage if nwo.nil?
  if purls&.empty?
    purls = ["pkg:gem/fails@1.2.3"]
  end
  unless nwo.include? "/"
    nwo = "monalisa/#{nwo}"
  end
  owner, name = nwo.split("/")

  repo = Repository.find_by!(name: name, owner_login: owner)
  result = create_snapshot(repo, purls: purls)
  puts "Snapshot created: #{result}"

  exit 0
end

if __FILE__ == $0
  main
end
