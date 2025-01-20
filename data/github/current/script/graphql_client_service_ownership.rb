# typed: true
# frozen_string_literal: true

# Generates a count of graphql-client usage counts per service, broken down by `parse_query` and `fragment` usages.
# Optionally takes a service name to generate a full list of paths, otherwise generates a CSV list of services and counts.
# Usage:
# `bin/safe-ruby script/graphql_client_service_ownership.rb` to generate a full count for all services
# `bin/safe-ruby script/graphql_client_service_ownership.rb <service name>` to generate a list of all files for the given service

require_relative "../lib/github/serviceowners"

class GraphqlServiceOwnershipChecker
  attr_reader :service, :owners, :services

  def initialize(service)
    @service = service
    @owners = GitHub::Serviceowners.new
    @services = Hash.new
    @total_counts = Hash.new(0)
  end

  def run
    process_files(parse_query_files, :parse_query)
    process_files(graphql_fragment_files, :fragment)

    if service.present?
      print_service_filenames(service)
    else
      print_usage_counts
    end
  end

  private

  def print_service_filenames(service)
    puts "GraphQL Files for Service: #{service}"
    @services[service].each do |type, files|
      puts "#{type.upcase} USAGE"
      puts files.keys
    end
  end

  def print_usage_counts
    puts "TOTAL REMAINING USAGE"
    puts "PARSE QUERY: #{@total_counts[:parse_query]}, FRAGMENT: #{@total_counts[:fragment]}"

    puts "TOTAL PER SERVICE"
    puts "service,parse_query,fragment"

    @services.each do |service, files|
      if service == "none"
        puts "Unowned files"
        puts files.values.flatten.join("\n")
        puts "\n"
      end

      parse_query_count = files[:parse_query].values.sum
      fragment_count = files[:fragment].values.sum

      puts "#{service},#{parse_query_count},#{fragment_count}"
    end
  end

  def file_path(path)
    Pathname(path).realpath.to_s.delete_prefix("#{Rails.root}/")
  end

  def add_path(path, type, count)
    service = @owners.service_for_path(path, prefix: true) || "none"
    service = service.gsub("github/", "")
    @services[service] ||= { fragment: Hash.new(0), parse_query: Hash.new(0) }
    @services[service][type][path] += count
  end

  def graphql_fragment_files
    files = `grep "erblint:disable NoGraphqlFragments" -c -r --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor --exclude-dir=tmp --exclude-dir=fixtures -s . | grep -v ':0$'`

    files.strip.split("\n")
  end

  def parse_query_files
    files = `grep "rubocop:todo GitHub/DoNotCallParseQuery" -c -r --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor --exclude-dir=tmp --exclude-dir=fixtures -s . | grep -v ':0$'`

    files.strip.split("\n")
  end

  def process_files(files, type)
    files.each do |file|
      count = file.match(/:(\d+)$/)[1].to_i
      @total_counts[type] += count
      file = file.gsub(/:\d+$/, "")
      path = file_path(file)
      next if path.match(__FILE__)
      add_path(path, type, count)
    end
  end
end

checker = GraphqlServiceOwnershipChecker.new(ARGV[0])
checker.run
