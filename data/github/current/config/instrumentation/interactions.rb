# frozen_string_literal: true

if GitHub.enterprise?
  GitHub.subscribe "user_session.access" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id])
    Interaction.track_active_session(user)
  end

  GitHub.subscribe "blob.crud" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id])
    Interaction.track_web_edit(user)
  end

  GitHub.subscribe "branch.create" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id])
    Interaction.track_web_edit(user)
  end

  GitHub.subscribe "branch.delete" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id])
    Interaction.track_web_edit(user)
  end

  GitHub.subscribe "tag.create" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id])
    Interaction.track_web_edit(user)
  end

  GitHub.subscribe "pull_request.create" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id])
    Interaction.track_pull_request(user)
  end

  GitHub.subscribe "issue.create" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id] || payload[:org_id])
    Interaction.track_issue(user)
  end

  GitHub.subscribe "comment.create" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id])
    Interaction.track_comment(user)
  end

  GitHub.subscribe /wiki\.(create|update|revert|destroy)/ do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:user_id])
    Interaction.track_wiki_edit(user)
  end

  GitHub.subscribe "release.create" do |_event, _start, _ending, _transaction_id, payload|
    user = User.find_by_id(payload[:actor_id])
    Interaction.track_release(user)
  end

  GitHub.subscribe "public_key.access" do |_event, _start, _ending, _transaction_id, _payload|
    GitHub.stats.increment("public_key.access.count")
  end

  GitHub.subscribe "integration_client_secret.access" do |_event, _start, _ending, _transaction_id, _payload|
    GitHub.stats.increment("integration_client_secret.access.count")
  end

  GitHub.subscribe "oauth_application_client_secret.access" do |_event, _start, _ending, _transaction_id, _payload|
    GitHub.stats.increment("oauth_application_client_secret.access.count")
  end
end
