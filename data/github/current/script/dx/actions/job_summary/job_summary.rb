# typed: false
# frozen_string_literal: true

require_relative "job_report"

require_relative "markdown"

module DX
  module Actions
    FailureEntry = Struct.new(:job_report, :failure, keyword_init: true)

    # This class generates a Markdown summary from all given job reports.
    # Some functionality handling the generation of Markdown has been put into the Markdown module. Depending on
    # how the CI report evolves in the future, it might be a good idea to move more of the Markdown generation logic
    # to that module as well.
    class JobSummary
      def self.generate(encoded_outputs)
        JobSummary.new(encoded_outputs).generate
      end

      def initialize(encoded_outputs)
        @job_reports = encoded_outputs.map { |encoded_output| JobReport.new(encoded_output) }
        @job_groups = @job_reports.map { |job_report| job_report.job.group }.compact.uniq
        @job_reports_by_group = @job_reports.group_by { |job_report| job_report.job.group }
        @grouped_failures = group_failures(failure_field: :failures)
        @grouped_flakes = group_failures(failure_field: :flakes)
      end

      def group_failures(failure_field: :failures)
        failures = Hash.new { |h, k| h[k] = Hash.new { |h2, k2| h2[k2] = [] } }
        @job_reports.each do |job_report|
          job_report.test.send(failure_field).each do |failure| # rubocop:disable GitHub/AvoidObjectSendWithDynamicMethod
            if failure.test_suite && failure.test_case && failure.error
              failures[failure.test_suite][failure.test_case] << FailureEntry.new(job_report: job_report, failure: failure)
            end
          end
        end
        failures
      end

      def generate
        generate_header
        generate_general_information_section
        generate_job_summary_section
        generate_failures_section(@grouped_failures, "failure", open: true)
        generate_failures_section(@grouped_flakes, "flake")
        generate_developer_experience_section
      end

      def runtime_statistics(values)
        return [nil, nil, nil, nil] if values.empty?
        avg = values.sum / values.count
        min = values.min
        max = values.max
        std_dev = Math.sqrt(values.map { |v| (v - avg) * (v - avg) }.sum / values.count)
        [avg, min, max, std_dev]
      end

      def create_job_summary(job_reports, checkmark)
        return "0" if job_reports.empty?
        job_list = job_reports.map { |job_report| "#{checkmark} <code>#{job_report.job.name}</code>" }.join("<br>")
        "<details><summary>#{job_reports.count}</summary><blockquote>#{job_list}</blockquote></details>"
      end

      def get_checkmark(job_reports)
        return Markdown.green_circle if job_reports.all? { |job_report| job_report.job.status == "success" }
        return Markdown.red_circle if job_reports.any? { |job_report| job_report.job.status == "failure" }
        return Markdown.orange_circle if job_reports.any? { |job_report| job_report.job.status == "cancelled" }
        Markdown.white_circle
      end

      def generate_header
        puts "# :rocket: CI Report :rocket:"
        puts ""
        Markdown.alert(type: "NOTE", message: "This CI report is delivered to you by __DX Build and Test__. "\
          "If you have any questions or comments, please reach out to us at "\
          "[#dx-developer-feedback](https://github-grid.enterprise.slack.com/archives/C06NJQ4JQJ1).")
        test_oracle = "[Test Oracle](https://thehub.github.com/epd/engineering/products-and-services/dotcom/testing/testing-with-test-oracle/)"
        Markdown.alert(type: "TIP", message: "You can run the Rails tests that were affected by your change "\
          "in Codespaces using the #{test_oracle} with the following command: `bin/rails to`. "\
          "The #{test_oracle} uses code coverage data to determine which tests to run and executes them "\
          "for the `github` test mode, which is one of the test modes that are used in CI. The tool is still "\
          "under development and we would be glad if you could give it a try and forward any feedback to us.")
      end

      def generate_general_information_section
        Markdown.section(title: "General Information", level: 2, open: true) do
          puts "- Actor: @#{ENV["GITHUB_ACTOR"]}"
          puts "- Branch: [#{ENV["GITHUB_REF_NAME"]}](https://github.com/github/github/tree/#{ENV["GITHUB_REF_NAME"]})"
          puts "- SHA: [#{ENV["GITHUB_SHA"]}](https://github.com/github/github/commit/#{ENV["GITHUB_SHA"]})"
          puts "- Trigger Event: #{ENV["GITHUB_EVENT_NAME"]}"
        end
      end

      def generate_job_summary_section
        Markdown.section(title: "Job Summary", level: 2, open: true) do
          puts "| Job Group | Success | Failure | Cancelled | Unknown |"
          puts "| --- | --- | --- | --- | --- |"
          @job_reports_by_group.each do |job_group, job_reports|
            checkmark = get_checkmark(job_reports)
            success = create_job_summary(job_reports.select { |job_report| job_report.job.status == "success" }, Markdown.green_circle)
            failure = create_job_summary(job_reports.select { |job_report| job_report.job.status == "failure" }, Markdown.red_circle)
            cancelled = create_job_summary(job_reports.select { |job_report| job_report.job.status == "cancelled" }, Markdown.orange_circle)
            unknown = create_job_summary(job_reports.select { |job_report| job_report.job.status == "unknown" }, Markdown.white_circle)
            puts "| #{checkmark} `#{job_group}` | #{success} | #{failure} | #{cancelled} | #{unknown} |"
          end
        end
      end

      def generate_job_failures_section(grouped_failures, failure_string)
        Markdown.section(title: "Job #{failure_string.capitalize}s", level: 3, open: true) do
          test_suites = grouped_failures.count
          test_cases = grouped_failures.map { |_, test_case_failures| test_case_failures.count }.sum
          failures = grouped_failures.map { |_, test_case_failures| test_case_failures.map { |_, failure_entries| failure_entries.count }.sum }.sum
          if failures == 0
            puts "#{Markdown.green_circle} No test #{failure_string}s!"
          else
            puts "#{Markdown.red_circle} #{failures} #{failure_string}s across #{test_suites} test suites and #{test_cases} test cases."
            puts ""
            puts "| Test Suite | Test Case | Jobs |"
            puts "| --- | --- | --- |"
            grouped_failures.each do |test_suite, test_case_failures|
              test_case_failures.each do |test_case, failure_entries|
                job_names = failure_entries.map { |failure_entry| failure_entry.job_report.job.name }.uniq
                puts "| `#{test_suite.gsub("%3A", ":")}` | `#{test_case}` | #{ job_names.uniq.map { |job_name| "#{Markdown.red_circle} `#{job_name}`" }.join("<br>") } |"
              end
            end
          end
        end
      end

      def generate_failure_details_section(grouped_failures, failure_string)
        Markdown.section(title: "#{failure_string.capitalize} Details", level: 3, open: true) do
          test_suites = grouped_failures.count
          test_cases = grouped_failures.map { |_, test_case_failures| test_case_failures.count }.sum
          failures = grouped_failures.map { |_, test_case_failures| test_case_failures.map { |_, failure_entries| failure_entries.count }.sum }.sum
          if failures == 0
            puts "#{Markdown.green_circle} No test #{failure_string}s!"
          else
            puts "#{Markdown.red_circle} #{failures} #{failure_string}s across #{test_suites} test suites and #{test_cases} test cases."
            puts ""
            grouped_failures.each do |test_suite, test_case_failures|
              test_suite_failures = test_case_failures.map { |_, failure_entries| failure_entries.count }.sum
              Markdown.section(title: "<code>#{test_suite.gsub("%3A", ":")}</code> (#{test_suite_failures} #{failure_string}s across #{test_cases} test cases)", level: 4, blockquote: true) do
                test_case_failures.each do |test_case, failure_entries|
                  Markdown.section(title: "<code>#{test_case}</code> (#{failure_entries.count} #{failure_string}s)", level: 5, open: true, blockquote: true) do
                    failure_entries.each do |failure_entry|
                      job_report = failure_entry.job_report
                      failure = failure_entry.failure
                      lines = ""
                      file_link = "https://github.com/github/github/blob/#{ENV["GITHUB_SHA"]}/#{failure.path}"
                      if failure.start_line && failure.end_line && failure.start_line != "" && failure.end_line != ""
                        lines = failure.start_line == failure.end_line ? ":#{failure.start_line}" : ":#{failure.start_line}-#{failure.end_line}"
                        file_link += failure.start_line == failure.end_line ? "#L#{failure.start_line}" : "#L#{failure.start_line}-L#{failure.end_line}"
                      end
                      Markdown.section(title: "#{Markdown.red_circle} <code>#{job_report.job.name}</code>: <a href=\"#{file_link}\"><code>#{failure.path}#{lines}</code></a>", level: 6, open: true) do
                        puts "```"
                        puts failure.error
                        puts "```"
                      end
                    end
                  end
                end
              end
            end
          end
        end
      end

      def generate_failures_section(grouped_failures, failure_string, open: false)
        puts "<br><br>"
        puts ""
        Markdown.alert(type: "WARNING", message: "It is possible that not all #{failure_string}s are displayed in this section. "\
          "We capture all the #{failure_string}s that are surfaced during the "\
          "[build post processing](https://github.com/github/internal-actions/blob/main/.github/workflows/github_golden.yml#L216) "\
          "and #{failure_string}s that are captured outside of this mechanism are not displayed here.")
        Markdown.section(title: "#{failure_string.capitalize}s", level: 2, open: open) do
          generate_job_failures_section(grouped_failures, failure_string)
          generate_failure_details_section(grouped_failures, failure_string)
        end
      end

      def generate_runtime_table(title, runtimes_by_group)
        Markdown.section(title: title, level: 3) do
          puts "| Job Group | Average | Minimum | Maximum | Spread | Standard Deviation |"
          puts "| --- | --- | --- | --- | --- | --- |"
          @job_reports_by_group.each do |job_group, job_reports|
            checkmark = get_checkmark(job_reports)
            avg, min, max, std_dev = runtime_statistics(runtimes_by_group[job_group])
            if avg && min && max && std_dev
              puts "| #{checkmark} `#{job_group}` | #{avg.round(1)}s | #{min.round(1)}s | #{max.round(1)}s | #{(max - min).round(1)}s | #{std_dev.round(1)}s |"
            else
              puts "| #{checkmark} `#{job_group}` | - | - | - | - | - |"
            end
          end
        end
      end

      def generate_runtime_row(title, runtimes)
        avg, min, max, std_dev = runtime_statistics(runtimes)
        if avg && min && max && std_dev
          puts "| #{title} | #{avg.round(1)}s | #{min.round(1)}s | #{max.round(1)}s | #{(max - min).round(1)}s | #{std_dev.round(1)}s |"
        else
          puts "| #{title} | - | - | - | - | - |"
        end
      end

      def generate_runtime_summary_section
        Markdown.section(title: "Runtime Summary", level: 3, open: true) do
          puts "| Part | Average | Minimum | Maximum | Spread | Standard Deviation |"
          puts "| --- | --- | --- | --- | --- | --- |"
          generate_runtime_row("Job Runtime", @job_reports.map { |job_report| job_report.job.runtime }.compact)
          generate_runtime_row("Build Runtime", @job_reports.map { |job_report| job_report.build.runtime }.compact)
          generate_runtime_row("Setup Runtime", @job_reports.map { |job_report| job_report.setup.runtime }.compact)
          generate_runtime_row("Test Runtime", @job_reports.map { |job_report| job_report.test.runtime }.compact)
          puts ""
          generate_runtime_table("Job Runtimes", @job_reports_by_group.transform_values { |job_reports| job_reports.map { |job_report| job_report.job.runtime }.compact })
          generate_runtime_table("Build Runtimes", @job_reports_by_group.transform_values { |job_reports| job_reports.map { |job_report| job_report.build.runtime }.compact })
          generate_runtime_table("Setup Runtimes", @job_reports_by_group.transform_values { |job_reports| job_reports.map { |job_report| job_report.setup.runtime }.compact })
          generate_runtime_table("Test Runtimes", @job_reports_by_group.transform_values { |job_reports| job_reports.map { |job_report| job_report.test.runtime }.compact })
        end
      end

      def generate_runtime_visualization_section
        Markdown.section(title: "Runtime Visualization", level: 3, open: true) do
          max_job_name_length = @job_reports.map { |job_report| job_report.job.name&.length }.compact.max
          min_job_start = @job_reports.map { |job_report| job_report.job.start }.compact.min
          max_job_end = @job_reports.map { |job_report| job_report.job.end }.compact.max
          if min_job_start && max_job_end
            timespan = max_job_end - min_job_start
            ticks = 120
            tick_length = (timespan + 1).to_f / ticks
            puts "```"
            @job_reports.each do |job_report|
              job_row = "#{job_report.job.name}: ".ljust(max_job_name_length + 2, " ")
              if job_report.job.start && job_report.job.end && job_report.build.start && job_report.build.end && job_report.test.start && job_report.test.end
                job_start_tick = ((job_report.job.start - min_job_start) / tick_length).to_i
                job_end_tick = ((job_report.job.end - min_job_start) / tick_length).to_i
                build_start_tick = ((job_report.build.start - min_job_start) / tick_length).to_i
                build_end_tick = ((job_report.build.end - min_job_start) / tick_length).to_i
                test_start_tick = ((job_report.test.start - min_job_start) / tick_length).to_i
                test_end_tick = ((job_report.test.end - min_job_start) / tick_length).to_i
                ticks.times do |tick|
                  if tick < job_start_tick || tick > job_end_tick
                    job_row += " "
                  elsif tick == job_start_tick || tick == job_end_tick || tick == build_start_tick || tick == build_end_tick || tick == test_start_tick || tick == test_end_tick
                    job_row += "|"
                  elsif tick < build_start_tick || tick > build_end_tick
                    job_row += "-"
                  elsif tick < test_start_tick || tick > test_end_tick
                    job_row += "="
                  else
                    job_row += "*"
                  end
                end
              end
              puts job_row
            end
            puts "```"
          else
            puts "No job runtimes available!"
          end
        end
      end

      def generate_developer_experience_section
        Markdown.section(title: "Developer Experience", level: 2) do
          generate_runtime_summary_section
          generate_runtime_visualization_section
        end
      end
    end
  end
end
