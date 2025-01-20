# typed: false
# frozen_string_literal: true

# Running this script generates a sample CI Report. The output can be previewed by saving it to a markdown file and
# previewing that file, or alternatively by pasting it into an issue and previewing it there.

require_relative "job_summary/job_summary"

def report_test_error(report_key)
  test_suite = "GitHub::SomeTest#{Random.rand(5)}"
  test_method = "test_something_#{Random.rand(3)}"
  line_start = 1 + Random.rand(256)
  line_end = line_start + Random.rand(10)
  message = "Test failure #{Random.rand(64)} occurred!"
  `./report "#{report_key}" "#{test_suite}" "#{test_method}" "script/dx/actions/create_test_job_summary.rb" "#{line_start}" "#{line_end}" "#{message}"`
end

def report_runtimes
  job_start = 10 + Random.rand(10)
  build_start = job_start + 5 + Random.rand(5)
  setup_start = build_start + 5 + Random.rand(5)
  setup_end = setup_start + 20 + Random.rand(10)
  test_start = setup_end
  test_end = test_start + 40 + Random.rand(20)
  build_end = test_end + 10 + Random.rand(5)
  job_end = build_end + 5 + Random.rand(5)

  `./report job-runtime "#{job_end - job_start}"`
  `./report build-runtime "#{build_end - build_start}"`
  `./report setup-runtime "#{setup_end - setup_start}"`
  `./report test-runtime "#{test_end - test_start}"`
  `./report job-start "#{job_start}"`
  `./report job-end "#{job_end}"`
  `./report build-start "#{build_start}"`
  `./report build-end "#{build_end}"`
  `./report test-start "#{test_start}"`
  `./report test-end "#{test_end}"`
end

def generate_job_output(job_group:, job_name:, failures: 0, flakes: 0)
  `./report clear`
  `./report job-group "#{job_group}"`
  `./report job-name "#{job_name}"`
  `./report job-status "#{failures == 0 ? "success" : "failure"}"`

  report_runtimes

  failures.times { report_test_error("test-failure") }

  flakes.times { report_test_error("test-flake") }

  `./report --silent read`
end

job_outputs = []
job_outputs << generate_job_output(job_group: "github", job_name: "github-1")
job_outputs << generate_job_output(job_group: "github", job_name: "github-2", failures: 1, flakes: 2)
job_outputs << generate_job_output(job_group: "github", job_name: "github-3", failures: 2, flakes: 1)
job_outputs << generate_job_output(job_group: "github", job_name: "github-4")
job_outputs << generate_job_output(job_group: "github-all-features", job_name: "github-all-features-1")
job_outputs << generate_job_output(job_group: "github-all-features", job_name: "github-all-features-2")
job_outputs << generate_job_output(job_group: "github-all-features", job_name: "github-all-features-3")
job_outputs << generate_job_output(job_group: "enterprise", job_name: "enterprise-1", failures: 3, flakes: 1)
job_outputs << generate_job_output(job_group: "enterprise", job_name: "enterprise-2")
job_outputs << generate_job_output(job_group: "enterprise", job_name: "enterprise-3")
job_outputs << generate_job_output(job_group: "enterprise", job_name: "enterprise-4")
job_outputs << generate_job_output(job_group: "enterprise", job_name: "enterprise-5", failures: 1, flakes: 3)

DX::Actions::JobSummary.generate(job_outputs)
