#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true

# Sets the number of parallel workers depending on:
# -  if JANKY_ENV_NUM_PARALLEL_WORKERS was passed (use that value)
# -  if JANKY_ENV_SERVICE_OWNER is in the high_compute_jobs array
# -  if neither two conditions are met.
# We use the stdout value (what is printed), so it's important
# to make sure we only print one value for each case.

DEFAULT_NUM_OF_PARALLEL_WORKERS = ENV.fetch("TEST_QUEUE_WORKERS", 15)
HIGH_COMPUTE_NUM_OF_PARALLEL_WORKERS = 31

if ENV["JANKY_ENV_NUM_PARALLEL_WORKERS"]
  puts ENV["JANKY_ENV_NUM_PARALLEL_WORKERS"]
  return
end

high_compute_jobs = %w[collaboration-core ecoss planning-and-tracking platform unowned]

if high_compute_jobs.include?(ENV["JANKY_ENV_SERVICE_OWNER"])
  puts HIGH_COMPUTE_NUM_OF_PARALLEL_WORKERS
else
  puts DEFAULT_NUM_OF_PARALLEL_WORKERS
end
