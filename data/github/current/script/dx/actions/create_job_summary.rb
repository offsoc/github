# typed: false
# frozen_string_literal: true

require_relative "job_summary/job_summary"

DX::Actions::JobSummary.generate(ARGV)
