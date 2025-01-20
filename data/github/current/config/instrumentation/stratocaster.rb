# frozen_string_literal: true

GitHub.subscribe "following.create" do |_name, _start, _ending, _transaction_id, payload|
  unless payload[:followee_type] == "Organization"
    GitHub.stratocaster.queue(Stratocaster::Event::FOLLOW_EVENT, payload[:followee_id], payload[:follower_id])
  end
end

GitHub.subscribe "star.create" do |_name, _start, _ending, _transaction_id, payload|
  GitHub.stratocaster.queue(Stratocaster::Event::WATCH_EVENT, payload[:starred_id], payload[:user_id], :started, payload[:starred_type])
end

GitHub.subscribe "sponsors.sponsor_sponsorship_payment_complete" do |_name, _start, _ending, _transaction_id, payload|
  if payload[:public] && payload[:first_payment]
    sponsorable_id = payload[:sponsorable_user_id] || payload[:sponsorable_org_id]
    GitHub.stratocaster.queue Stratocaster::Event::SPONSOR_EVENT, payload[:sponsor_id], sponsorable_id
  end
end

GitHub.subscribe "repo.access" do |_name, _start, _ending, _transaction_id, payload|
  if payload[:access] == :public
    delay = Stratocaster::Attributes::Public::FANOUT_DELAY
    GitHub.stratocaster.delayed_queue(Stratocaster::Event::PUBLIC_EVENT, delay, payload[:repo_id])
  end
end

GitHub.subscribe "repo.add_member" do |_name, _start, _ending, _transaction_id, payload|
  repo_id, user_id, actor_id = payload.values_at(:repo_id, :user_id, :actor_id)
  GitHub.stratocaster.queue(Stratocaster::Event::MEMBER_EVENT, repo_id, user_id, actor_id, :added)
end

GitHub.subscribe "release.published" do |_name, _start, _ending, _transaction_id, payload|
  GitHub.stratocaster.queue(Stratocaster::Event::RELEASE_EVENT, payload[:release_id])
end

GitHub.subscribe "repo.create" do |_name, _start, _ending, _transaction_id, payload|
  repo_id, fork_parent, actor_id = payload.values_at(:repo_id, :fork_parent, :actor_id)
  if fork_parent
    GitHub.stratocaster.queue(Stratocaster::Event::FORK_EVENT, repo_id)
  else
    GitHub.stratocaster.queue(Stratocaster::Event::CREATE_EVENT, repo_id, nil, actor_id)
  end
end

GitHub.subscribe /\Aissue\.(create|transform_to_pull)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, user_id = payload.values_at(:issue_id, :pull_request_id, :user_id)

  if pull_request_id
    GitHub.stratocaster.queue Stratocaster::Event::PULL_REQUEST_EVENT, :opened, pull_request_id, user_id
  else
    GitHub.stratocaster.queue Stratocaster::Event::ISSUES_EVENT, :opened, issue_id, user_id
  end
end

GitHub.subscribe /\Aissue\.event\.(closed|reopened)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, event, actor_id = payload.values_at(:issue_id, :pull_request_id, :event, :actor_id)

  if pull_request_id
    GitHub.stratocaster.queue Stratocaster::Event::PULL_REQUEST_EVENT, event.to_sym, pull_request_id, actor_id
  else
    GitHub.stratocaster.queue Stratocaster::Event::ISSUES_EVENT, event.to_sym, issue_id, actor_id
  end
end

GitHub.subscribe /\Aissue\.event\.(assigned|unassigned)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, event, subject_id = payload.values_at(:issue_id, :pull_request_id, :event, :subject_id)

  if pull_request_id
    GitHub.stratocaster.queue Stratocaster::Event::PULL_REQUEST_EVENT, event.to_sym, pull_request_id, subject_id, payload.slice(:assignee_id)
  else
    GitHub.stratocaster.queue Stratocaster::Event::ISSUES_EVENT, event.to_sym, issue_id, subject_id, payload.slice(:assignee_id)
  end
end

GitHub.subscribe /\Aissue\.event\.(review_requested|review_request_removed)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  pull_request_id, event, actor_id = payload.values_at(:pull_request_id, :event, :actor_id)

  GitHub.stratocaster.queue Stratocaster::Event::PULL_REQUEST_EVENT, event.to_sym, pull_request_id, actor_id, payload.slice(:subject_id, :subject_type)
end

GitHub.subscribe /\Aissue\.event\.(labeled|unlabeled)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, event, actor_id = payload.values_at(:issue_id, :pull_request_id, :event, :actor_id)

  if pull_request_id
    GitHub.stratocaster.queue Stratocaster::Event::PULL_REQUEST_EVENT, event.to_sym, pull_request_id, actor_id, payload.slice(:label_id)
  else
    GitHub.stratocaster.queue Stratocaster::Event::ISSUES_EVENT, event.to_sym, issue_id, actor_id, payload.slice(:label_id)
  end
end

GitHub.subscribe "pull_request.synchronize" do |_name, _start, _ending, _transaction_id, payload|
  pull_request_id, actor_id = payload.values_at(:pull_request_id, :actor_id)
  GitHub.stratocaster.queue Stratocaster::Event::PULL_REQUEST_EVENT, :synchronize, pull_request_id, actor_id
end

GitHub.subscribe "pull_request_review_comment.submission" do |_name, _start, _ending, _transaction_id, payload|
  comment_id, spammy, submitted = payload.values_at(:comment_id, :spammy, :submitted)
  GitHub.stratocaster.queue(Stratocaster::Event::PULL_REQUEST_REVIEW_COMMENT_EVENT, comment_id) unless spammy
end

GitHub.subscribe "pull_request_review.submit" do |_name, _start, _ending, _transaction_id, payload|
  review_id, spammy, submitted = payload.values_at(:review_id, :spammy, :submitted)
  GitHub.stratocaster.queue(Stratocaster::Event::PULL_REQUEST_REVIEW_EVENT, review_id) unless spammy
end

GitHub.subscribe "pull_request_review.update" do |_name, _start, _ending, _transaction_id, payload|
  review_id, spammy, edited = payload.values_at(:review_id, :spammy, :edited)
  GitHub.stratocaster.queue(Stratocaster::Event::PULL_REQUEST_REVIEW_EVENT, review_id) unless spammy
end

GitHub.subscribe "pull_request_review.dismiss" do |_name, _start, _ending, _transaction_id, payload|
  review_id, spammy, dismissed = payload.values_at(:review_id, :spammy, :dismissed)
  GitHub.stratocaster.queue(Stratocaster::Event::PULL_REQUEST_REVIEW_EVENT, review_id) unless spammy
end

GitHub.subscribe "issue_comment.create" do |_name, _start, _ending, _transaction_id, payload|
  comment_id, spammy = payload.values_at(:issue_comment_id, :spammy)
  GitHub.stratocaster.queue(Stratocaster::Event::ISSUE_COMMENT_EVENT, comment_id) unless spammy
end

GitHub.subscribe "commit_comment.create" do |_name, _start, _ending, _transaction_id, payload|
  comment_id, spammy = payload.values_at(:commit_comment_id, :spammy)
  GitHub.stratocaster.queue(Stratocaster::Event::COMMIT_COMMENT_EVENT, comment_id) unless spammy
end

GitHub.subscribe "wiki.push" do |_name, _start, _ending, _transaction_id, payload|
  actor_id, repo_id, updates = payload.values_at(:actor_id, :repo_id, :updates)
  GitHub.stratocaster.queue(Stratocaster::Event::GOLLUM_EVENT, actor_id, repo_id, updates)
end
