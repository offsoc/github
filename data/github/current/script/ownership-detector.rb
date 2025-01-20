#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true

require "serviceowners"
require "./test/test_helpers/github_test/parallelization_alternative/test_stats/test_stats"

class OwnershipDetector
  TEST_DIRECTORIES = ["test/", "packages/*/test/**"]
  TEST_PATTERN = /^(test\/|packages\/[^\/]+\/test\/).*_test\.rb$/
  UNSUPPORTED_TEST_PATTERN = /test\/(meta|system|test_helpers|fixtures|fast)/
  # This is a sentinel value returned when no tests should be run.
  NOOP = "__noop__"

  SERVICE_ORGS = "code-to-cloud,collaboration-core,core-productivity," \
    "customer-success,data-and-security-products,design,developer-experience," \
    "ecoss,education-and-chatops,enterprise-and-infrastructure,git-systems," \
    "octoservices,packaging,planning-and-tracking,platform," \
    "production-engineering,revenue,security,security-products,unowned"

  def initialize(include_pattern: nil, exclude_pattern: nil, test_pattern: nil)
    @include_pattern = include_pattern || TEST_PATTERN
    @exclude_pattern = exclude_pattern || UNSUPPORTED_TEST_PATTERN
    @test_pattern = Regexp.new(test_pattern) if test_pattern
  end

  def tests_for_org(org)
    tests_for_org = test_ownership[org]
    if tests_for_org.nil?
      if test_ownership.size == 0
        # As a sanity-check, we make sure that at least one org has some tests. This guards against cases where the ownership detector is completely broken and not finding any tests.
        raise "No tests found for any owner!"
      end
      return NOOP
    end
    tests_for_org.join(" ")
  end

  def list_all_orgs
    test_ownership.keys.sort
  end

  def ownership_stats
    total = 0.0
    sorted_ownership_counts = test_ownership.sort_by { |_k, v| total += v.length ; -v.length }
    puts "Test file counts by org"
    puts
    sorted_ownership_counts.each do |(owner, files)|
      count = files.length
      percentage = (count.to_f / total * 100.0).round(2)
      puts "#{owner.to_s.ljust(40)} #{count.to_s.rjust(5)} (#{percentage}%)"
    end

    puts "Total # of orgs: #{sorted_ownership_counts.length}"
    puts "Total # of test files: #{total.to_i}"
  end

  def ownership_metrics
    metrics = {
      total: 0,
      total_owners: 0,
      ownership: [],
    }

    test_ownership.each do |owner, files|
      metrics[:total] += files.length
      metrics[:total_owners] += 1
      metrics[:ownership] << [owner, files.count]
    end

    metrics
  end

  def tests_by_maintainer
    return @tests_by_maintainer if defined?(@tests_by_maintainer)

    @tests_by_maintainer = {}
    TEST_DIRECTORIES.each do |test_directory|
      GitHub::Serviceowners.git_files(test_directory).each do |test_file|
        if matches_test_pattern?(test_file)
          spec = serviceowners.spec_for_path(test_file)
          group = spec&.service&.maintainers&.name || "unowned"

          @tests_by_maintainer[group] ||= []
          @tests_by_maintainer[group].push(test_file)
        end
      end
    end

    @tests_by_maintainer.stringify_keys!
  end

  private

  def serviceowners
    @serviceowners ||= Serviceowners::Main.new
  end

  def matches_test_pattern?(file)
    file.match?(@include_pattern) && !file.match?(@exclude_pattern) && (!@test_pattern.present? || file.match?(@test_pattern))
  end

  def group_for_file(file)
    group = if ENV["EVENLY_DISTRIBUTE_ORG_TESTS"]
      # Try to evenly distribute files using an existing sorted list of test file durations.
      # This is to try to ensure we spread out slow test files consistently across different
      # builds with a fallback being the hash of the path. We want to always run the same
      # exact set of tests across rebuilds to we need locations for test files are guaranteed
      # to be consistent
      location = test_paths_sorted_by_duration.find_index(file)
      location ||= Digest::SHA256.hexdigest(file).to_i(16)
      bucket = location % group_names_for_even_distribution.size
      group_names_for_even_distribution[bucket]
    else
      spec = serviceowners.spec_for_path(file)
      spec&.service&.maintainers&.org_name
    end

    group || "unowned"
  end

  def test_ownership
    return @test_ownership if defined?(@test_ownership)
    @test_ownership = ENV["DISTRIBUTE_TEST_FILES"] == "true" ? get_distributed_test_ownership : get_legacy_test_ownership
  end

  def get_distributed_test_ownership
    test_files = get_matching_test_files
    test_file_durations = get_test_file_durations(test_files)
    partitioned_test_files = partition_test_files(test_files, test_file_durations, group_names_for_even_distribution.size)
    partitioned_test_files.each_with_index.map { |files, index| [group_names_for_even_distribution[index], files] }.to_h
  end

  def get_matching_test_files
    test_files = TEST_DIRECTORIES.map { |test_directory| GitHub::Serviceowners.git_files(test_directory).to_a }.flatten
    test_files.select { |test_file| matches_test_pattern? test_file }
  end

  def get_test_file_durations(test_files)
    stats = GitHubTest::ParallelizationAlternative::TestStats.load_from_file
    test_file_durations = stats.group_by { |stat| stat[:path] }.transform_values { |results| results.sum { |result| result[:duration] } }
    files_without_duration = test_files - test_file_durations.keys
    # Set a default duration for files that don't have a duration.
    files_without_duration.each { |file| test_file_durations[file] = 30.0 }
    test_file_durations
  end

  def partition_test_files(test_files, test_file_durations, parts)
    partitioned_files = Array.new(parts) { [] }
    durations = Array.new(parts, 0.0)
    test_files.sort_by { |file| test_file_durations[file] }.reverse_each do |test_file|
      # Distribute the file to the array with the shortest duration so far.
      _, index = durations.each_with_index.min
      index = T.must(index)
      partitioned_files[index] << test_file
      durations[index] += test_file_durations[test_file]
    end
    partitioned_files
  end

  def get_legacy_test_ownership
    test_ownership = {}
    TEST_DIRECTORIES.each do |test_directory|
      GitHub::Serviceowners.git_files(test_directory).each do |test_file|
        if matches_test_pattern? test_file
          group = group_for_file test_file

          test_ownership[group] ||= []
          test_ownership[group].push(test_file)
        end
      end
    end
    test_ownership
  end

  def group_names_for_even_distribution
    return @group_names_for_even_distribution if defined?(@group_names_for_even_distribution)

    @group_names_for_even_distribution = ENV.fetch("GROUPS_FOR_EVEN_TEST_DISTRIBUTION", SERVICE_ORGS).split(",")
  end

  def test_paths_sorted_by_duration
    return @test_paths_sorted_by_duration if defined?(@test_paths_sorted_by_duration)

    stats = GitHubTest::ParallelizationAlternative::TestStats.load_from_file
    path_results = stats.group_by { |stat| stat[:path] }
    @test_paths_sorted_by_duration = path_results.keys.sort_by do |path|
      -path_results.fetch(path).sum { |results| results[:duration] }
    end
  end
end
