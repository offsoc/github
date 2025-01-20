# typed: strict
#!/usr/bin/env safe-ruby
# frozen_string_literal: true

$LOAD_PATH.unshift File.expand_path("../../lib", __dir__)
require "report_axe_routes_coverage"
require "report_axe_violations"

ReportAxeRoutesCoverage.new(
  artifact_path: "/tmp/github-routes-for-axe-coverage-artifacts/routes_axe_coverage_by_service.json"
).submit_report!

ReportAxeViolations.new(
  artifact_path: "/tmp/github-routes-for-axe-coverage-artifacts/axe_violations_by_service.json"
).submit_report!
