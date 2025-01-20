# typed: true
# frozen_string_literal: true

GitHub.subscribe "security_advisory.publish" do |_name, start, _finish, _id, payload|
  Hook::Event::SecurityAdvisoryEvent.queue(
    action: :published,
    security_advisory_id: payload.fetch(:security_advisory_id),
    triggered_at: start,
  )
end

GitHub.subscribe "security_advisory.update" do |_name, start, _finish, _id, payload|
  Hook::Event::SecurityAdvisoryEvent.queue(
    action: :updated,
    security_advisory_id: payload.fetch(:security_advisory_id),
    triggered_at: start,
  )
end

GitHub.subscribe "security_advisory.withdraw" do |_name, start, _finish, _id, payload|
  Hook::Event::SecurityAdvisoryEvent.queue(
    action: :withdrawn,
    security_advisory_id: payload.fetch(:security_advisory_id),
    triggered_at: start,
  )
end
