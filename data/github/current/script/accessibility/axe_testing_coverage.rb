# typed: strict
#!/usr/bin/env safe-ruby
# frozen_string_literal: true

$LOAD_PATH.unshift File.expand_path("../../lib", __dir__)
require "routes_for_axe_coverage"
require "process_axe_testing_data"
require_relative "../../config/environment"

RoutesForAxeCoverage.new(
  routes: Rails.application.routes.routes,
  output_directory: "/tmp/github-routes-for-axe-coverage-artifacts/"
).generate_report

ProcessAxeTestingData.new(
  routes: Rails.application.routes.routes,
  artifact_path: "./tmp/snek-e2e-accessibility-axe-report-production-artifacts/test-results/dotcom_axe_results.jsonl",
  final_routes_path: "/tmp/github-routes-for-axe-coverage-artifacts/final_routes_list.json",
  output_directory: "/tmp/github-routes-for-axe-coverage-artifacts/"
).generate_report
