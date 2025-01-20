# typed: true
# frozen_string_literal: true

GitHub.subscribe "authnd.client.timing.request" do |_event, _start, _ending, _transaction_id, payload|
  error_class = "none"
  if payload[:error]
    error_class = payload[:error].class.name
  end

  tags = [
    "client:github/github",
    "method_name:#{payload[:method_name]}",
    "operation:#{payload[:operation]}",
    "error:#{error_class}"
  ]
  GitHub.dogstats.distribution("authnd.client.timing_middleware", payload[:duration_ms], tags: tags)
end

GitHub.subscribe "authnd.client.retry.tried" do |_event, _start, _ending, _transaction_id, payload|
  tags = [
    "client:github/github",
    "method_name:#{payload[:method_name]}",
    "attempt:#{payload[:attempt]}",
    "operation:#{payload[:operation]}"
  ]
  GitHub.dogstats.increment("authnd.client.retry_middleware", tags: tags)
end

GitHub.subscribe "authnd.client.retry.succeeded" do |_event, _start, _ending, _transaction_id, payload|
  tags = [
    "client:github/github",
    "method_name:#{payload[:method_name]}",
    "attempt:#{payload[:attempt]}",
    "operation:#{payload[:operation]}"
  ]
  GitHub.dogstats.increment("authnd.client.retry_middleware", tags: tags)
end

GitHub.subscribe "authnd.client.retry.failed" do |_event, _start, _ending, _transaction_id, payload|
  tags = [
    "client:github/github",
    "method_name:#{payload[:method_name]}",
    "attempt:#{payload[:attempt]}",
    "error:#{payload[:error].class.name}",
    "operation:#{payload[:operation]}"
  ]
  GitHub.dogstats.increment("authnd.client.retry_middleware", tags: tags)
end

GitHub.subscribe "authnd.client.retry.waited" do |_event, _start, _ending, _transaction_id, payload|
  tags = [
    "client:github/github",
    "method_name:#{payload[:method_name]}",
    "attempt:#{payload[:attempt]}",
    "error:#{payload[:error].class.name}",
    "wait_seconds:#{payload[:wait_seconds]}",
    "operation:#{payload[:operation]}"
  ]
  GitHub.dogstats.increment("authnd.client.retry_middleware", tags: tags)
end
