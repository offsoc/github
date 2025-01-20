# typed: false
# frozen_string_literal: true

direct :gh_clones do |repo|
  clones_path(repo.owner_display_login, repo)
end

direct :gh_repo_comments do |repo|
  repo_comments_path(repo.owner_display_login, repo)
end

direct :gh_contributors do |repo|
  contributors_graph_path(repo.owner_display_login, repo)
end

direct :gh_repository_languages do |repo|
  repository_languages_path(repo.owner_display_login, repo)
end

direct :gh_watchers do |repo|
  watchers_path(repo.owner_display_login, repo)
end

direct :gh_fork_network do |repo|
  forks_path(repo.owner_display_login, repo.name)
end

direct :gh_repo_rename do |repo|
  repo_rename_path(repo.owner_display_login, repo)
end

direct :gh_repo_transfer do |repo|
  repo_transfer_path(repo.owner_display_login, repo)
end

direct :gh_repo_transfer_team_suggestions do |repo|
  repo_transfer_team_suggestions_path(repo.owner_display_login, repo)
end

direct :gh_repo_abort_transfer do |repo|
  repo_abort_transfer_path(repo.owner_display_login, repo)
end

direct :gh_pages_status do |repo|
  pages_status_path(repo.owner_display_login, repo)
end

direct :gh_pages_certificate_status do |repo|
  pages_certificate_status_path(repo.owner_display_login, repo)
end

direct :gh_pages_domain_status do |repo|
  pages_domain_status_path(repo.owner_display_login, repo)
end

direct :gh_pages_request_https_certificate do |repo|
  pages_request_https_certificate_path(repo.owner_display_login, repo)
end

direct :gh_pages_https_status do |repo|
  pages_https_status_path(repo.owner_display_login, repo)
end

direct :gh_destroy_branch do |repo, branch|
  destroy_branch_path(repo.owner_display_login, repo, name: branch)
end

direct :gh_deployments do |repo|
  deployments_path(repo.owner_display_login, repo)
end

direct :gh_pulse do |repo, period = nil|
  pulse_path(repo.owner_display_login, repo, period)
end

direct :gh_network_dependencies do |repo|
  network_dependencies_path(repo.owner_display_login, repo)
end

direct :gh_network_dependents_package do |repo, package_id: nil|
  network_dependents_path(repo.owner_display_login, repo, package_id: package_id)
end

direct :gh_repository_advisory do |repository_advisory|
  repository = repository_advisory.repository
  repository_advisory_path(repository.owner_display_login, repository, repository_advisory)
end

direct :gh_add_repository_advisory_credit do |repository|
  add_repository_advisory_credit_path(repository.owner_display_login, repository)
end

direct :gh_branch_rename_form do |repo, branch|
  "/#{repo.name_with_display_owner}/branches/rename_form/#{escape_url_branch(branch)}"
end

direct :gh_branch do |repo, branch|
  "/#{repo.name_with_display_owner}/branches/#{escape_url_branch(branch)}"
end
