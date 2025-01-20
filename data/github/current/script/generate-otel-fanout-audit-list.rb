#!/usr/bin/env ruby
# frozen_string_literal: true

# Generates a count of calls using otel attributes per service.
# Optionally takes a service name to generate a full list of paths, otherwise generates a CSV list of services and counts.
# Usage:
# `bin/generate-otel-fanout-audit-list.rb` to generate a full count for all services
# `bin/generate-otel-fanout-audit-list.rb <service name>` to generate a list of all files for the given service

require_relative "../lib/github/serviceowners"
require "yaml"
require "optparse"

MODES = %w(failbot traces logging)

# What to search for based on the mode
FAILBOT = %w(Failbot)
TRACES = %w(span.add_attributes span.set_attribute span.add_event in_span)
# Auditing GitHub.logger because that was migrated to during a previous otel semantic conventions fanout
# https://thehub.github.com/epd/engineering/products-and-services/dotcom/monolith-observability/semantic-logging-migration-guide/#migration-overview
LOGGING = %w(GitHub.logger)


def parse_args(args)
  options = {}
  OptionParser.new do |opts|
    opts.banner = "Usage: bin/generate-otel-fanout-audit-list.rb <t|team|s|service|c|csv|f|files|help> [OPTIONS]"

    opts.on("-t=TEAM", "--team=TEAM", "Team to filter otel fanout files for. Pass flag multiple times to filter for multiple teams.") do |arg|
      options[:teams] ||= []
      options[:teams] << arg
    end

    opts.on("-s=SERVICE", "--service=SERVICE", "Service to filter otel fanout files for. Pass flag multiple times to filter for multiple services.") do |arg|
      options[:services] ||= []
      options[:services] << arg
    end

    opts.on("-m=MODE, --mode=MODE", "Mode to run in: #{MODES.join(", ")}. Default: failbot") do |arg|
      raise "Invalid mode: #{arg}. Possible modes: #{MODES.join(", ")}" unless MODES.include?(arg.downcase)
      options[:mode] = arg.downcase
    end

    opts.on("-g=GREP_FOR", "--grep=GREP_FOR", "String to grep for in files. Pass flag multiple times to grep for multiple strings. When provided, uses 'custom' mode. Examples: -g logger -g Failbot}") do |arg|
      options[:grep_for] ||= []
      options[:grep_for] << arg
    end

    opts.on("-c", "--csv", "Export short version as csv file") do
      options[:csv] = true
    end

    opts.on("-f", "--files", "Prints a list of files along with counts for all teams") do
      options[:print_files] = true
    end

    opts.on("-d", "--detail", "Prints a list of files along with detail counts for all teams") do
      options[:detail] = true
    end

    opts.on("-h", "--help", "Prints this help") do
      puts opts
      exit 1
    end.parse!(args)
  end

  options
end

class OtelAuditServiceOwnershipChecker
  def initialize(services: [], teams: [], mode: nil, grep_for: [], csv: false, detail: false, print_files: false)
    @services = services
    @teams = teams
    @csv = csv
    @mode = grep_for.present? ? "custom" : mode || "failbot"
    @grep_for = grep_for.present? ? grep_for : @mode.upcase.constantize
    @detail = detail
    @print_files = print_files
    @owners = GitHub::Serviceowners.new
    @service_and_teams = Hash.new
    @total_mode_count = 0
    @service_mappings = YAML.load(File.read("config/service-mappings.yaml"))["services"]
  end

  def run
    puts "Running in #{@mode} mode"
    puts "Searching for: #{@grep_for.join(", ")}"

    if @detail
      STDERR.puts "get the total number of files using #{@mode} mode"
      # get the total number of tests in each file
      files_with_mode = files_to_h(files_with_otel)

      file_counts_per_team = {}
      # process files and create a hash per team
      files_with_mode.each do |path, count|
        _, owning_team = get_service_and_team(path)

        file_counts_per_team[owning_team] = { "#{@mode}": 0 } if file_counts_per_team[owning_team].nil?
        file_counts_per_team[owning_team][@mode.to_sym] += count
      end

      STDERR.puts ""

      puts "Team,#{@mode} calls"

      file_counts_per_team = file_counts_per_team.sort.to_h
      total_calls = 0
      file_counts_per_team.each do |team, counts|
        puts "#{team},#{counts[@mode.to_sym]}"
        total_calls += counts[@mode.to_sym]
      end
      puts "TOTAL,#{total_calls}"
    else
      process_files(files_with_otel)

      if @csv
        print_usage_counts_csv
      elsif @teams.present?
        print_team_filenames(@teams)
      elsif @services.present?
        print_service_filenames(@services)
      else
        print_usage_counts(@print_files)
      end
    end
  end

  private

  def print_service_filenames(services)
    puts "Files Requiring Audit for Service: #{services.join(", ")}"

    file_list = {}
    @service_and_teams.values.each do |s|
      s[@mode].each { |k, v| file_list.merge!(v) if services.include?(k) }
    end

    if file_list.empty?
      puts "No files found for service '#{services.join(", ")}'. Congrats!"
      return
    end

    puts "path,#{@mode} calls"
    file_list.each do |file, count|
      puts "#{file},#{count}"
    end
  end

  def print_team_filenames(teams)
    teams.each do |team|
      unless @service_and_teams[team]
        puts "No files found for team '#{team}'. Congrats!"
        next
      end
      puts "Files Requiring Audit for Team: #{team}"
      puts "path,#{@mode} calls"
      @service_and_teams[team]&.each do |_key, service_list|
        service_list.each do |_service, files|
          files.each do |file, count|
            puts "#{file},#{count}"
          end
        end
      end
    end
  end

  def print_usage_counts_csv
    total = 0
    @service_and_teams.sort_by { _1.first.to_s }.each do |team, service_list|
      count = service_list[@mode] ? -1 * service_list[@mode].values.map(&:values).flatten.size : 0
      total += count
      puts "#{team}, #{@mode}"
    end
    puts "TOTAL, #{total}"
  end

  def print_usage_counts(print_files)
    puts "TOTAL REMAINING USAGE"
    puts "TOTAL #{@mode.upcase} USES: #{@total_mode_count}"
    puts "TOTAL FILES: #{@total_file_count}"

    puts "TOTAL #{@mode.upcase} USES PER SERVICE"
    puts "service,#{@mode} uses"

    @service_and_teams.sort_by { _1.first.to_s }.each do |team, service_list|
      puts "TEAM FILE TOTAL: #{team}, #{service_list[@mode].values.map(&:values).flatten.size}"
      service_list[@mode].each do |service, files|
        if service == "none"
          puts "Unowned files"
          puts files.keys.flatten.join("\n")
          puts "\n"
        end

        count = files.values.sum

        puts "#{service},#{count}"
        puts files.keys.flatten.join("\n") if print_files
      end
    end
  end

  def file_path(path)
    Pathname(path).realpath.to_s.delete_prefix("#{Rails.root}/")
  end

  def add_path(path, count, type)
    service, owning_team = get_service_and_team(path)
    @service_and_teams[owning_team] ||= Hash.new
    @service_and_teams[owning_team][type] ||= Hash.new
    @service_and_teams[owning_team][type][service] ||= Hash.new(0)
    @service_and_teams[owning_team][type][service][path] = count
  end

  def get_service_and_team(path)
    service = @owners.service_for_path(path, prefix: true) || "none"
    service = service.gsub("github/", "")
    owning_team = team_for_service(service)
    if (@csv || @detail) && !owning_team
      owning_team = "unowned"
    end

    [service, owning_team]
  end

  def files_with_otel
    files = `grep #{@grep_for.map { |g| "-e \"#{g}\"" }.join(" ")} -c -r --exclude-dir=sorbet --exclude-dir=script --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor --exclude-dir=tmp --exclude-dir=fixtures --exclude-dir=test_helpers -s . | grep -v ':0$'`

    files.strip.split("\n")
  end

  def process_files(files, type: @mode)
    @total_file_count = files.size
    files.each do |file|
      count = file.match(/:(\d+)$/)[1].to_i
      @total_mode_count += count
      file = file.gsub(/:\d+$/, "")
      path = file_path(file)
      next if path.match(__FILE__)
      add_path(path, count, type)
    end
  end

  def files_to_h(files)
    ret_val = {}

    files.each do |file|
      count = file.match(/:(\d+)$/)[1].to_i
      file = file.gsub(/:\d+$/, "")
      path = file_path(file)
      next if path.match(__FILE__)
      ret_val[path] = count
    end

    ret_val
  end

  def merge_files(file_hash1, file_hash2)
    to_add = file_hash2.select { |k, _v| file_hash1[k].nil? }
    to_update = file_hash2.select { |k, _v| file_hash1[k].present? }

    to_update.each { |k, v| file_hash1[k] += v }
    file_hash1.merge(to_add)
  end

  def sub_files(file_hash1, file_hash2)
    file_hash2.each { |k, v| file_hash1[k] -= v if file_hash1[k].present? }
    file_hash1.select { |_k, v| v > 0 }
  end

  def team_for_service(service)
    @service_mappings.dig(service, "team")
  end
end

options = parse_args(ARGV)
checker = OtelAuditServiceOwnershipChecker.new(**options)
checker.run
