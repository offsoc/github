# frozen_string_literal: true

GitHub.subscribe "team.create" do |_name, start, _finish, _id, payload|
  team_id, spammy, actor_id = payload.values_at(:team_id, :spammy, :actor_id)
  Hook::Event::TeamEvent.queue(
    action: :created,
    team_id: team_id,
    actor_id: actor_id,
    triggered_at: start,
  ) unless spammy
end

GitHub.subscribe "team.update" do |_name, start, _finish, _id, payload|
  team_id, changes, spammy, actor_id = payload.values_at(:team_id, :changes, :spammy, :actor_id)
  Hook::Event::TeamEvent.queue(
    action: :edited,
    team_id: team_id,
    actor_id: actor_id,
    changes: changes,
    triggered_at: start,
  ) unless spammy
end

GitHub.subscribe "team.update_repository_permission" do |_name, start, _finish, _id, payload|
  repo_id, old_permissions, team_id, spammy, actor_id = payload.values_at(:repo_id, :old_permissions, :team_id, :spammy, :actor_id)

  changes = {}.tap do |hash|
    hash[:old_permissions] = old_permissions
  end

  Hook::Event::TeamEvent.queue(
    action: :edited,
    team_id: team_id,
    actor_id: actor_id,
    changes: changes,
    repo_id: repo_id,
    triggered_at: start,
  ) unless spammy
end
