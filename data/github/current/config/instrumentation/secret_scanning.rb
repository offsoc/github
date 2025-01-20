# typed: strict
# frozen_string_literal: true

GlobalInstrumenter.subscribe "wiki.initialize" do |_name, _start, _ending, _transaction_id, payload|
  repo = T.let(payload[:repository], Repository)
  SecretScanning::Instrumentation::EnablementChangePublisher.publish_enablement_change_event_for_repository(repo: repo)
end
