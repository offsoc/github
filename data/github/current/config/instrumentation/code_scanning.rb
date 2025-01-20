# typed: true
# frozen_string_literal: true

GlobalInstrumenter.subscribe("pull_request.create") do |_event, _start, _ending, _transaction_id, payload|
  if GitHub.flipper[:always_enqueue_code_scanning_job].enabled?(payload[:pull_request].repository)
    CodeScanning::PullRequestCreatedJob.perform_later(pull_request: payload[:pull_request])
  else
    CodeScanning::PullRequestCreatedJob.enqueue_if_necessary(pull_request: payload[:pull_request])
  end
end
