# typed: false
# frozen_string_literal: true

require "base64"

module DX
  module Actions
    Job = Struct.new(:name, :group, :status, :runtime, :start, :end, keyword_init: true)
    Build = Struct.new(:runtime, :start, :end, keyword_init: true)
    Setup = Struct.new(:runtime, keyword_init: true)
    Test = Struct.new(:runtime, :start, :end, :slop, :failures, :flakes, keyword_init: true)
    Failure = Struct.new(:test_suite, :test_case, :path, :start_line, :end_line, :error, keyword_init: true)

    # This class is responsible for parsing the encoded job output and for putting the data into a structured format.
    # An encoded job report consists of a series of key-value(s) pairs which are separated by `&` characters. The key
    # and value(s) are base64 encoded and separated by `:` characters.
    class JobReport
      attr_reader :job, :build, :setup, :test

      def initialize(job_output)
        entries = process_encoded_job_output(job_output)
        @job = create_job(entries)
        @build = create_build(entries)
        @setup = create_setup(entries)
        @test = create_test(entries)
      end

      def process_encoded_job_output(job_output)
        entries = Hash.new { |h, k| h[k] = [] }
        job_output.split("&") do |entry|
          entry_parts = entry.split(":").map { |part| Base64.decode64(part) }
          entries[entry_parts[0]] << entry_parts[1..-1]
        end
        entries
      end

      def create_job(entries)
        Job.new(
          name: entries["job-name"][0] ? entries["job-name"][0][0] : nil,
          group: entries["job-group"][0] ? entries["job-group"][0][0] : nil,
          status: entries["job-status"][0] ? normalize_status(entries["job-status"][0][0]) : nil,
          runtime: entries["job-runtime"][0] ? entries["job-runtime"][0][0]&.to_f : nil,
          start: entries["job-start"][0] ? entries["job-start"][0][0]&.to_i : nil,
          end: entries["job-end"][0] ? entries["job-end"][0][0]&.to_i : nil
        )
      end

      def normalize_status(status)
        %w(success failure cancelled).include?(status) ? status : "unknown"
      end

      def create_build(entries)
        Build.new(
          runtime: entries["build-runtime"][0] ? entries["build-runtime"][0][0]&.to_f : nil,
          start: entries["build-start"][0] ? entries["build-start"][0][0]&.to_i : nil,
          end: entries["build-end"][0] ? entries["build-end"][0][0]&.to_i : nil
        )
      end

      def create_setup(entries)
        Setup.new(
          runtime: entries["setup-runtime"][0] ? entries["setup-runtime"][0][0]&.to_f : nil
        )
      end

      def create_test(entries)
        Test.new(
          runtime: entries["test-runtime"][0] ? entries["test-runtime"][0][0]&.to_f : nil,
          start: entries["test-start"][0] ? entries["test-start"][0][0]&.to_i : nil,
          end: entries["test-end"][0] ? entries["test-end"][0][0]&.to_i : nil,
          slop: entries["test-slop"][0] ? entries["test-slop"][0][0]&.to_f : nil,
          failures: entries["test-failure"].map { |failure_entries| create_failure(failure_entries) },
          flakes: entries["test-flake"].map { |flake_entries| create_failure(flake_entries) }
        )
      end

      def create_failure(failure_entries)
        Failure.new(
          test_suite: failure_entries[0],
          test_case: failure_entries[1],
          path: failure_entries[2],
          start_line: failure_entries[3],
          end_line: failure_entries[4],
          error: failure_entries[5]
        )
      end
    end
  end
end
