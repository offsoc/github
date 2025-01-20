# frozen_string_literal: true

GitHub.subscribe "user.create" do |_name, _start, _finish, _id, _payload|
  GitHub.dogstats.increment("user.create.success")
end

GitHub.subscribe "user.enabled" do |_name, _start, _finish, _id, _payload|
  GitHub.dogstats.increment("user.enabled")
end

GitHub.subscribe "user.disabled" do |_name, _start, _finish, _id, _payload|
  GitHub.dogstats.increment("user.disabled")
end

GitHub.subscribe "user.repo_visit_with_blocked_contributors" do |_name, _start, _finish, _id, _payload|
  GitHub.dogstats.increment("user.repo_visit_with_blocked_contributors")
end

GitHub.subscribe "user.block_user" do |_name, _start, _finish, _id, payload|
  next if payload[:spammy]
  GitHub.dogstats.increment("user.blocked", tags: ["blocked_by:user", "duration:indefinite"])
end

GitHub.subscribe "user.unblock_user" do |_name, _start, _finish, _id, payload|
  next if payload[:spammy]
  GitHub.dogstats.increment("user.unblocked", tags: ["blocked_by:user"])
end

GitHub.subscribe "org.block_user" do |_name, _start, _finish, _id, payload|
  duration = payload[:duration] ? "#{payload[:duration]}-#{'day'.pluralize(payload[:duration])}" : "indefinite"
  minimize_reason = payload[:minimize_reason] ? payload[:minimize_reason] : "none"
  content_type = payload[:blocked_from_content_type].blank? ? "unknown" : payload[:blocked_from_content_type]

  GitHub.dogstats.increment("user.blocked", tags: ["blocked_by:org", "duration:#{duration}", "content_type:#{content_type}", "minimize_reason:#{minimize_reason}", "code_of_conduct_status:#{payload[:code_of_conduct_status]}", "send_notification:#{payload[:send_notification]}"])
end

GitHub.subscribe "org.unblock_user" do |_name, _start, _finish, _id, _payload|
  GitHub.dogstats.increment("user.unblocked", tags: ["blocked_by:org"])
end
