# frozen_string_literal: true

if GitHub.large_queries_reported?
  subscriber = GitHub::LargeQuerySubscriber.new(
    threshold: GitHub.query_size_reporting_threshold,
  )
  ActiveSupport::Notifications.subscribe "sql.active_record", subscriber
end
