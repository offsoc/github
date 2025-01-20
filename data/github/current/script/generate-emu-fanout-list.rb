#!/usr/bin/env ruby
# frozen_string_literal: true

# Generates a count of emu test mode skips per service.
# Optionally takes a service name to generate a full list of paths, otherwise generates a CSV list of services and counts.
# Usage:
# `bin/generate-emu-fanout-list.rb` to generate a full count for all services
# `bin/generate-emu-fanout-list.rb <service name>` to generate a list of all files for the given service

require_relative "../lib/github/serviceowners"
require "yaml"
require "optparse"

def parse_args(args)
  options = {}
  OptionParser.new do |opts|
    opts.banner = "Usage: bin/generate-emu-fanout-list.rb <t|team|s|service|c|csv|f|files|help> [OPTIONS]"

    opts.on("-t=TEAM", "--team=TEAM", "Team to filter emu fanout files for") do |arg|
      options[:team] = arg
    end

    opts.on("-s=SERVICE", "--service=SERVICE", "Service to filter emu fanout files for") do |arg|
      options[:service] = arg
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

class SkippedEmuTestsServiceOwnershipChecker
  def initialize(service: nil, team: nil, csv: false, detail: false, print_files: false)
    @service = service
    @team = team
    @csv = csv
    @detail = detail
    @print_files = print_files
    @owners = GitHub::Serviceowners.new
    @service_and_teams = Hash.new
    @total_skipped_count = 0
    @service_mappings = YAML.load(File.read("config/service-mappings.yaml"))["services"]
  end

  def run
    if @detail
      STDERR.puts "get the total number of tests in each file"
      # get the total number of tests in each file
      files_with_number_of_tests = files_to_h(test_files_with_skips(grep_str: "test \\\""))
      files_with_number_of_def_tests = files_to_h(test_files_with_skips(grep_str: "def test_"))
      test_counts_by_file = merge_files(files_with_number_of_tests, files_with_number_of_def_tests)

      STDERR.puts "get number of context and class in each file"
      # get number of context and class in each file, will be used later for a hauristic
      files_with_context = files_to_h(test_files_with_skips(grep_str: "context .*"))
      files_with_class = files_to_h(test_files_with_skips(grep_str: "class .*"))

      STDERR.puts "get number of valid skips that have been added to files"
      # get number of valid skips that have been added to files
      files_with_skipped_tests_or_classes = files_to_h(test_files_with_skips(grep_str: "skip_with_all_emus"))
      files_with_skipped_tests = files_to_h(test_files_with_skips(grep_str: "test.*skip_with_all_emus: true"))
      files_with_skipped_context = files_to_h(test_files_with_skips(grep_str: "context .*skip_with_all_emus: true"))
      files_with_skipped_in_comment = files_to_h(test_files_with_skips(grep_str: " *\\# skip_with_all_emus .*"))

      files_with_skipped_classes = sub_files(files_with_skipped_tests_or_classes, files_with_skipped_tests)
      files_with_skipped_classes = sub_files(files_with_skipped_classes, files_with_skipped_context)
      files_with_skipped_classes = sub_files(files_with_skipped_classes, files_with_skipped_in_comment)

      STDERR.puts "get number of temporary skips that have been added to files"
      # get number of temporary skips that have been added to files
      files_with_temp_skipped_tests_or_classes = files_to_h(test_files_with_skips(grep_str: "temporarily_skip_until_audited_in_emu_fanout_initiative"))
      files_with_temp_skipped_tests = files_to_h(test_files_with_skips(grep_str: "test.*temporarily_skip_until_audited_in_emu_fanout_initiative: true"))
      files_with_temp_skipped_context = files_to_h(test_files_with_skips(grep_str: "context .*temporarily_skip_until_audited_in_emu_fanout_initiative: true"))

      files_with_temp_skipped_classes = sub_files(files_with_temp_skipped_tests_or_classes, files_with_temp_skipped_tests)
      files_with_temp_skipped_classes = sub_files(files_with_temp_skipped_classes, files_with_temp_skipped_context)

      file_counts_per_team = {}
      # process files and create a hash per team
      test_counts_by_file.each do |path, test_count|
        _, owning_team = get_service_and_team(path)

        file_counts_per_team[owning_team] = { executed: 0, skipped: 0, temporarily_skiped: 0 } if file_counts_per_team[owning_team].nil?

        if files_with_skipped_tests_or_classes[path].nil? && files_with_temp_skipped_tests_or_classes[path].nil?
          file_counts_per_team[owning_team][:executed] += test_count
        else
          skipped, temporarily_skiped = 0, 0
          total_skipped_classes = (files_with_skipped_classes[path] ? files_with_skipped_classes[path] : 0) +
            (files_with_temp_skipped_classes[path] ? files_with_temp_skipped_classes[path] : 0)
          total_skipped_context = (files_with_skipped_context[path] ? files_with_skipped_context[path] : 0) +
            (files_with_temp_skipped_context[path] ? files_with_temp_skipped_context[path] : 0)

          if files_with_skipped_tests_or_classes[path]
            if files_with_skipped_classes[path] && files_with_class[path]
              if files_with_skipped_classes[path] == files_with_class[path]
                skipped = test_count
                test_count = 0
              else
                skipped = (total_skipped_classes * test_count / files_with_class[path]).round
                test_count -= skipped
              end
            elsif files_with_skipped_context[path] && files_with_context[path]
              if files_with_skipped_context[path] == files_with_context[path]
                skipped = test_count
                test_count = 0
              else
                context_skipped = (total_skipped_context * test_count / files_with_context[path]).round
                test_count -= context_skipped
                skipped += context_skipped
              end
            end
          end

          if files_with_temp_skipped_tests_or_classes[path] && files_with_class[path]
            if files_with_temp_skipped_classes[path]
              if files_with_temp_skipped_classes[path] == files_with_class[path]
                temporarily_skiped = test_count
                test_count = 0
              else
                temporarily_skiped = (total_skipped_classes * test_count / files_with_class[path]).round
                test_count -= temporarily_skiped
              end
            elsif files_with_temp_skipped_context[path] && files_with_context[path]
              if files_with_temp_skipped_context[path] == files_with_context[path]
                temporarily_skiped = test_count
                test_count = 0
              else
                context_skipped = (total_skipped_context * test_count / files_with_context[path]).round
                test_count -= context_skipped
                temporarily_skiped += context_skipped
              end
            end
          end

          file_counts_per_team[owning_team][:executed] += test_count
          file_counts_per_team[owning_team][:skipped] += skipped
          file_counts_per_team[owning_team][:temporarily_skiped] += temporarily_skiped
        end
      end

      STDERR.puts ""

      puts "Team,Running Tests,Permanently Skipped,Temporarily Skiped"

      file_counts_per_team = file_counts_per_team.sort.to_h
      total_executed, total_skipped, total_temporarily_skiped = 0, 0, 0
      file_counts_per_team.each do |team, counts|
        puts "#{team},#{counts[:executed]},#{counts[:skipped]},#{counts[:temporarily_skiped] > 0 ? -1 * counts[:temporarily_skiped] : counts[:temporarily_skiped]}"
        total_executed += counts[:executed]
        total_skipped += counts[:skipped]
        total_temporarily_skiped += counts[:temporarily_skiped]
      end
      puts "TOTAL,#{total_executed},#{total_skipped},#{total_temporarily_skiped > 0 ? -1 * total_temporarily_skiped : total_temporarily_skiped}"
    else
      process_files(test_files_with_skips)

      if @csv
        process_files(test_files_with_skips(grep_str: "skip_with_all_emus"), skip_with_all_emus: :skip_with_all_emus)
        print_usage_counts_csv
      elsif @team.present?
        print_team_filenames(@team)
      elsif @service.present?
        print_service_filenames(@service)
      else
        print_usage_counts(@print_files)
      end
    end
  end

  private

  def print_service_filenames(service)
    puts "Files Requiring Audit for Service: #{service}"

    file_list = {}
    @service_and_teams.values.each do |s|
      s[:temporarily_skip].each { |k, v| file_list.merge!(v) if k == service }
    end

    if file_list.empty?
      puts "No files found for team '#{service}'. Congrats!"
      return
    end

    puts "path,skips"
    file_list.each do |file, count|
      puts "#{file},#{count}"
    end
  end

  def print_team_filenames(team)
    puts "Files Requiring Audit for Team: #{team}"

    unless @service_and_teams[team]
      puts "No files found for team '#{team}'. Congrats!"
      return
    end

    puts "path,skips"
    @service_and_teams[team].each do |_key, service_list|
      service_list.each do |_service, files|
        files.each do |file, count|
          puts "#{file},#{count}"
        end
      end
    end
  end

  def print_usage_counts_csv
    temporarily_skip_total = 0
    skip_with_all_emus_total = 0
    @service_and_teams.sort_by { _1.first.to_s }.each do |team, service_list|
      temporarily_skip = service_list[:temporarily_skip] ? -1 * service_list[:temporarily_skip].values.map(&:values).flatten.size : 0
      skip_with_all_emus = service_list[:skip_with_all_emus] ? service_list[:skip_with_all_emus].values.map(&:values).flatten.size : 0
      temporarily_skip_total += temporarily_skip
      skip_with_all_emus_total += skip_with_all_emus
      puts "#{team}, #{temporarily_skip}, #{skip_with_all_emus}"
    end
    puts "TOTAL, #{temporarily_skip_total}, #{skip_with_all_emus_total}"
  end

  def print_usage_counts(print_files)
    puts "TOTAL REMAINING USAGE"
    puts "TOTAL SKIPS: #{@total_skipped_count}"
    puts "TOTAL FILES: #{@total_file_count}"

    puts "TOTAL SKIPS PER SERVICE"
    puts "service,skips"

    @service_and_teams.sort_by { _1.first.to_s }.each do |team, service_list|
      puts "TEAM FILE TOTAL: #{team}, #{service_list[:temporarily_skip].values.map(&:values).flatten.size}"
      service_list[:temporarily_skip].each do |service, files|
        if service == "none"
          puts "Unowned files"
          puts files.keys.flatten.join("\n")
          puts "\n"
        end

        skip_count = files.values.sum

        puts "#{service},#{skip_count}"
        puts files.keys.flatten.join("\n") if print_files
      end
    end
  end

  def file_path(path)
    Pathname(path).realpath.to_s.delete_prefix("#{Rails.root}/")
  end

  def add_path(path, count, skip_with_all_emus)
    service, owning_team = get_service_and_team(path)
    @service_and_teams[owning_team] ||= Hash.new
    @service_and_teams[owning_team][skip_with_all_emus] ||= Hash.new
    @service_and_teams[owning_team][skip_with_all_emus][service] ||= Hash.new(0)
    @service_and_teams[owning_team][skip_with_all_emus][service][path] = count
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

  def test_files_with_skips(grep_str: "temporarily_skip_until_audited_in_emu_fanout_initiative")
    files = `grep "#{grep_str}" -c -r --exclude-dir=sorbet --exclude-dir=script --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor --exclude-dir=tmp --exclude-dir=fixtures --exclude-dir=test_helpers -s . | grep -v ':0$'`

    files.strip.split("\n")
  end

  def process_files(files, skip_with_all_emus: :temporarily_skip)
    @total_file_count = files.size
    files.each do |file|
      count = file.match(/:(\d+)$/)[1].to_i
      @total_skipped_count += count
      file = file.gsub(/:\d+$/, "")
      path = file_path(file)
      next if path.match(__FILE__)
      add_path(path, count, skip_with_all_emus)
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
checker = SkippedEmuTestsServiceOwnershipChecker.new(**options)
checker.run
