# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  extend Scientist

  # Literally
  role :everyone

  role :nobody do |_context|
    next false
  end

  # Authenticated with no OAuth scopes
  role :authenticated_user do |context|
    context[:user]
  end

  # Authenticated as an Integration via JWT
  role :authenticated_integration do |context|
    context.integration.present? && !roles[:authenticated_user].has_access?(context)
  end

  # Authenticated as an Integration installed globally via JWT
  role :authenticated_global_integration do |context|
    integration = context.integration
    next false unless integration

    authenticated_as_integration = !roles[:authenticated_user].has_access?(context)

    if authenticated_as_integration && integration.enabled_global_app?
      next true
    end

    false
  end

  # Container Registry authentication roles
  # User
  role :authenticated_user_using_personal_access_token do |context|
    context.user && context.user.using_personal_access_token?
  end

  # Bot (Installation)
  role :authenticated_bot_using_installation_token do |context|
    context.user.try(:installation).present?
  end

  # Repo roles

  role :repo_creator, scope: "public_repo" do |context|
    user = extract(context, :user)
    next false unless user

    actor = user.ability_delegate
    next true if !actor.can_have_granular_permissions?

    actor.permissions["administration"] == :write
  end

  role :private_repo_creator, scope: "repo" do |context|
    user = extract(context, :user)
    next false unless user

    actor = user.ability_delegate
    next true if !actor.can_have_granular_permissions?

    actor.permissions["administration"] == :write
  end

  role :associated_public_org_owned_repo_lister, scope: %w(public_repo read:org)
  role :private_repo_lister, scope: "repo"

  # A role exclusively mutating public resources (Watching, etc)
  role :public_repo_resource_mutator, scope: "public_repo"

  # A user who can read the given repository and all its subresources (e.g.,
  # issues, stargazers, releases, wiki, graphs, etc.).
  #
  # WARNING: Think twice before using this role. In most cases, you're better
  # off using a more *specific* role. For example, imagine we're adding a forum
  # to every repository: define a repo_forum_reader role and use it instead.
  role :repo_resources_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) && repo.readable_by?(user)
  end

  role :upload_container_resources_reader do |context|
    user, upload_container = extract(context, :user, :upload_container)
    if GitHub.storage_cluster_enabled? && !GitHub.storage_cluster_private_assets_enabled?
      true
    elsif upload_container
      case upload_container
      when Repository
        user && (upload_container.public? || upload_container.readable_by?(user))
      when MemexProject
        # For draft issues and projects in general
        user && (upload_container.public? || upload_container.viewer_can_read?(user))
      when User
        # For saved replies
        upload_container == user
      else
        user.present?
      end
    else
      # For legacy user assets
      true
    end
  end

  role :v4_private_resource_lister do |context|
    user, resource = extract(context, :user, :resource)

    if resource.is_a?(Platform::GraphqlUserResource)
      Ability.can_at_least?(:read, resource.permissions)
    elsif resource == "metadata"
      SCOPES_WITH_PRIVATE_REPOSITORY_ACCESS.any? { |s| scope?(user, s) }
    else
      scope?(user, "repo")
    end
  end

  # A user that can read a repository's git contents.
  role :repo_contents_reader do |context|
    user, repo, key = extract(context, :user, :repo, :public_key)
    repo ||= extract(context, :resource)

    # We allow access if the actor is a user, they're allowed access, and they
    # can read from the repository, or if the actor is a deploy key belonging to
    # this repository.
    next true if user && oauth_allows_access?(user, repo) && repo.resources.contents.readable_by?(user)
    key && repo && key.deploy_key? && key.repository == repo
  end

  # A user that can write a repository's git contents.
  role :repo_contents_writer do |context|
    user, repo, key = extract(context, :user, :repo, :public_key)
    repo ||= extract(context, :resource)

    # We allow access if the actor is a user, they're allowed access, and they
    # can write to the repository, or if the actor is a read-write deploy key
    # belonging to this repository.
    next true if user && oauth_allows_access?(user, repo) && repo.pushable_by?(user)

    key && repo && key.deploy_key? && key.repository == repo && !key.read_only?
  end

  role :repo_attestation_writer do |context|
    user, repo = extract(context, :user, :repo)

    next false unless user && oauth_allows_access?(user, repo)
    authorizer = TrustMetadata::AttestationAuthorizer.new(user)
    authorizer.can_write_repo?(repo)
  end

  role :repo_attestation_reader do |context|
    user, repo = extract(context, :user, :repo)

    next false unless user && oauth_allows_access?(user, repo)
    authorizer = TrustMetadata::AttestationAuthorizer.new(user)
    authorizer.can_read_repo?(repo)
  end

  # A user that has been granted push access to a particular ref on a repo (say
  # "downstream") by virtue of the fact that downstream has an open PR against
  # a repo they have write access to ("upstream") and the author of the PR
  # granted fork collab access.
  role :fork_collab_grantee do |context|
    repo, actor, ref_name = extract(context, :repo, :user, :ref_name)
    repo ||= extract(context, :resource)
    next false unless repo && actor && ref_name
    next false unless oauth_allows_access?(actor, repo)
    repo.pushable_by?(actor, ref: ref_name)
  end

  # A user that can rename a repository's git branches.
  #
  # If the branch is the default branch or a protected branch, only admins can perform a rename. Otherwise,
  # anyone with contents write access may rename.
  role :repo_branch_renamer do |context|
    user, repo, ref = extract(context, :user, :resource, :ref)

    user && oauth_allows_access?(user, repo) && repo.resources.contents.writable_by?(user) &&
      repo.ref_renameable_by?(user, ref: ref)
  end

  # A user that can read a repository's packages.
  role :repo_packages_reader, scope: "read:packages" do |context|
    user, repo = extract(context, :user, :repo)
    next false unless user
    repo ||= extract(context, :resource)
    actor = user.try(:installation) || user

    if actor&.can_have_granular_permissions?
      repo.resources.packages.readable_by?(actor)
    else
      oauth_allows_package_read_access?(user, repo) && repo.resources.contents.readable_by?(user)
    end
  end

  # A user that can write a repository's packages.
  role :repo_packages_writer, scope: "write:packages" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    actor = user.try(:installation) || user

    if actor&.can_have_granular_permissions?
      repo.resources.packages.writable_by?(actor)
    else
      user && oauth_allows_package_read_access?(user, repo) && repo.resources.contents.writable_by?(user)
    end
  end

  # A user that can delete a repository's packages.
  role :repo_packages_deleter, scope: "read:packages" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    actor = user.try(:installation) || user

    next false unless actor && repo
    next false unless scope?(actor, "delete:packages")

    if actor&.can_have_granular_permissions?
      repo.resources.packages.writable_by?(actor)
    else
      user && repo.adminable_by?(user)
    end
  end

  # A user that can restore a repository's deleted packages.
  role :repo_packages_restorer, scope: "read:packages" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    actor = user.try(:installation) || user

    next false unless actor && repo
    next false unless scope?(actor, "write:packages")

    if actor&.can_have_granular_permissions?
      repo.resources.packages.writable_by?(actor)
    else
      user && repo.adminable_by?(user)
    end
  end

  # A user can read a v2 package, authorization
  # is deferred to registry-metadata service which in turn calls Authzd.
  role :packages_reader_v2, scope: "read:packages"

  # A user can write a v2 package, authorization
  # is deferred to registry-metadata service which in turn calls Authzd.
  role :packages_writer_v2, scope: "write:packages"

  # A user can delete a v2 package, authorization
  # is deferred to registry-metadata service which in turn calls Authzd.
  role :packages_deleter_v2, scope: "read:packages" do |context|
    user = extract(context, :user)
    next false unless user
    if user.respond_to?(:installation)
      Ability.can_at_least?(:write, user.installation.permissions["packages"])
    else
      scope?(user, "delete:packages")
    end
  end

  # A user can restore a v2 package, authorization
  # is deferred to registry-metadata service which in turn calls Authzd.
  role :packages_restorer_v2, scope: "read:packages" do |context|
    user = extract(context, :user)
    next false unless user
    if user.respond_to?(:installation)
      Ability.can_at_least?(:write, user.installation.permissions["packages"])
    else
      scope?(user, "write:packages")
    end
  end

  # A user that can write a specific file
  role :repo_file_writer do |context|
    user, repo, path = extract(context, :user, :repo, :path)
    repo ||= extract(context, :resource)

    can_write_file = user && oauth_allows_access?(user, repo) && repo.resources.file(path).writable_by?(user)

    next false unless can_write_file

    RefUpdates::WorkflowUpdatesPolicy.new(user, repo).check_file_update(path, context[:oid]).allowed?
  end

  # A user that can write specific files
  role :repo_files_writer do |context|
    user, repo, files = extract(context, :user, :repo, :files)
    repo ||= extract(context, :resource)

    can_access_repository = user && oauth_allows_access?(user, repo)
    next false unless can_access_repository

    next true if RefUpdates::WorkflowUpdatesPolicy.new(user, repo).check_files_update(files).allowed?

    can_write_files = repo.resources.contents.writable_by?(user)

    unless can_write_files
      files.each { |file| can_write_files &= repo.resources.file(file.path).writable_by?(user) }
    end

    next false unless can_write_files
  end

  role :upstream_merger, depends_on: [:repo_file_writer] do |context|
    user, repo = extract(context, :user, :resource)

    # We want to 422 that the repo requested is not a fork
    # so we can skip the rest of the authorization checks since
    # we don't have a parent.
    next true unless repo.fork?
    parent = repo.parent

    unless context[:authenticated_user]
      next parent.resources.contents.readable_by?(user)
    end

    grant = ProgrammaticActor::Grant.with(context[:authenticated_user]).with_target(parent.owner)
    parent.resources.contents.readable_by?(grant)
  end

  # A user that can read a specific file
  role :repo_file_reader do |context|
    user, repo, path = extract(context, :user, :repo, :path)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) && repo.resources.file(path).readable_by?(user)
  end

  role :repo_vulnerability_alert_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo
    next false unless oauth_application_policy_satisfied?(user, repo)
    next false unless oauth_allows_security_events_access?(user, repo)

    repo.vulnerability_alerts_visible_to?(user)
  end

  role :repo_vulnerability_alert_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo
    next false unless oauth_application_policy_satisfied?(user, repo)
    next false unless oauth_allows_security_events_access?(user, repo)

    can_write = repo.vulnerability_alerts_resolvable_by?(user)

    if user.can_have_granular_permissions?
      can_write && repo.resources.vulnerability_alerts.writable_by?(user)
    else
      can_write
    end
  end

  role :repo_vulnerability_alert_admin do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)
    next true if SecurityProduct::Permissions::RepoAuthz.new(repo, actor: user).can_manage_security_products?

    repo.resources.administration.writable_by?(user)
  end

  role :repo_private_vulnerability_reporting_admin do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)
    next true if SecurityProduct::Permissions::RepoAuthz.new(repo, actor: user).can_manage_security_products?

    repo.resources.administration.writable_by?(user)
  end

  # At some point, reading branch and tag protections might change to "all repo readers" (or perhaps writers).
  # If that happens, this role should be removed or rewritten. For now we still 404 unless you have edit permission.
  role :repo_protection_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo && oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.administration.readable_by?(user)
    else
      repo.async_can_edit_repo_protections?(user).sync
    end
  end

  role :repo_protection_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo && oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    repo.async_can_edit_repo_protections?(user).sync
  end

  role :deploy_key_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && repo && (oauth_allows_access?(user, repo) &&
      repo.async_can_programmatic_actor_manage_deploy_keys?(user, Permission.actions[:read]).sync &&
      oauth_application_policy_satisfied?(user, repo)
    )
  end

  role :deploy_key_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && repo && (oauth_allows_access?(user, repo) &&
      repo.async_can_programmatic_actor_manage_deploy_keys?(user, Permission.actions[:write]).sync &&
      oauth_application_policy_satisfied?(user, repo)
    )
  end

  role :repo_administration_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    Platform::LoaderTracker.ignore_association_loads do # rubocop:disable GitHub/IgnoreAssociationLoads
      user && oauth_allows_access?(user, repo) &&
        repo.resources.administration.readable_by?(user) && oauth_application_policy_satisfied?(user, repo)
    end
  end

  role :repo_invitations_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    next unless user && repo
    next unless oauth_allows_access?(user, repo) || scope?(user, "repo:invite")

    repo.resources.administration.readable_by?(user) && oauth_application_policy_satisfied?(user, repo)
  end

  role :repo_invitations_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    next unless user && repo
    next unless oauth_allows_access?(user, repo) || scope?(user, "repo:invite")

    repo.resources.administration.writable_by?(user) && oauth_application_policy_satisfied?(user, repo)
  end

  role :repo_administration_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) &&
      repo.resources.administration.writable_by?(user) && oauth_application_policy_satisfied?(user, repo)
  end

  role :repo_image_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next true if user && oauth_allows_access?(user, repo) &&
      repo.resources.administration.writable_by?(user) && oauth_application_policy_satisfied?(user, repo)

    repo.async_can_set_social_preview?(user).sync
  end

  role :repo_interaction_limiter do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next unless user && oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)
    repo.can_set_interaction_limits?(user)
  end

  role :topics_manager do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user && repo
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    repo.can_manage_topics?(user)
  end

  role :repo_pages_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) && repo.resources.pages.readable_by?(user)
  end

  role :repo_pages_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) && repo.resources.pages.writable_by?(user)
  end

  role :repo_pages_admin do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    # User exists, OAuth scope checks out and permissions include pages:write
    next false unless user && oauth_allows_access?(user, repo) && repo.resources.pages.writable_by?(user)

    # If we cannot do granular permissions (we have a real user), do the actual check gating Pages operations (repo admin or repo maintainer via an Enterprise organization)
    if !user.can_have_granular_permissions?
      repo.async_can_toggle_page_settings?(user).sync

    # Or just fallback to administration:write
    else
      repo.resources.administration.writable_by?(user)
    end
  end

  role :repo_comment_minimizer do |context|
    user, comment = extract(context, :user, :resource)
    user && comment && scope?(user, "repo") && comment.async_minimizable_by?(user).sync
  end

  # A user who can read the given private repository and all its subresources
  # (e.g., issues, stargazers, releases, wiki, graphs, etc.).
  #
  # WARNING: Think twice before using this role. In most cases, you're better
  # off using a more *specific* role. For example, imagine we're adding a forum
  # to every repository: define a private_repo_forum_reader role and use it
  # instead.
  role :private_repo_resources_reader, scope: "repo" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) && repo.readable_by?(user)
  end

  # A user that has full write access to a repository and all its
  # subresources (i.e., write access to milestones, labels, releases, git
  # contents, etc.)
  #
  # WARNING: Think twice before using this role. In most cases, you're better
  # off using a more *specific* role. For example, imagine we're adding a forum
  # to every repository: define a repo_forum_writer role and use it instead.
  role :repo_resources_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    user && oauth_allows_access?(user, repo) && repo.writable_by?(user)
  end

  role :repo_transferer do |context|
    user, repo, new_owner = extract(context, :user, :repo, :new_owner)
    repo ||= extract(context, :resource)

    actor = user.ability_delegate

    user_results = user && oauth_allows_access?(user, repo) &&
      repo.resources.administration.writable_by?(user) && oauth_application_policy_satisfied?(user, repo)
    next false unless user_results

    if actor && actor.can_have_granular_permissions?
      case actor
      when IntegrationInstallation
        installation = T.must(actor.integration).installations.find_by(target: new_owner)
        next false unless installation
        installation.permissions["administration"] == :write
      when UserProgrammaticAccessGrant
        # user programmatic access cannot have multiple targets (repo.owner and new_owner would both be required)
        next false
      end
    else
      user_results
    end
  end

  # A user who has admin access to the given repo
  role :repo_admin do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    user && oauth_allows_access?(user, repo) &&
      repo.adminable_by?(user) && oauth_application_policy_satisfied?(user, repo)
  end

  # A user who has read access to *at least one* subresource on the given repo
  role :repo_metadata_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) && repo.resources.metadata.readable_by?(user)
  end

  # `repo_metadata_reader` above mandates that a user have the `repo` token scope, but there are other
  # tokens, like `repo:status` or `repo_deployment`, which ought also be granted private repo access
  role :v4_private_repo_metadata_reader, scope: SCOPES_WITH_PRIVATE_REPOSITORY_ACCESS + ["repo:invite"] do |context|
    user, repo, from_invitation = extract(context, :user, :repo, :from_invitation)

    # viewing a repository from an invitation is a special case. we grant access to the metadata,
    # but as far as the abilities are concerned, `repo.resources.metadata.readable_by?` is false
    next true if from_invitation
    user && repo.resources.metadata.readable_by?(user)
  end

  role :v4_private_repo_lister, scope: SCOPES_WITH_PRIVATE_REPOSITORY_ACCESS

  role :programmatic_repo_resources_reader do |context|
    user, repo, current_integration = extract(context, :user, :resource, :current_integration)
    # these are already loaded in a GraphQL request
    associated_repository_ids = context[:associated_repository_ids]

    if associated_repository_ids.nil?
      user&.can_have_granular_permissions? && user.associated_repository_ids(repository_ids: [repo.id]).any?
    elsif current_integration
      IntegrationInstallation.with_repository(repo).find_by(integration: current_integration.id).present?
    else
      user&.can_have_granular_permissions? && associated_repository_ids.include?(repo.id)
    end
  end

  # A user with permission to receive a redirect when accessing a relocated
  # repository via its old name-with-owner. (Because a redirect can reveal the
  # existence of a private repository, we only redirect for requests that have
  # permission to know that a repository exists).
  role :repo_redirect_follower, scope: SCOPES_WITH_PRIVATE_REPOSITORY_ACCESS do |context|
    user, repo = extract(context, :user, :resource)
    user && repo.pullable_by?(user)
  end

  # A user that is an owner of a repo
  role :repo_owner do |context|
    user, repo = extract(context, :user, :repo)
    user && oauth_allows_access?(user, repo) &&
      repo.owner == user
  end

  # A user that has at least push access to the given repo
  role :repo_member do |context|
    user, repo = extract(context, :user, :repo)
    user && oauth_allows_access?(user, repo) &&
      repo.pushable_by?(user)
  end

  # A user who can admin a repo or is removing their own membership from a repo
  role :repo_member_remover do |context|
    user, repo, collab = extract(context, :user, :repo, :collab)
    repo ||= extract(context, :resource)
    user && oauth_allows_access?(user, repo) &&
      (repo.resources.administration.writable_by?(user) || (user == collab && repo.member?(user)))
  end

  # A user that authored a comment
  role :commit_comment_author, depends_on: [:repo_resources_reader] do |context|
    user, repo, comment = extract(context, :user, :repo, :comment)
    actor = user.try(:bot) || user
    next false unless actor && repo

    is_author = oauth_allows_access?(actor, repo) && comment && comment.user_id == actor.id

    if actor.bot?
      is_author && repo.resources.contents.writable_by?(actor)
    else
      is_author
    end
  end

  role :org_repo_creator, scope: %w(public_repo) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.can_create_repository?(user)
  end

  role :repo_forker do |context|
    user, repo, org = extract(context, :user, :resource, :organization)
    next unless user && repo

    readable = oauth_allows_access?(user, repo) && repo.resources.contents.readable_by?(user)
    next unless readable

    actor = user.ability_delegate

    if actor.can_have_granular_permissions?
      actor.installed_on_all_repositories? && actor.permissions["administration"] == :write
    elsif org.present?
      org.can_create_repository?(actor)
    else
      # We are defaulting to true, because if you're not forking to an organization
      # and you're not a GitHub App, then you're a user forking to your own account.
      true
    end
  end

  role :org_private_repo_creator, scope: %w(repo) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.can_create_repository?(user, visibility: "private")
  end

  # A user who has access to delete a repository.
  #
  # Deleting a repository requires oauth and the oauth scope 'delete_repo'.
  role :repo_deleter, scope: "delete_repo" do |context|
    user, repo = extract(context, :user, :resource)
    user && repo.resources.administration.writable_by?(user)
  end

  # A user with pull access to commit status
  role :status_reader, scope: "repo:status" do |context|
    user, repo = extract(context, :user, :resource)

    user && repo.resources.statuses.readable_by?(user)
  end

  # A user who has access to write commit statuses
  role :status_writer do |context|
    user, repo = extract(context, :user, :resource)
    user && oauth_allows_status_access?(user, repo) && repo.resources.statuses.writable_by?(user)
  end

  # A user with access to list deployments
  role :deployment_lister, scope: "repo_deployment" do |context|
    user, repo = extract(context, :user, :resource)
    user && repo.resources.deployments.readable_by?(user)
  end

  # A user with access to read deployments
  role :deployment_reader, scope: "repo_deployment" do |context|
    user, deployment = extract(context, :user, :resource)
    repo = deployment.repository
    user && repo.resources.deployments.readable_by?(user)
  end

  # A user with access to write deployments
  role :deployment_writer do |context|
    user, deployment = extract(context, :user, :resource)
    repo = deployment.repository
    user && oauth_allows_deploy_access?(user, repo) && repo.resources.deployments.writable_by?(user)
  end

  # A user with privilege to disable/enable access to this repository.
  role :repo_access_admin, scope: "site_admin" do |context|
    context.user && context.user.site_admin?
  end

  role :lfs_writer do |context|
    current_user, repo, route_pattern, request_method = extract(context, :user, :resource, :route_pattern, :request_method)
    scope?(current_user, "repo") && (repo.has_business_owner? && repo.owner.business.adminable_by?(current_user))
  end

  role :repo_hook_reader, scope: "read:repo_hook" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo
    repo.resources.repository_hooks.readable_by?(user)
  end

  role :repo_hook_writer, scope: "write:repo_hook" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo
    repo.resources.repository_hooks.writable_by?(user)
  end

  role :repo_hook_admin, scope: "admin:repo_hook" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo
    repo.resources.repository_hooks.writable_by?(user)
  end

  role :org_hook_reader, scope: "admin:org_hook" do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    org.async_can_read_org_webhooks?(user).sync
  end

  role :org_hook_writer, scope: "admin:org_hook" do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    org.async_can_write_org_webhooks?(user).sync
  end

  role :repo_pre_receive_hook_reader, scope: "admin:pre_receive_hook" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    user && repo.resources.repository_pre_receive_hooks.readable_by?(user)
  end

  role :repo_pre_receive_hook_writer, scope: "admin:pre_receive_hook" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    user && repo.resources.repository_pre_receive_hooks.writable_by?(user)
  end

  role :org_pre_receive_hook_reader, scope: "admin:pre_receive_hook" do |context|
    user, org = extract(context, :user, :resource)
    next false unless user && org

    org.resources.organization_pre_receive_hooks.readable_by?(user)
  end

  role :org_pre_receive_hook_writer, scope: "admin:pre_receive_hook" do |context|
    user, org = extract(context, :user, :resource)
    next false unless user && org

    org.resources.organization_pre_receive_hooks.writable_by?(user)
  end

  role :repo_autolink_reader, scope: %w(repo) do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    user && repo.resources.administration.readable_by?(user)
  end

  role :repo_autolink_writer, scope: %w(repo) do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)
    user && repo.resources.administration.writable_by?(user)
  end

  # Org roles

  role :org_two_factor_auditor, scope: %w(read:org repo user) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.adminable_by?(user)
  end

  role :user_self_accessible_orgs_lister, scope: %w(read:org repo user) do |context|
    context.user
  end

  role :user_self_org_membership_reader, scope: %w(read:org repo user) do |context|
    # This role is being used for User and Organization resources
    actor, resource = extract(context, :user, :resource)
    next false unless actor && resource

    if actor.bot? && resource.is_a?(Organization)
      resource.resources.members.readable_by?(actor.ability_delegate)
    else
      member, authenticated_user = extract(context, :member, :authenticated_user)
      member && (actor == member || authenticated_user == member)
    end
  end

  role :user_self_org_membership_writer, scope: %w(write:org repo user) do |context|
    member, organization, user = extract(context, :resource, :organization, :user)

    next false unless user && organization

    if user.can_have_granular_permissions?
      organization.resources.members.writable_by?(user)
    else
      member && user == member
    end
  end

  role :v4_user_org_memberships_lister, scope: "read:org"

  role :org_member_reader, scope: %w(read:org repo user) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.members.readable_by?(user)
  end

  role :v4_org_member_reader, scope: %w(read:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.members.readable_by?(user)
  end

  role :org_admin_reader, scope: %w(read:org) do |context|
    user, org = extract(context, :user, :resource)

    user && org && org.adminable_by?(user)
  end

  role :installation_org_member_reader do |context|
    user, org = extract(context, :user, :resource)
    actor = user.try(:installation) || user

    actor && actor.can_have_granular_permissions? &&
      org && org.resources.members.readable_by?(actor)
  end

  role :installation_org_member_writer do |context|
    user, org = extract(context, :user, :resource)
    actor = user.try(:installation) || user

    actor && actor.can_have_granular_permissions? &&
      org && org.resources.members.writable_by?(actor)
  end

  role :org_member_writer, scope: %w(admin:org repo) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.members.writable_by?(user)
  end

  role :v4_org_member_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.members.writable_by?(user)
  end

  role :team_member_reader, scope: %w(read:org repo user) do |context|
    user, team = extract(context, :user, :team)
    user && team && team.visible_to?(user)
  end

  role :v4_team_member_reader, scope: %w(read:org read:discussion) do |context|
    user, team = extract(context, :user, :team)

    next false unless user && team

    actor = user.try(:installation) || user

    team.visible_to?(actor)
  end

  role :team_repo_lister, scope: %w(read:org repo user) do |context|
    user, team = extract(context, :user, :team)
    user && team && team.visible_to?(user)
  end

  role :team_repo_reader, scope: %w(read:org repo user) do |context|
    user, team, repo = extract(context, :user, :team, :repo)

    next false unless team.visible_to?(user)
    next true if repo.public?

    if user.can_have_granular_permissions?
      repo.resources.metadata.readable_by?(user)
    else
      # If the repo is private, the user must have read access to it *and*
      # have the repo scope or admin:org scope
      repo.pullable_by?(user) && (scope?(user, "repo") || scope?(user, "admin:org"))
    end
  end

  role :team_repo_adder, scope: %w(admin:org repo) do |context|
    user, team, repo = extract(context, :user, :team, :repo)

    # The team must be visible to the
    # user, and the user must have admin access to the repo.
    next false unless team.visible_to?(user)
    repo.resources.administration.writable_by?(user)
  end

  role :team_new_repo_adder, scope: %w(admin:org repo) do |context|
    user, team = extract(context, :user, :resource)

    # The team must be visible to the
    # user, and the user must have admin access to the repo.
    # next false unless team.visible_to?(user)
    if user.can_have_granular_permissions?
      user.ability_delegate.can_self_install?(team.organization) && team.visible_to?(user)
    else
      team.can_add_repositories?(user, allow_owners_team: true)
    end
  end

  role :team_repo_remover, scope: %w(admin:org repo) do |context|
    user, team, repo = extract(context, :user, :team, :repo)

    next false unless team.visible_to?(user)

    if user.can_have_granular_permissions?
      repo.resources.administration.writable_by?(user) || \
        team.organization.resources.members.writable_by?(user)
    else
      next false unless repo.pullable_by?(user)

      # The user must have admin access to either the repo or the team.
      repo.adminable_by?(user) || team.adminable_by?(user)
    end
  end

  role :team_project_lister, scope: %w(read:org) do |context|
    user, team = extract(context, :user, :resource)
    user && team && team.visible_to?(user)
  end

  role :team_project_adder, scope: %w(admin:org) do |context|
    user, team, project = extract(context, :user, :resource, :project)

    if [user, team, project].all?
      # We need a user, a team, and a project. The team must be visible to the
      # user, and the user must have admin access to the project.
      team.visible_to?(user) && project.adminable_by?(user)
    else
      false
    end
  end

  role :team_project_v2_linker, scope: %w(read:org project) do |context|
    user, team, project = extract(context, :user, :resource, :project)

    next false unless user && team && project

    next false unless scope?(user, "project")

    next false unless scope?(user, "read:org")

    actor = user.try(:installation) || user

    # Only continue if the team is visible to the actor (regardless of if secret)
    # The linker doesn't have to be a member of the team
    next false unless team.visible_to?(actor)

    if actor.can_have_granular_permissions?
      project.owner.projects_adminable_by?(actor)
    else
      project.viewer_is_admin?(actor)
    end
  end

  role :team_project_remover, scope: %w(admin:org) do |context|
    user, team, project = extract(context, :user, :resource, :project)

    if [user, team, project].all? && team.visible_to?(user) && project.readable_by?(user)
      # We need a user, a team, and a project. The team and project must be
      # visible to the user, and the user must have admin access to either the
      # project or the team.
      project.adminable_by?(user) || team.adminable_by?(user)
    else
      false
    end
  end

  # A user who can admin the team
  role :team_maintainer, scope: %w(admin:org repo) do |context|
    user, team = extract(context, :user, :team)
    user && team && team.adminable_by?(user)
  end

  role :v4_team_maintainer, scope: %w(write:org) do |context|
    actor, team = extract(context, :user, :team)
    actor && team && team.updatable_by?(actor)
  end

  role :team_membership_reader, scope: %w(read:org repo) do |context|
    user, team = extract(context, :user, :team)
    user && team && team.visible_to?(user)
  end

  role :user_self_team_membership_reader, scope: %w(read:org repo) do |context|
    context.user && context.member && context.user == context.member
  end

  role :team_membership_deleter, scope: %w(admin:org repo) do |context|
    user, team = extract(context, :user, :team)
    user && team && team.adminable_by?(user)
  end

  role :user_self_team_membership_deleter, scope: %w(admin:org repo) do |context|
    context.user && context.member && context.user == context.member
  end

  # A user with proper OAuth scope. Needed because /user/orgs
  # requires authentication but returns public info without
  # proper scope.
  role :team_lister, scope: %w(read:org repo user) do |context|
    context.user
  end

  role :user_orgs_lister, scope: %w(read:org repo user) do |context|
    context.user && context.user == context.target
  end

  # A user who can create teams for this org
  role :team_creator, scope: %w(admin:org repo) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.can_create_team?(user)
  end

  role :v4_team_creator, scope: %w(write:org) do |context|
    actor, org = extract(context, :user, :org)
    actor && org && org.can_create_team?(actor)
  end

  role :team_discussions_lister, scope: %w(read:discussion) do |context|
    user, team = extract(context, :user, :resource)
    team&.visible_to?(user)
  end

  role :team_discussion_reader, scope: %w(read:discussion) do |context|
    user, discussion = extract(context, :user, :resource)
    discussion&.readable_by?(user)
  end

  role :team_discussion_creator, scope: %w(write:discussion) do |context|
    user, team, = extract(context, :user, :resource)
    team&.can_create_team_discussion?(user)
  end

  role :team_discussion_updater, scope: %w(write:discussion) do |context|
    user, discussion = extract(context, :user, :resource)
    discussion&.viewer_can_update?(user)
  end

  role :team_discussion_deleter, scope: %w(write:discussion) do |context|
    user, discussion = extract(context, :user, :resource)
    discussion&.viewer_can_delete?(user)
  end

  role :team_discussion_comments_lister, scope: %w(read:discussion) do |context|
    user, discussion = extract(context, :user, :resource)
    discussion&.readable_by?(user)
  end

  role :team_discussion_comment_reader, scope: %w(read:discussion) do |context|
    user, comment = extract(context, :user, :resource)

    # Make an exception to the platform enforcement rule to allow loading of the
    # parent discussion object.
    comment&.readable_by?(user)
  end

  role :team_discussion_comment_creator, scope: %w(write:discussion) do |context|
    user, discussion = extract(context, :user, :resource)
    discussion&.viewer_can_update?(user)
  end

  role :team_discussion_comment_updater, scope: %w(write:discussion) do |context|
    user, comment = extract(context, :user, :resource)

    # Make an exception to the platform enforcement rule to allow loading of the
    # parent discussion object.
    comment&.viewer_can_update?(user)
  end

  role :team_discussion_comment_deleter, scope: %w(write:discussion) do |context|
    user, comment = extract(context, :user, :resource)

    # Make an exception to the platform enforcement rule to allow loading of the
    # parent discussion object.
    comment&.viewer_can_delete?(user)
  end

  # A user who has rights to view the organization's outside collaborators
  role :org_outside_collaborator_reader, scope: %w(read:org repo) do |context|
    user, org = extract(context, :user, :resource)
    next false unless user && org

    actor = user.try(:installation) || user
    if actor.can_have_granular_permissions?
      org.resources.members.readable_by?(actor)
    else
      org.adminable_by?(actor)
    end
  end

  # A user who has admin rights for an organization
  role :v3_org_admin, scope: %w(admin:org repo) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if org.user?
      if (organization_via_context = extract(context, :organization))
        org = organization_via_context
      end
    end

    org.adminable_by?(user)
  end

  role :organization_administration_writer, scope: %w(admin:org repo) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_administration.writable_by?(user)
  end

  role :organization_administration_reader, scope: %w(admin:org repo) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_administration.readable_by?(user)
  end

  role :v4_organization_administration_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_administration.writable_by?(user)
  end

  role :v4_organization_administration_reader, scope: %w(read:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_administration.readable_by?(user)
  end

  role :organization_plan_reader, scope: %w(read:org) do |context|
    user, org = extract(context, :user, :resource)
    org.resources.organization_plan.readable_by?(user)
  end

  role :installation_organization_administration_reader do |context|
    user, org = extract(context, :user, :resource)
    actor = user.try(:installation) || user

    actor && actor.can_have_granular_permissions? &&
      org && org.resources.organization_administration.readable_by?(actor)
  end

  # A user who has admin rights for an organization
  role :org_admin, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.adminable_by?(user)
  end

  role :organization_blocks_reader, scope: %w(admin:org repo) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_user_blocking.readable_by?(user)
  end

  role :organization_blocks_writer, scope: %w(admin:org repo) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_user_blocking.writable_by?(user)
  end

  # A user who has admin rights for an org's business
  role :org_business_admin, scope: %w(admin:enterprise) do |context|
    user, org = extract(context, :user, :current_org)
    business = org&.async_business&.sync

    user && business && business.adminable_by?(user)
  end

  # A user who can set interaction limits at the organization level
  role :organization_interaction_limits_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.can_set_interaction_limits?(user)
  end

  # A user who can read interaction limits at the organization level
  role :organization_interaction_limits_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.can_read_interaction_limits?(user)
  end

  role :org_issue_type_reader, scope: %w(read:org) do |context|
    user, org = extract(context, :user, :resource)
    next false unless user && org

    if user.can_have_granular_permissions?
      org.resources.issue_types.readable_by?(user)
    else
      org.member?(user) || org.user_is_outside_collaborator?(user.id)
    end
  end

  # Business roles

  # A user that has admin rights on a business
  role :business_admin, scope: %w(admin:enterprise) do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    business.resources.enterprise_administration.writable_by?(user)
  end

  # A user that has admin rights on the current tenant
  role :admin_of_current_tenant, scope: %w(admin:enterprise) do |context|
    user, business = extract(context, :user), GitHub::CurrentTenant.get
    next false if !user || !business

    GitHub.logger.info("Checking if user #{user.id} is an admin of the current tenant")
    business.resources.enterprise_administration.writable_by?(user)
  end

  # A user that ha rights on a business to read external identities
  role :enterprise_external_identities_viewer do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    if user.can_have_granular_permissions? && (integration = user.try(:integration))
      next true if Apps::Internal.capable?(:bypass_permission_check_for_team_sync_enterprise, app: integration)
    end

    roles[:business_admin_reader].has_access?(context)
  end

  # A user that is an admin of a business, and that is using a token with at least read:enterprise scope
  role :business_admin_reader, scope: %w(read:enterprise) do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    business.resources.enterprise_administration.readable_by?(user)
  end

  role :business_organization_installations_reader do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    if user.using_auth_via_integration? # User portion of user-to-server check
      business.resources.enterprise_administration.readable_by?(user)
    elsif user.can_have_granular_permissions? # Bot portion of user-to-server and server-to-server check
      business.resources.enterprise_organization_installations.readable_by?(user)
    end
  end

  role :business_organization_installations_writer do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    if user.using_auth_via_integration? # User portion of user-to-server check
      context.actors(:user_to_server) do
        business.resources.enterprise_administration.writable_by?(user)
      end
    elsif user.can_have_granular_permissions? # Bot portion of user-to-server and server-to-server check
      context.actors(:server_to_server) do
        business.resources.enterprise_organization_installations.writable_by?(user)
      end
    end
  end

  role :business_organization_installation_repositories_writer do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    if user.using_auth_via_integration? # User portion of user-to-server check
      context.actors(:user_to_server) do
        business.resources.enterprise_administration.writable_by?(user)
      end
    elsif user.can_have_granular_permissions? # Bot portion of user-to-server and server-to-server check
      context.actors(:server_to_server) do
        business.resources.enterprise_organization_installation_repositories.writable_by?(user)
      end
    end
  end

  role :business_organization_installation_repositories_reader do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    if user.using_auth_via_integration? # User portion of user-to-server check
      context.actors(:user_to_server) do
        business.resources.enterprise_administration.writable_by?(user)
      end
    elsif user.can_have_granular_permissions? # Bot portion of user-to-server and server-to-server check
      context.actors(:server_to_server) do
        business.resources.enterprise_organization_installation_repositories.readable_by?(user)
      end
    end
  end

  role :business_organization_accessible_repositories_reader do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    if user.using_auth_via_integration? # User portion of user-to-server check
      business.resources.enterprise_administration.readable_by?(user)
    elsif user.can_have_granular_permissions? # Bot portion of user-to-server and server-to-server check
      business.resources.enterprise_organization_installations.readable_by?(user)
    end
  end

  # A user that has billing manager rights on a business
  role :business_billing_manager, scope: %w(manage_billing:enterprise) do |context|
    user, business = extract(context, :user, :resource)
    user && business && (business.billing_manager?(user) || business.owner?(user))
  end

  # A user that can cancel a business org invitation (either an admin of the
  # business or an admin of the org).
  role :business_organization_invitation_canceler, scope: %w(admin:enterprise admin:org) do |context|
    user, invitation = extract(context, :user, :resource)
    user && invitation && (
      invitation.business.adminable_by?(user) || invitation.invitee.adminable_by?(user)
    )
  end

  # A user that can view the business profile
  role :business_profile_viewer, scope: %w(read:enterprise) do |context|
    user, business = extract(context, :user, :resource)
    user && business && business.readable_by?(user)
  end

  # A user that can view a business administrator invitation
  role :business_administrator_invitation_viewer do |context|
    user, invitation = extract(context, :user, :resource)
    user && invitation && invitation.readable_by?(user)
  end

  # A user or integration that has `user_provisioning` permission on the Enterprise.
  role :business_user_provisioner, scope: %w(admin:enterprise) do |context|
    user, business = extract(context, :user, :resource)
    next false if !user || !business

    business.resources.user_provisioning.writable_by?(user)
  end

  role :enterprise_managed_business_access do |context|
    user, business = extract(context, :user, :resource)
    user && business && user.enterprise_managed_business && user.enterprise_managed_business == business
  end

  # User roles

  # A user with privilege to administer other users
  role :site_admin do |context|
    current_user, route_pattern, request_method = extract(context, :user, :route_pattern, :request_method)
    # Check user scope, and role based permissions
    (!GitHub.require_site_admin_scope? || scope?(current_user, "site_admin")) && Stafftools::AccessControl.api_authorized?(current_user, { route_pattern: route_pattern, request_method: request_method })
  end

  # Logged in user reading their own user data
  role :user_self_reader, scope: "read:user" do |context|
    current_user, user = extract(context, :user, :resource)
    current_user && current_user == user
  end

  role :user_reader do |context|
    context.user
  end

  role :user_hovercard_reader, scope: "repo"

  role :user_editor, scope: "user"

  role :user_profile_writer, scope: "user" do |context|
    actor, authenticated_user = extract(context, :user, :authenticated_user)

    if actor.bot? && authenticated_user&.using_auth_via_granular_actor?
      authenticated_user.resources.profile.writable_by?(authenticated_user)
    else
      actor.resources.profile.writable_by?(actor)
    end
  end

  role :user_emailer, scope: "user:email"

  role :user_exporter do |context|
    actor, user = extract(context, :user, :resource)
    next false unless scope?(actor, "repo") && scope?(actor, "user")
    actor == user
  end

  role :public_key_reader, scope: "read:public_key"
  role :public_key_writer, scope: "write:public_key"
  role :public_key_admin,  scope: "admin:public_key"

  role :gpg_key_lister, scope: "read:gpg_key" do |context|
    current_user = extract(context, :user)
    next true unless current_user.using_auth_via_granular_actor?

    current_user.resources.gpg_keys.readable_by?(current_user)
  end

  role :gpg_key_reader, scope: "read:gpg_key" do |context|
    actor, user = extract(context, :user, :authenticated_user)

    if actor.bot? && user&.using_auth_via_granular_actor?
      user.resources.gpg_keys.readable_by?(user)
    else
      actor.resources.gpg_keys.readable_by?(actor)
    end
  end

  role :gpg_key_writer, scope: "write:gpg_key" do |context|
    actor, user = extract(context, :user, :authenticated_user)

    if actor.bot? && user&.using_auth_via_granular_actor?
      user.resources.gpg_keys.writable_by?(user)
    else
      actor.resources.gpg_keys.writable_by?(actor)
    end
  end

  role :gpg_key_admin, scope: "admin:gpg_key" do |context|
    actor, authenticated_user = extract(context, :user, :authenticated_user)

    if actor.bot? && authenticated_user&.using_auth_via_granular_actor?
      authenticated_user.resources.gpg_keys.writable_by?(authenticated_user)
    else
      actor.resources.gpg_keys.writable_by?(actor)
    end
  end

  role :ssh_signing_key_lister, scope: "read:ssh_signing_key" do |context|
    current_user = extract(context, :user)
    next true unless current_user.using_auth_via_granular_actor?

    current_user.resources.git_signing_ssh_public_keys.readable_by?(current_user)
  end

  role :ssh_signing_key_reader, scope: "read:ssh_signing_key" do |context|
    actor, user = extract(context, :user, :authenticated_user)

    if actor.bot? && user&.using_auth_via_granular_actor?
      user.resources.git_signing_ssh_public_keys.readable_by?(user)
    else
      actor.resources.git_signing_ssh_public_keys.readable_by?(actor)
    end
  end

  role :ssh_signing_key_writer, scope: "write:ssh_signing_key" do |context|
    actor, user = extract(context, :user, :authenticated_user)

    if actor.bot? && user&.using_auth_via_granular_actor?
      user.resources.git_signing_ssh_public_keys.writable_by?(user)
    else
      actor.resources.git_signing_ssh_public_keys.writable_by?(actor)
    end
  end

  role :ssh_signing_key_admin, scope: "admin:ssh_signing_key" do |context|
    actor, authenticated_user = extract(context, :user, :authenticated_user)

    if actor.bot? && authenticated_user&.using_auth_via_granular_actor?
      authenticated_user.resources.git_signing_ssh_public_keys.writable_by?(authenticated_user)
    else
      actor.resources.git_signing_ssh_public_keys.writable_by?(actor)
    end
  end

  role :user_email_reader do |context|
    current_user = extract(context, :user)
    current_user.resources.emails.readable_by?(current_user)
  end

  role :user_email_writer do |context|
    current_user = extract(context, :user)
    current_user.resources.emails.writable_by?(current_user)
  end

  role :user_keys_reader do |context|
    current_user = extract(context, :user)
    current_user.resources.keys.readable_by?(current_user)
  end

  role :user_keys_writer do |context|
    current_user = extract(context, :user)
    current_user.resources.keys.writable_by?(current_user)
  end

  role :user_followers_reader do |context|
    actor, user = extract(context, :user, :authenticated_user)

    if actor.bot? && user&.using_auth_via_granular_actor?
      user.resources.followers.readable_by?(user)
    else
      actor.resources.followers.readable_by?(actor)
    end
  end

  role :user_followers_writer, scope: "user:follow" do |context|
    actor, authenticated_user = extract(context, :user, :authenticated_user)

    if actor.bot? && authenticated_user&.using_auth_via_granular_actor?
      authenticated_user.resources.followers.writable_by?(authenticated_user)
    else
      actor.resources.followers.writable_by?(actor)
    end
  end

  role :user_blocking_reader, scope: "user" do |context|
    actor, user = extract(context, :user, :authenticated_user)

    if actor.bot? && user&.using_auth_via_granular_actor?
      user.resources.blocking.readable_by?(user)
    else
      actor.resources.blocking.readable_by?(actor)
    end
  end

  role :user_blocking_writer, scope: "user" do |context|
    actor, user = extract(context, :user, :authenticated_user)

    if actor.bot? && user&.using_auth_via_granular_actor?
      user.resources.blocking.writable_by?(user)
    else
      actor.resources.blocking.writable_by?(actor)
    end
  end

  # A user that can read their reminders via two special Integrations
  #
  # This isn't an ideal role, it relies on an internal check in
  # GitHubChatops and there's no authz permission checks for this resource
  role :user_reminders_reader do |context|
    current_actor, resource, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    next false unless current_actor && resource

    # check we're using user-to-server auth
    # since this was the original default
    check_auth_type =
      if current_actor.bot? # the bot check
        authenticated_user&.using_auth_via_integration?
      else # the user check
        current_actor.using_auth_via_integration?
      end

    # check org installation if within an org context
    resource_access =
      if resource.organization?
        current_app_for(current_actor)&.installed_on?(resource)
      else
        true
      end

    check_auth_type && resource_access
  end

  role :user_repository_watching_reader do |context|
    current_actor, repo, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    next false unless oauth_allows_access?(current_actor, repo)
    next false unless repo.resources.metadata.readable_by?(current_actor)

    if current_actor.bot? && authenticated_user&.using_auth_via_granular_actor?
      authenticated_user.resources.watching.readable_by?(authenticated_user)
    else
      current_actor.resources.watching.readable_by?(current_actor)
    end
  end

  role :user_repository_watching_writer do |context|
    current_actor, repo, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    next false unless oauth_allows_access?(current_actor, repo)
    next false unless repo.resources.metadata.readable_by?(current_actor)

    if current_actor.bot? && authenticated_user&.using_auth_via_granular_actor?
      authenticated_user.resources.watching.writable_by?(authenticated_user)
    else
      current_actor.resources.watching.writable_by?(current_actor)
    end
  end

  role :user_repository_starring_reader do |context|
    current_actor, repo, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    # This is to match parity with the old access control
    # where you didn't need a scope of any kind.
    next true if repo.public? && !current_actor.using_auth_via_granular_actor?

    next false unless oauth_allows_access?(current_actor, repo)
    next false unless repo.resources.metadata.readable_by?(current_actor)

    if current_actor.bot? && authenticated_user&.using_auth_via_granular_actor?
      authenticated_user.resources.starring.readable_by?(authenticated_user)
    else
      current_actor.resources.starring.readable_by?(current_actor)
    end
  end

  role :user_repository_starring_writer do |context|
    current_actor, repo, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    next false unless oauth_allows_access?(current_actor, repo)
    next false unless repo.resources.metadata.readable_by?(current_actor)

    if current_actor.bot? && authenticated_user&.using_auth_via_granular_actor?
      authenticated_user.resources.starring.writable_by?(authenticated_user)
    else
      current_actor.resources.starring.writable_by?(current_actor)
    end
  end

  # GitHub app installations can read this from users
  role :user_plan_reader, scope: "user" do |context|
    current_actor, subject, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    # Organizations have `organization_plan` instead, see `organization_plan_reader`
    next false unless subject.resources.respond_to?(:plan)

    if authenticated_user&.using_auth_via_integration? && current_actor.bot?
      subject.resources.plan.readable_by?(authenticated_user.oauth_access)
    else
      subject.resources.plan.readable_by?(current_actor)
    end
  end

  role :external_contributions_writer do |context|
    user = extract(context, :user)

    user.using_auth_via_integration? &&
      user.resources.external_contributions.writable_by?(user.oauth_access)
  end

  role :enterprise_vulnerabilities_reader do |context|
    user = extract(context, :user)

    next false unless user.can_have_granular_permissions?
    Ability.can_at_least?(:read, user.installation.permissions["enterprise_vulnerabilities"])
  end

  role :internal_advisory_database_reader do |context|
    integration = extract(context, :resource)

    Apps::Internal.capable?(:internal_advisory_database, app: integration)
  end

  role :v4_user_emailer, scope: %w(read:user user:email) do |context|
    current_user, target = extract(context, :user, :target)

    # in the event of an email being private, we'll require that
    # only the actual user can read their own email
    next true if target.nil?

    if target.user? && target.is_enterprise_managed?
      # All emu primary emails (with shortcode) are private, profile emails are public within the enterprise context
      next true
    end

    next false unless current_user == target

    # Unless the request is user-to-server/PATv2 we're good to go.
    next true unless current_user.using_auth_via_granular_actor?

    target.resources.emails.readable_by?(current_user)
  end

  role :user_audit_log_reader, scope: "user" do |context|
    viewer, audit_log_actor = extract(context, :user, :resource)

    next false unless viewer == audit_log_actor
    (viewer.using_personal_access_token? || viewer.using_basic_auth?)
  end

  role :org_audit_log_reader do |context|
    actor, org = extract(context, :user, :resource)

    next false unless actor.present? && org.present?
    next false unless org.instance_of?(Organization)

    next false unless org.can_read_org_audit_logs?(actor)

    next true if scope?(actor, "admin:org")

    scope?(actor, "read:audit_log")
  end

  role :v4_org_audit_log_reader, scope: %w(admin:org) do |context|
    actor, org = extract(context, :user, :resource)

    next false unless actor.present? && org.present?
    next false unless org.instance_of?(Organization)

    org.can_read_org_audit_logs?(actor)
  end

  role :enterprise_audit_log_reader do |context|
    actor, business = extract(context, :user, :resource, :authenticated_user)

    next false unless actor.present? && business.present?
    next false unless business.instance_of?(Business)

    if actor.can_have_granular_permissions?
      next business.resources.enterprise_administration.readable_by?(actor)
    else
      next false unless business.adminable_by?(actor)
    end

    scope?(actor, "read:audit_log")
  end

  role :audit_log_stream_config_writer, scope: %w(admin:enterprise) do |context|
    user, business = extract(context, :user, :resource)
    user && business && business.adminable_by?(user)
  end

  # A user who can set interaction limits at the user level
  role :user_interaction_limits_writer, scope: %w(user) do |context|
    actor, resource, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    if actor.bot? && authenticated_user&.using_auth_via_integration?
      resource.resources.interaction_limits.writable_by?(authenticated_user.oauth_access)
    else
      resource.resources.interaction_limits.writable_by?(actor)
    end
  end

  # A user who can read interaction limits at the user level
  role :user_interaction_limits_reader, scope: %w(read:user) do |context|
    actor, resource, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    if actor.bot? && authenticated_user&.using_auth_via_integration?
      resource.resources.interaction_limits.readable_by?(authenticated_user.oauth_access)
    else
      resource.resources.interaction_limits.readable_by?(actor)
    end
  end

  # Gist roles

  # Anyone can create a gist (anon included). Oauth must have 'gist' scope.
  # GitHub Apps (user-to-server) must have the `User/gists` permission.
  role :gist_creator do |context|
    user, authenticated_user = extract(context, :user, :authenticated_user)

    next GitHub.anonymous_gist_creation_enabled? unless user.present?
    # This is for ssh via basic auth. See failures https://github.com/github/github/runs/5129837355
    next true if user.using_basic_auth?

    if user.using_auth_via_granular_actor? || user.can_have_granular_permissions?
      authenticated_user ||= user
      authenticated_user.resources.gists.writable_by?(authenticated_user)
    elsif user.using_oauth?
      scope?(user, "gist")
    else
      # fail closed if a new type of token is introduced
      false
    end
  end

  role :gist_private_lister do |context|
    user, target, authenticated_user = extract(context, :user, :target, :authenticated_user)

    next false unless user.present?

    if user.using_auth_via_granular_actor? || user.bot?
      # authenticated_user is only populated in the context of granular-actor requests
      authenticated_user ||= user
      # We should not really be checking for bots permissions here because:
      # 1) These endpoints are disabled for S2S
      # 2) Gists should be accessible without installations since it's a pure User permission
      # 3) For individual endpoints (e.g get /gists/:id) we entirely bypass the bot checks
      #
      # This is why we delegate the bots permissions to the authenticated user.
      next target.resources.gists.writable_by?(authenticated_user)
    end

    next false unless target
    next false if user.using_oauth? && !scope?(user, "gist")
    target.is_a?(Organization) ? target.adminable_by?(user) : user.id == target.id
  end

  # A user that can edit a gist. Oauth must have 'gist' scope.
  role :gist_editor do |context|
    user, gist = extract(context, :user, :resource)
    next false unless user && gist.try(:available?) && gist.user_id == user.id
    # This is for ssh via basic auth. See failures https://github.com/github/github/runs/5129837355
    next true if user.using_basic_auth?

    if user.using_auth_via_granular_actor?
      user.resources.gists.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "gist")
    else
      # fail closed if a new type of token is introduced
      false
    end
  end

  # A user that can fork a gist. Oauth must have 'gist' scope.
  role :gist_forker do |context|
    user, gist = extract(context, :user, :resource)
    next false unless user && gist.try(:available?)

    if user.using_auth_via_granular_actor?
      user.resources.gists.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "gist")
    else
      # fail closed if a new type of token is introduced
      false
    end
  end

  role :gist_fork_reader do |context|
    user, gist = extract(context, :user, :resource)
    user && gist.try(:available?)
  end

  role :gist_star_reader do |context|
    user, gist = extract(context, :user, :resource)
    user && gist.try(:available?)
  end

  # A user that can star a gist. Oauth must have 'gist' scope.
  role :gist_starrer do |context|
    user, gist = extract(context, :user, :resource)
    next false unless user && gist.try(:available?)

    if user.using_auth_via_granular_actor?
      user.resources.gists.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "gist")
    else
      if GitHub.flipper[:cap_gist_starrer].enabled?
        scope?(user, "gist") && user.resources.gists.writable_by?(user)
      else
        false
      end
    end
  end

  role :gist_comment_creator do |context|
    user, gist = extract(context, :user, :resource)
    next false unless user && gist.try(:available?)

    if user.using_auth_via_granular_actor?
      user.resources.gists.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "gist")
    else
      false
    end
  end

  role :gist_comment_editor do |context|
    user, comment = extract(context, :user, :resource)
    next false unless comment && user.id == comment.user_id

    if user.using_auth_via_granular_actor?
      user.resources.gists.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "gist")
    else
      # fail closed if a new type of token is introduced
      false
    end
  end

  role :gist_comment_minimizer do |context|
    user, comment = extract(context, :user, :resource)
    user && comment && user.using_oauth? && scope?(user, "gist") && comment.async_minimizable_by?(user).sync
  end

  # A user that can read issues in a repo
  role :issue_reader, scope: "repo" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) && repo.resources.issues.readable_by?(user)
  end

  # A user that can create or update all issues in a repo
  role :issue_writer do |context|
    user, repo = extract(context, :user, :repo)

    user && oauth_allows_access?(user, repo) && repo.resources.issues.writable_by?(user)
  end

  # A user that can create or update issues and pull requests in a repo
  # Additionaly to issue_writer, the user can read and clone the repository
  role :repo_triagger do |context|
    user, repo = extract(context, :user, :repo)
    next false unless user && repo

    oauth_allows_access?(user, repo) && Issue::PermissionsDependency::repo_triageable_by?(user, repo)
  end

  # # A user that can create or update all issues in both the new repo
  # # and the original repo the issue is transferred from
  role :issue_transferer do |context|
    user, new_repo, issue = extract(context, :user, :repo, :issue)

    actor = user.try(:bot) || user

    next false unless actor

    old_repo = issue.repository

    oauth_allows_access?(actor, new_repo) && oauth_allows_access?(actor, old_repo) &&
      new_repo.resources.contents.writable_by?(actor) && old_repo.resources.contents.writable_by?(actor)
  end

  # A user who is the author of an issue
  # and has write access to it
  role :issue_author, depends_on: [:repo_resources_reader] do |context|
    user, issue, repo = extract(context, :user, :resource, :repo)
    actor = user.try(:bot) || user

    is_author = (issue.user_id == actor.id || issue.assignee_id == actor.id)

    if actor.bot?
      # installation might not still have write access to issue even if
      # it were the initial author
      is_author && repo.resources.issues.writable_by?(actor)
    else
      is_author
    end
  end

  # A user that can read comments on an issue
  role :issue_comment_reader do |context|
    user, resource, repo = extract(context, :user, :resource, :repo)

    user && oauth_allows_access?(user, repo) && repo.resources.issues.readable_by?(user) &&

    # Resource must exist and be readable by the user.
    resource && resource.readable_by?(user)
  end

  # A user that is the author of an issue comment
  # and has write access to issue
  role :issue_comment_author, depends_on: [:repo_resources_reader] do |context|
    user, comment, repo = extract(context, :user, :resource, :repo)
    actor = user.try(:bot) || user

    is_author = comment.user_id == actor.id

    if actor.bot?
      is_author && repo.resources.issues.writable_by?(actor)
    else
      is_author
    end
  end

  # A user that can lock an issue
  role :issue_locker do |context|
    user, repo, issue = extract(context, :user, :repo, :resource)

    next false unless user && repo && issue

    next false unless oauth_allows_access?(user, repo) && repo.resources.metadata.readable_by?(user)

    issue && issue.lockable_by?(user)
  end

  # A user that can label an issue, pull request, or discussion
  role :resource_labeller do |context|
    user, repo, resource = extract(context, :user, :repo, :resource)

    oauth_allows_access?(user, repo) && resource.labelable_by?(actor: user)
  end

  # A user that can add assignees to an issue
  role :issue_assigner do |context|
    user, repo, issue = extract(context, :user, :repo, :resource)

    next false unless user && repo && issue

    next false unless oauth_allows_access?(user, repo)

    issue.assignable_by?(actor: user)
  end

  role :dashboard_user do |context|
    user = extract(context, :user)
    user && scope?(user, "public_repo")
  end

  role :private_dashboard_user, scope: "repo" do |context|
    extract(context, :user)
  end

  # Pull Request roles

  # A user who is the author of a pull request
  role :pull_request_author, depends_on: [:repo_resources_reader] do |context|
    user, pull, repo = extract(context, :user, :resource, :repo)
    actor = user.try(:bot) || user

    is_author = pull.user_id == actor.id

    if actor.bot?
      is_author && repo.resources.pull_requests.writable_by?(actor)
    else
      is_author
    end
  end

  # A user that is the author of a pull request comment
  role :pull_request_comment_author, depends_on: [:repo_resources_reader] do |context|
    user, comment, repo = extract(context, :user, :resource, :repo)
    actor = user.try(:bot) || user

    is_author = comment.user_id == actor.id

    if actor.bot?
      is_author && repo.resources.pull_requests.writable_by?(actor)
    else
      is_author
    end
  end

  # A user that can read pull requests in a repo
  role :pull_request_reader do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) &&
      repo.resources.pull_requests.readable_by?(user)
  end

  # A user that can write pull requests in a repo
  role :pull_request_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) &&
      repo.resources.pull_requests.writable_by?(user)
  end

  role :pull_requests_from_forks_writer do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    user && oauth_allows_access?(user, repo) &&
      repo.resources.pull_requests_from_forks.writable_by?(user)
  end

  # A user that can request pull request reviews
  role :pull_request_review_requester do |context|
    user, repo, pr = extract(context, :user, :repo, :resource)

    next false unless user && repo && pr
    next false unless oauth_allows_access?(user, repo)

    pr.can_request_review?(user)
  end

  role :pull_request_review_author, scope: %w[repo public_repo] do |context|
    actor, review, authenticated_user = extract(context, :user, :resource, :authenticated_user)

    next false unless actor && review
    next false unless oauth_allows_access?(actor, review.repository)

    review_accessible = if actor.can_have_granular_permissions?
      review.repository.resources.pull_requests.writable_by?(actor)
    elsif actor.using_auth_via_integration?
      integration  = actor.oauth_access.application
      installation = actor.oauth_access.installation || integration.installations.find_by(target: review.repository.owner)

      installation && review.repository.resources.pull_requests.writable_by?(installation)
    else
      true
    end

    review_accessible && (review.user_id == actor.id || review.user_id == authenticated_user&.id)
  end

  role :pull_requests_comment_only_reviews_writer do |context|
    user, pull = extract(context, :user, :resource)
    repo = pull&.repository

    user && repo && oauth_allows_access?(user, repo) &&
      repo.resources.pull_requests_comment_only_reviews.writable_by?(user)
  end

  role :v4_repository_invitation_reader do |context|
    user, invitation = extract(context, :user, :resource)
    repository = invitation.try(:repository)
    next false unless user && invitation && repository

    next false unless oauth_allows_invitation_access?(user, repository) &&
      oauth_application_policy_satisfied?(user, repository)

    invitation.readable_by?(user)
  end

  role :user_public_repository_invitation_reader, scope: ["public_repo", "repo:invite"] do |context|
    context.user
  end

  role :user_private_repository_invitation_reader, scope: "repo:invite" do |context|
    actor = extract(context, :authenticated_user)
    next true unless actor

    actor.resources.private_repository_invitations.readable_by?(actor)
  end

  role :repository_invitation_accepter, scope: ["public_repo", "repo:invite"] do |context|
    user, invitation = extract(context, :user, :resource)
    repository = invitation.try(:repository)

    next false unless user && invitation && repository && oauth_allows_invitation_access?(user, repository)

    if user.can_have_granular_permissions?
      repository.resources.administration.writable_by?(user)
    else
      invitation.invitee_id == user.id
    end
  end

  role :asset_reader, scope: "user:assets:read" do |context|
    context.asset
  end

  role :asset_writer, scope: "user:assets" do |context|
    if context.asset
      context.user && context.asset.user_id == context.user.id
    else
      context.user
    end
  end

  role :user_file_writer, scope: "user:assets" do |context|
    uploader, file_owner, resource = extract(context, :user, :owner, :resource)

    case resource
    when ::Repository
      oauth_allows_access?(uploader, resource) && resource.resources.contents.readable_by?(uploader)
    else
      uploader && file_owner == uploader
    end
  end

  role :notification_dashboard_reader, scope: %w(notifications repo) do |context|
    current_user = extract(context, :user)

    if current_user.using_auth_via_granular_actor?
      current_user.resources.notifications.readable_by?(current_user)
    else
      true
    end
  end

  role :notification_reader, scope: %w(notifications repo) do |context|
    user, resource = extract(context, :user, :resource)
    next false unless user && resource

    case resource
    when ::Repository
      resource.pullable_by?(user)
    else
      resource.try(:readable_by?, user)
    end
  end

  role :v4_repo_notification_writer, scope: %w(notifications) do |context|
    user, repo = extract(context, :user, :resource)
    actor = user.try(:installation) || user

    next false if actor.can_have_granular_permissions? # GitHub Apps are not permitted at this time

    user && repo && repo.pullable_by?(user)
  end

  role :v4_user_notification_reader, scope: %w(notifications) do |context|
    viewer, user = extract(context, :user, :resource)
    actor = user.try(:installation) || user

    next false if actor.can_have_granular_permissions? # GitHub Apps are not permitted at this time

    actor.id == viewer.id
  end

  role :notification_thread_reader, scope: %w(notifications) do |context|
    viewer, resource = extract(context, :user, :resource)
    actor = viewer.try(:installation) || viewer

    next false if actor.can_have_granular_permissions? # GitHub Apps are not permitted at this time

    resource.readable_by?(actor)
  end

  role :notification_filter_reader, scope: %w(notifications) do |context|
    user, notification_filter = extract(context, :user, :resource)
    actor = user.try(:installation) || user

    next false if actor.can_have_granular_permissions? # GitHub Apps are not permitted at this time

    user && notification_filter && notification_filter.readable_by?(user)
  end

  role :notification_list_with_thread_count_reader, scope: %w(notifications) do |context|
    viewer, notification_list_with_thread_count = extract(context, :user, :resource)
    actor = viewer.try(:installation) || viewer

    next false if actor.can_have_granular_permissions? # GitHub Apps are not permitted at this time

    notification_list_with_thread_count.readable_by?(actor)
  end

  role :v4_user_notification_writer, scope: %w(notifications) do |context|
    viewer, resource = extract(context, :user, :resource)
    actor = viewer.try(:installation) || viewer

    next false if actor.can_have_granular_permissions? # GitHub Apps are not permitted at this time

    resource.readable_by?(actor)
  end

  role :v4_thread_notification_writer, scope: %w(notifications) do |context|
    user, resource = extract(context, :user, :resource)

    next false if user.can_have_granular_permissions? # GitHub Apps are not permitted at this time

    user && resource && resource.readable_by?(user)
  end

  role :user_notification_settings_reader, scope: %w(user) do |context|
    viewer, user = extract(context, :user, :resource)

    actor = user.try(:installation) || user

    actor.id == viewer.id
  end

  role :user_notification_settings_writer, scope: %w(user) do |context|
    viewer, user = extract(context, :user, :resource)

    actor = user.try(:installation) || user

    actor.id == viewer.id
  end

  role :event_reader do |context|
    current_user, user = extract(context, :user, :resource)
    # Duplicate current behavior. Doesn't make any sense to have repo scope to
    # get user event data
    current_user && user == current_user && scope?(current_user, "repo")

    # This is what it should be I think:
    # current_user && user == current_user && scope?(current_user, 'user')
  end

  role :user_org_event_reader do |context|
    current_user, user, org = extract(context, :user, :resource, :organization)
    next false unless current_user

    if current_user.can_have_granular_permissions?
      org.resources.organization_events.readable_by?(current_user)
    else
      current_user == user && scope?(current_user, "repo")
    end
  end

  # This is for when avatars are viewed on upload and requires
  # the user to have admin rights over the avatar.
  # OAuth is disabled for users since there is no public Avatar API.
  role :personal_avatar_reader do |context|
    avatar, current_user = extract(context, :avatar, :user)
    next false if avatar.nil?
    next false if current_user.nil?
    next true if current_user.site_admin?
    avatar.owner.try(:avatar_editable_by?, current_user)
  end

  role :avatar_reader do |context|
    avatar, owner_type, owner_id = extract(context, :avatar, :owner_type, :owner_id)
    avatar && avatar.owner_type == owner_type && avatar.owner_id == owner_id.to_i
  end

  role :avatar_writer do |context|
    uploader, avatar_owner = extract(context, :user, :owner)
    uploader && avatar_owner && avatar_owner.avatar_editable_by?(uploader)
  end

  role :reaction_writer do |context|
    user, repo, resource = extract(context, :user, :repo, :resource)
    actor = user.try(:installation) || user
    next false unless actor && resource

    if !actor.can_have_granular_permissions? && repo &&
        !oauth_allows_access?(actor, repo)
      next false
    end

    resource.reactions.klass.actor_can_react_to?(actor, resource, repository: repo)
  end

  role :project_next_reader do |context|
    user, project = extract(context, :user, :resource)
    current_owner = project&.owner
    next false unless user && current_owner && project

    if current_owner.user?
      # User owned memexes do not support integration-access yet.
      next false if user.can_have_granular_permissions?
      next false unless scope?(user, "repo")
      next project.viewer_can_read?(user)
    end

    next false unless scope?(user, "read:org")

    actor = user.try(:installation) || user
    if actor.can_have_granular_permissions?
      current_owner.projects_readable_by?(actor)
    else
      project.readable_by?(actor)
    end
  end

  role :project_next_writer do |context|
    user, project = extract(context, :user, :resource)
    current_owner = project&.owner
    next false unless user && current_owner && project

    if current_owner.user?
      # User owned memexes do not support integration-access yet.
      next false if user.can_have_granular_permissions?
      next false unless scope?(user, "repo")
      next project.viewer_can_write?(user)
    end

    next false unless scope?(user, "write:org")

    actor = user.try(:installation) || user
    if actor.can_have_granular_permissions?
      current_owner.projects_writable_by?(actor)
    else
      project.viewer_can_write?(actor)
    end
  end

  role :project_v2_reader do |context|
    user, project = extract(context, :user, :resource)
    current_owner = project&.owner
    next false unless user && current_owner && project

    next false unless scope?(user, "read:project")

    if current_owner.user?
      next project.viewer_can_read?(user)
    end

    actor = user.try(:installation) || user
    if actor.can_have_granular_permissions?
      current_owner.projects_readable_by?(actor)
    else
      project.readable_by?(actor)
    end
  end

  role :project_v2_writer_read_only do |context|
    user, project = extract(context, :user, :resource)
    current_owner = project&.owner
    next false unless user && current_owner && project

    next false unless scope?(user, "read:project")

    if current_owner.user?
      next project.viewer_can_write?(user)
    end

    actor = user.try(:installation) || user
    if actor.can_have_granular_permissions?
      current_owner.projects_writable_by?(actor)
    else
      project.viewer_can_write?(actor)
    end
  end

  role :project_v2_writer do |context|
    user, project = extract(context, :user, :resource)
    current_owner = project&.owner
    next false unless user && current_owner && project

    next false unless scope?(user, "project")

    if current_owner.user?
      next project.viewer_can_write?(user)
    end

    actor = user.try(:installation) || user
    if actor.can_have_granular_permissions?
      current_owner.projects_writable_by?(actor)
    else
      project.viewer_can_write?(actor)
    end
  end

  role :project_v2_administrator do |context|
    user, project = extract(context, :user, :resource)
    current_owner = project&.owner
    next false unless user && current_owner && project

    next false unless scope?(user, "project")

    if current_owner.user?
      next project.viewer_is_admin?(user)
    end

    actor = user.try(:installation) || user
    if actor.can_have_granular_permissions?
      current_owner.projects_adminable_by?(actor)
    else
      project.viewer_is_admin?(actor)
    end
  end

  role :project_v2_creator do |context|
    user, owner = extract(context, :user, :owner)

    next false if user.nil? || owner.nil?

    next false unless scope?(user, "project")

    owner.projects_writable_by?(user)
  end

  role :team_discussion_reaction_writer, scope: %w(write:discussion) do |context|
    user, resource = extract(context, :user, :resource)
    actor = user.try(:installation) || user
    next false unless actor && resource

    Reaction.actor_can_react_to?(actor, resource)
  end

  role :team_discussion_reaction_deleter, scope: %w(write:discussion) do |context|
    user, reaction, resource = extract(context, :user, :reaction, :resource)
    actor = user.try(:installation) || user
    next false unless actor && reaction && resource

    if actor.can_have_granular_permissions?
      # Bots are not allowed to delete reactions as themselves. Hence this
      # branch is only triggered when the other branch will also be triggered
      # later on to check for the perms of the backing user. As a result, all
      # we check for in this branch is write permissions for the Bot.
      resource.viewer_can_update?(actor)
    else
      reaction.user == actor
    end
  end

  role :project_creator do |context|
    user, owner = extract(context, :user, :owner)

    next false if user.nil? || owner.nil?

    if owner.is_a?(Repository)
      next false unless oauth_allows_access?(user, owner)
    elsif owner.instance_of?(Organization)
      # TODO: remove `repo` scope in favor or `write:org`
      # https://github.com/github/github/issues/108838
      next false unless scope?(user, "repo") || scope?(user, "write:org")
    elsif owner.instance_of?(User)
      next false unless scope?(user, "repo")
    end

    owner.projects_writable_by?(user)
  end

  role :project_lister do |context|
    user, owner = extract(context, :user, :owner)

    next false if user.nil? || owner.nil?

    if owner.is_a?(Repository)
      next false unless oauth_allows_access?(user, owner)
    elsif owner.instance_of?(Organization)
      # TODO: remove `repo` scope in favor or `read:org`
      # https://github.com/github/github/issues/108838
      next false unless scope?(user, "repo") || scope?(user, "read:org")
    elsif owner.instance_of?(User)
      next false unless scope?(user, "repo")
    end

    owner.projects_readable_by?(user)
  end

  role :project_reader do |context|
    user, project, owner = extract(context, :user, :resource, :owner)
    owner ||= project.owner

    next false if user.nil? || owner.nil?

    if owner.is_a?(Repository)
      next false unless oauth_allows_access?(user, owner)
    elsif owner.instance_of?(Organization)
      # TODO: remove `repo` scope in favor or `read:org`
      # https://github.com/github/github/issues/108838
      next false unless scope?(user, "repo") || scope?(user, "read:org")
    elsif owner.instance_of?(User)
      next false unless scope?(user, "repo")
    end

    project.readable_by?(user)
  end

  role :project_writer do |context|
    user, project = extract(context, :user, :resource)
    owner = project.owner

    next false if user.nil? || owner.nil?

    if owner.is_a?(Repository)
      next false unless oauth_allows_access?(user, owner)
    elsif owner.instance_of?(Organization)
      # TODO: remove `repo` scope in favor or `write:org`
      # https://github.com/github/github/issues/108838
      next false unless scope?(user, "repo") || scope?(user, "write:org")
    elsif owner.instance_of?(User)
      next false unless scope?(user, "repo")
    end

    project.writable_by?(user)
  end

  role :project_admin do |context|
    user, project = extract(context, :user, :resource)
    owner = project.owner

    next false if user.nil? || owner.nil?

    if owner.is_a?(Repository)
      next false unless oauth_allows_access?(user, owner)
    elsif owner.instance_of?(Organization)
      # TODO: remove `repo` scope in favor or `write:org`
      # https://github.com/github/github/issues/108838
      next false unless scope?(user, "repo") || scope?(user, "write:org")
    elsif owner.instance_of?(User)
      next false unless scope?(user, "repo")
    end

    project.adminable_by?(user)
  end

  role :project_repository_links_write do |context|
    user, project, repo = extract(context, :user, :resource, :current_repo)
    next false if user.nil? || repo.nil?

    # Always check Repository access before Project access!
    next false unless oauth_allows_access?(user, repo)
    next false unless scope?(user, "repo")

    project.writable_by?(user)
  end

  # A user who has access to read check suites
  role :check_suite_reader do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user
    actor = user.try(:installation) || user

    if actor.can_have_granular_permissions?
      repo.resources.checks.readable_by?(actor)
    else
      oauth_allows_access?(user, repo) && repo.resources.contents.readable_by?(actor)
    end
  end

  # A user who has access to write check suites for a repo
  role :check_suite_writer do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user
    actor = user.try(:installation) || user

    if user.using_auth_via_granular_actor? || user.can_have_granular_permissions?
      repo.resources.checks.writable_by?(actor)
    end
  end

  # A user who has access to request check suites for a repo
  role :check_suite_requester do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user
    next false if user.using_auth_via_oauth_application? && !Apps::Internal.capable?(:oauth_checks_access, app: user.oauth_application)

    actor = user.try(:installation) || user

    if actor.can_have_granular_permissions?
      repo.resources.checks.writable_by?(actor)
    else
      oauth_allows_access?(user, repo) && repo.resources.contents.writable_by?(actor)
    end
  end

  # A user who has access to request check runs for a repo
  role :check_run_requester do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user
    next false if user.using_auth_via_oauth_application? && !Apps::Internal.capable?(:oauth_checks_access, app: user.oauth_application)

    actor = user.try(:installation) || user

    if actor.can_have_granular_permissions?
      repo.resources.checks.writable_by?(actor)
    else
      oauth_allows_access?(user, repo) && repo.resources.contents.writable_by?(actor)
    end
  end

  # A user who has access to read check runs
  role :check_run_reader do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user
    actor = user.try(:installation) || user

    if actor.can_have_granular_permissions?
      repo.resources.checks.readable_by?(actor)
    else
      oauth_allows_access?(user, repo) && repo.resources.contents.readable_by?(actor)
    end
  end

  # A user who has access to write check runs
  role :check_run_writer do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user
    actor = user.try(:installation) || user

    if user.using_auth_via_granular_actor? || user.can_have_granular_permissions?
      repo.resources.checks.writable_by?(actor)
    end
  end

  # A user who has access to write check suite permissions for a repo
  role :check_suite_preferences_writer do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user
    next false if user.using_auth_via_oauth_application?

    actor = user.try(:installation) || user

    if actor.can_have_granular_permissions?
      repo.resources.checks.writable_by?(actor)
    else
      oauth_allows_access?(user, repo) && repo.adminable_by?(actor)
    end
  end

  # A user who has read access to the Actions API
  role :actions_reader do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) # This will pass for GitHub App server-to-server and user-to-server no matter what

    if user.can_have_granular_permissions?
      repo.resources.actions.readable_by?(user)
    else
      repo.resources.contents.readable_by?(user)
    end
  end

  # A user who has write access to the Actions API
  role :actions_writer do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) # This will pass for GitHub App server-to-server and user-to-server no matter what

    if user.can_have_granular_permissions?
      repo.resources.actions.writable_by?(user)
    else
      repo.resources.contents.writable_by?(user)
    end
  end

  # An installation with the actions_dynamic_workflows internal capability and write access to the Actions API
  role :actions_dynamic_workflows_capable do |context|
    user, repo = extract(context, :user, :resource)

    app = current_app_for(user)
    next false if ProgrammaticAccess::TYPES.include? app.class
    next false unless Apps::Internal.capable?(:actions_dynamic_workflows, app: app)
    repo.resources.actions.writable_by?(user) || repo.resources.contents.writable_by?(user)
  end

  # A user who has access to write to the Enterprise self-hosted runners API
  role :business_self_hosted_runners_writer, scope: %w(manage_runners:enterprise) do |context|
    user, business = extract(context, :user, :resource)

    next false unless user
    next false if user.can_have_granular_permissions?

    business.adminable_by?(user)
  end

  # A user who has access to write to the Enterprise Actions API
  role :enterprise_actions_writer, scope: %w(admin:enterprise) do |context|
    user, business = extract(context, :user, :resource)

    next false unless user
    next false if user.can_have_granular_permissions?

    business.adminable_by?(user)
  end

  # A user who has access to write to the Organization Actions Permisions API
  # Checks fine grained permission
  role :organization_actions_settings_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions? ## user is a programmatic actor
      org.resources.organization_administration.writable_by?(user)
    else
      org.can_write_organization_actions_settings?(user) # Fine grained permission includes org admin
    end
  end

  # A user who has access to read from the Organization Actions Permisions API
  # Checks fine grained permission
  role :organization_actions_settings_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions? ## user is a programmatic actor
      org.resources.organization_administration.readable_by?(user)
    else
      org.can_write_organization_actions_settings?(user) # Fine grained permission includes org admin
    end
  end

  # A user who has access to write to the Runner and Runner groups APIs
  # Checks fine grained permission
  role :organization_runners_and_runner_groups_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions? ## user is a programmatic actor
      org.resources.organization_administration.writable_by?(user)
    else
      org.can_write_organization_runners_and_runner_groups?(user) # Fine grained permission includes org admin
    end
  end

  # A user who has access to read to the Runner and Runner groups APIs
  # Checks fine grained permission
  role :organization_runners_and_runner_groups_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions? ## user is a programmatic actor
      org.resources.organization_administration.readable_by?(user)
    else
      org.can_write_organization_runners_and_runner_groups?(user) # Fine grained permission includes org admin
    end
  end

  # A user who has access to write to the Organization self-hosted runners API
  role :org_self_hosted_runners_or_runners_and_runner_groups_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions?
      org.resources.organization_self_hosted_runners.writable_by?(user)
    else
      org.can_write_organization_runners_and_runner_groups?(user)
    end
  end

  # A user who has access to read the Organization self-hosted runners API
  role :org_self_hosted_runners_or_runners_and_runner_groups_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions?
      org.resources.organization_self_hosted_runners.readable_by?(user)
    else
      org.can_write_organization_runners_and_runner_groups?(user)
    end
  end

  # A user who has access to write to the Organization custom hosted runners API
  role :org_larger_runners_writer, scope: %w(manage_runners:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user

    if user.can_have_granular_permissions?
      org.resources.organization_administration.writable_by?(user)
    else
      org.can_write_organization_runners_and_runner_groups?(user)
    end
  end

  # A user who has access to read the Organization custom hosted runners API
  role :org_larger_runners_reader, scope: %w(manage_runners:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user

    if user.can_have_granular_permissions?
      org.resources.organization_administration.readable_by?(user)
    else
      org.can_write_organization_runners_and_runner_groups?(user)
    end
  end

  # A user who has access to write to the Organization hosted compute network configuration API
  role :org_network_configurations_writer, scope: %w(write:network_configurations) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user

    if user.can_have_granular_permissions?
      org.resources.organization_network_configurations.writable_by?(user)
    else
      org.can_write_organization_network_configurations?(user)
    end
  end

  # A user who has access to read the Organization hosted compute network configuration API
  role :org_network_configurations_reader, scope: %w(read:network_configurations) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user

    if user.can_have_granular_permissions?
      org.resources.organization_network_configurations.readable_by?(user)
    else
      org.can_read_organization_network_configurations?(user)
    end
  end

  # A user who has access to manage Organization rulesets
  role :org_ref_rules_manager, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    next false unless user

    org.can_manage_organization_ref_rules?(user)
  end

  # A user who has access to write the environment secrets for a repository
  role :environment_secrets_writer do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.environments.writable_by?(user)
    else
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to read the environment secrets for a repository
  role :environment_secrets_reader do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.environments.readable_by?(user)
    else
      repo.resources.contents.writable_by?(user)
    end
  end

  role :global_feature_flags_reader do |context|
    actor, user = extract(context, :user, :resource)
    app = current_app_for(user)
    next false unless app
    next false unless Apps::Internal.capable?(:read_flipper_features, app: app)

    # the role is accessed twice, first by the GitHub App and then by the user
    user_for_staff_check = actor.can_have_granular_permissions? ? user : actor

    next false unless user_for_staff_check.metadata&.is_staff?
    repo = GitHub.trusted_oauth_apps_owner.repositories.find_by(name: "github", owner_login: "github")
    repo && repo.resources.contents.readable_by?(actor)
  end

  # A user who has access to write to the Secrets API
  role :actions_secrets_writer do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.secrets.writable_by?(user)
    else
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to read the Secrets API
  role :actions_secrets_reader do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.secrets.readable_by?(user)
    else
      # Users with write access may read secrets. This does not give access to values. Metadata only.
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to write to the Organization secrets API
  # Uses fine grained permission
  role :organization_actions_secrets_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions?
      org.resources.organization_secrets.writable_by?(user)
    else
      org.can_write_organization_actions_secrets?(user) # Fine grained permission includes org admin
    end
  end

  # A user who has access to read the Organization secrets API
  # Uses fine grained permission
  role :organization_actions_secrets_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions?
      org.resources.organization_secrets.readable_by?(user)
    else
      org.can_write_organization_actions_secrets?(user) # Fine grained permission includes org admin
    end
  end

  # A user who has access to write to the Dependabot Secrets API
  role :dependabot_secrets_writer do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.dependabot_secrets.writable_by?(user)
    else
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to read the Dependabot Secrets API
  role :dependabot_secrets_reader do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.dependabot_secrets.readable_by?(user)
    else
      # Users with write access may read secrets. This does not give access to values. Metadata only.
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to write to the Organization Dependabot Secrets API
  role :org_dependabot_secrets_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user

    if user.can_have_granular_permissions?
      org.resources.organization_dependabot_secrets.writable_by?(user)
    else
      org.adminable_by?(user)
    end
  end

  # A user who has access to read the Organization Dependabot Secrets API
  role :org_dependabot_secrets_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user

    if user.can_have_granular_permissions?
      org.resources.organization_dependabot_secrets.readable_by?(user)
    else
      org.adminable_by?(user)
    end
  end

  # A user who has access to write the environment variables for a repository
  role :environment_variables_writer do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.environments.writable_by?(user)
    else
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to read the environment variables for a repository
  role :environment_variables_reader do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.environments.readable_by?(user)
    else
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to write to the Variables API
  role :actions_variables_writer do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.actions_variables.writable_by?(user)
    else
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to read the Variables API
  role :actions_variables_reader do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo)

    if user.can_have_granular_permissions?
      repo.resources.actions_variables.readable_by?(user)
    else
      # Users with write access may read variables.
      repo.resources.contents.writable_by?(user)
    end
  end

  # A user who has access to write to the Organization variables API
  # Checks fine grained permission
  role :organization_actions_variables_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions?
      org.resources.organization_actions_variables.writable_by?(user)
    else
      org.can_write_organization_actions_variables?(user) # Fine grained permission includes org admin
    end
  end

  # A user who has access to read the Organization variables API
  # Checks fine grained permission
  role :organization_actions_variables_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)

    next false unless user && org

    if user.can_have_granular_permissions?
      org.resources.organization_actions_variables.readable_by?(user)
    else
      org.can_write_organization_actions_variables?(user) # Fine grained permission includes org admin
    end
  end

  # An integrator with access to write content references and attachments
  role :content_reference_integration_writer do |context|
    actor, content_reference = extract(context, :user, :resource)

    # Currently we only support content references on repository level resources
    # this check will need to be updated when this changes
    actor.can_have_granular_permissions? && content_reference.writable_by?(actor)
  end

  # An integrator with access to read content references and attachments
  role :content_reference_integration_reader do |context|
    actor, content_reference = extract(context, :user, :resource)

    # Currently we only support content references on repository level resources
    # this check will need to be updated when this changes
    actor.can_have_granular_permissions? && content_reference.readable_by?(actor)
  end

  # Integration-centric roles

  # An actor can search on user installation repositories
  role :user_installations_repos_searcher do |context|
    actor, user = extract(context, :user, :authenticated_user)

    if actor.bot? && user
      user.using_auth_via_integration?
    else
      actor.using_auth_via_integration?
    end
  end

  # An actor with privilege to read metadata about the given integration
  # installation
  role :integration_installation_self do |context|
    user, installation = extract(context, :user, :installation)
    user.respond_to?(:installation) && user.installation == installation
  end

  # A GitHub App installation acting on itself.
  role :authenticated_installation_self do |context|
    actor, resource = extract(context, :user, :resource)
    actor.can_have_granular_permissions? && actor.installation == resource
  end

  # A user that can modify a Marketplace::Listing and its images.
  role :marketplace_listing_writer do |context|
    user, listing = extract(context, :user, :marketplace_listing)
    user && (listing.adminable_by?(user) || user.can_admin_marketplace_listings?)
  end

  # A user that can read a SponsorsListing.
  role :sponsors_listing_reader do |context|
    actor, sponsors_listing, sponsorable = extract(context, :user, :sponsors_listing, :resource)
    next false unless sponsorable && sponsors_listing && sponsorable == sponsors_listing.sponsorable
    next false if sponsorable.organization? && !scope?(actor, "read:org")
    next false if sponsorable.user? && !scope?(actor, "read:user")

    sponsors_listing.readable_by?(actor)
  end

  # A user that can modify a SponsorsListing or create one to represent themselves or an organization.
  role :sponsors_listing_writer do |context|
    actor, sponsorable = extract(context, :user, :resource)
    next false unless actor && sponsorable
    next false if sponsorable.organization? && !scope?(actor, "admin:org")
    next false if sponsorable.user? && !scope?(actor, "user")

    sponsors_listing = sponsorable.sponsors_listing
    (sponsors_listing || sponsorable).adminable_by?(actor)
  end

  role :sponsors_activity_reader do |context|
    actor, activity, sponsor = extract(context, :user, :sponsors_activity, :resource)
    next false unless actor && sponsor && activity
    next false if sponsor.organization? && !scope?(actor, "read:org")
    next false if sponsor.user? && !scope?(actor, "read:user")

    activity.readable_by?(actor)
  end

  role :sponsorship_newsletter_reader do |context|
    actor, newsletter, sponsorable = extract(context, :user, :sponsorship_newsletter, :resource)
    next false unless actor && sponsorable && newsletter
    next false if sponsorable.organization? && !scope?(actor, "read:org")
    next false if sponsorable.user? && !scope?(actor, "read:user")

    newsletter.readable_by?(actor)
  end

  # A user that can read a SponsorsTier.
  role :sponsors_tier_reader do |context|
    user, tier, sponsorable = extract(context, :user, :sponsors_tier, :resource)
    next false unless user && tier && sponsorable
    next false unless sponsorable == tier.sponsorable
    next false if sponsorable.organization? && !scope?(user, "read:org")
    next false if sponsorable.user? && !scope?(user, "read:user")

    tier.readable_by?(user)
  end

  # A user that can read SponsorsListing admin-only information for a SponsorsTier.
  role :sponsors_tier_admin_info_reader do |context|
    actor, tier, sponsorable = extract(context, :user, :sponsors_tier, :resource)
    next false unless actor && tier && sponsorable
    next false if sponsorable.organization? && !scope?(actor, "read:org")
    next false if sponsorable.user? && !scope?(actor, "read:user")

    tier.adminable_by?(actor)
  end

  # A user that has read access to a SponsorsGoal.
  role :sponsors_goal_reader do |context|
    actor, goal, sponsorable = extract(context, :user, :sponsors_goal, :resource)
    next unless actor && sponsorable && goal
    next unless sponsorable == goal.sponsorable
    next false if sponsorable.organization? && !scope?(actor, "read:org")
    next false if sponsorable.user? && !scope?(actor, "read:user")

    goal.readable_by?(actor)
  end

  # A user that can modify a Sponsorship or create a new one with the resource as the sponsor.
  role :sponsorship_writer do |context|
    actor, sponsorship, sponsor = extract(context, :user, :sponsorship, :resource)
    next unless actor && sponsor
    next false if sponsor.organization? && !scope?(actor, "admin:org")
    next false if sponsor.user? && !scope?(actor, "user")

    if sponsorship # can the existing sponsorship from the sponsor be modified
      next false unless sponsorship.sponsor_id == sponsor.id
      sponsorship.adminable_by?(actor)
    else # check if the actor can create a new sponsorship from the given sponsor
      actor.potential_sponsor_ids.include?(sponsor.id)
    end
  end

  # A user that can read their installations via an Integration
  role :user_installations_reader do |context|
    user, authenticated_user = extract(context, :user, :authenticated_user)
    next false unless user

    user.using_auth_via_integration? ||
      (user.bot? && authenticated_user&.using_auth_via_integration?)
  end

  # A user that can list repositories on an installation that the user can access
  role :user_installation_repos_lister do |context|
    user, installation = extract(context, :user, :resource)

    next false unless user
    allowed_auth = user.using_basic_auth? ||
      user.using_personal_access_token? && (
        installation.target.organization? && scope?(user, "read:org") ||
        installation.target.user? && scope?(user, "read:user")
      ) ||
      user.using_auth_via_integration?

    allowed_auth && user.can_access_installation?(installation)
  end

  # A user that can add/remove the given repository to/from the installation
  role :user_repo_installation_writer do |context|
    user, installation, repository = extract(context, :user, :installation, :resource)

    next false unless user
    allowed_auth = user.using_basic_auth? ||
      user.using_personal_access_token? && scope?(user, "repo")

    next false unless allowed_auth
    target = repository.owner
    next false unless target == installation.target

    installation.integration.installable_on_by?(target: target, actor: user, repository_ids: [repository.id])
  end

  def self.app_owner_is_enterprise_managed?(app)
    if app.owner.is_a?(Organization)
      app.owner.async_business.sync # force a load
      return app.owner.enterprise_managed_user_enabled?
    end

    if app.owner.is_a?(User)
      return app.owner.is_enterprise_managed?
    end

    false
  end

  def self.fetch_enterprise_managed_business_for(item)
    case item
    when Organization
      return item.business if item.enterprise_managed_user_enabled?
    when Business
      return item if item.enterprise_managed_user_enabled?
    when Bot
      return T.must(item.integration).owner.business if app_owner_is_enterprise_managed?(item.integration)
    when User
      return item.enterprise_managed_business if item.is_enterprise_managed?
    else
      # we should not reach here. If we do, log and do nothing
      GitHub.logger.info("#{item} is not an org, biz or user.", "code.function" => "#fetch_enterprise_managed_business_for")
    end
  end

  def self.app_owner_same_enterprise_managed_business?(app, user)
    fetch_enterprise_managed_business_for(app.owner) == fetch_enterprise_managed_business_for(user)
  end

  role :github_app_reader do |context|
    user, app = extract(context, :user, :resource)

    next false if GitHub.flipper[:deny_anonymous_emu_github_app_access].enabled?(app.owner) && app_owner_is_enterprise_managed?(app) && !app_owner_same_enterprise_managed_business?(app, user)
    next true if app.public?
    next false unless user

    if (installation = user.try(:installation))
      # Installations are allowed to read themselves:
      next true if installation.integration_id == app.id
    else
      owner = app.owner
      next scope?(user, "read:user") if owner.id == user.id
      next scope?(user, "read:org")  if owner.is_a?(Organization) && owner.resources.members.readable_by?(user)
    end
  end

  role :github_app_manager do |context|
    user, app = extract(context, :user, :resource)

    next false unless app
    next false unless user

    app.ip_allowlist_manageable_by?(user)
  end

  # Apps are allowed to write their own credentials for Launch.
  role :launch_app do |context|
    app, user = extract(context, :app, :user)
    app && user.try(:integration) == app
  end

  role :presence_participant do |context|
    user, repo = extract(context, :user, :resource)
    actor = user.try(:installation) || user

    next false unless repo.resources.contents.writable_by?(actor)
    oauth_allows_access?(user, repo)
  end

  # This check allows access to asset uploading endpoints only to clients using
  # the GitHub Mobile OAuth ID. Since the Mobile OAuth client secret is distributed
  # within the client applications, any consumer can extract this secret and make
  # requests identifying as this OAuth app to bypass this restriction. Therefore,
  # this check is to prevent casual public access to this API and should not be used
  # to enforce any sort of trustworthy identification of the GitHub Mobile apps.
  role :github_mobile_apps_upload_asset, scope: %w(user repo user:assets) do |context|
    user = extract(context, :user)

    # GitHub mobile apps are all oauth apps at this point
    next false unless user.using_auth_via_oauth_application?

    # Ensure they are specific oauth apps
    app = user.oauth_access.application
    # TODO: Don't assume that these Apps will exist, be defensive here.
    android_app_id = Apps::Internal.oauth_application(:android_mobile).id
    ios_app_id = Apps::Internal.oauth_application(:ios_mobile).id
    (app.id == ios_app_id || app.id == android_app_id)
  end

  # Mobile Apps can auth as a user to create tokens for support ticket submission
  role :github_mobile_apps_support_token, scope: %w(user) do |context|
    user = extract(context, :user)

    # GitHub mobile apps are all oauth apps at this point
    next false unless user.using_auth_via_oauth_application?

    # Ensure they are specific oauth apps
    app = user.oauth_access.application
    # TODO: Don't assume that these Apps will exist, be defensive here.
    android_app_id = Apps::Internal.oauth_application(:android_mobile).id
    ios_app_id = Apps::Internal.oauth_application(:ios_mobile).id
    (app.id == ios_app_id || app.id == android_app_id)
  end

  # A user who has write access to the codespace.
  role :codespace_writer do |context|
    user, codespace = extract(context, :user, :resource)
    if codespace.is_a?(Repository)
      codespace = extract(context, :codespace)
    end

    next false unless is_using_codespaces_app?(user)
    next false if user.using_auth_via_oauth_application? && !scope?(user, "repo")
    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.using_auth_via_oauth_application?
      codespace.writable_by?(user)
    elsif user.using_auth_via_integration?
      codespace.writable_by?(user) && is_scoped_to_repository?(user.oauth_access.installation, codespace.repository_id)
    else
      user.can_have_granular_permissions? && is_scoped_to_repository?(user.installation, codespace.repository_id)
    end
  end

  # This is introduced as a replacement for `codespace_updater_public`, unchanged except for
  # the `context` that is passed in, which is intended to fix authorization bugs for organization members.
  role :codespace_updater do |context|
    user, repo, codespace = extract(context, :user, :resource, :codespace)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      repo.resources.codespaces.writable_by?(user)
    elsif user.using_auth_via_granular_actor?
      codespace.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  role :codespace_updater_public do |context|
    user, repo, codespace = extract(context, :user, :repo, :resource)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      repo.resources.codespaces.writable_by?(user)
    elsif user.using_auth_via_granular_actor?
      codespace.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  role :codespace_publisher_public, scope: "codespace" do |context|
    user, codespace = extract(context, :user, :resource)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      codespace.repository.resources.codespaces.writable_by?(user)
    elsif user.using_auth_via_granular_actor?
      codespace.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  role :codespace_creator_public do |context|
    user, repo = extract(context, :user, :repo)
    if user.can_have_granular_permissions?
      repo.resources.codespaces.writable_by?(user)
    elsif user.using_auth_via_granular_actor?
      repo.readable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && repo.readable_by?(user)
    else
      false
    end
  end

  # This is introduced as a replacement for `codespace_reader_public`, unchanged except for
  # the `context` that is passed in, which is intended to fix authorization bugs for organization members.
  role :codespace_reader do |context|
    user, repo, codespace = extract(context, :user, :resource, :codespace)
    if user.can_have_granular_permissions? # on behalf of token/app with PAT v2 or GitHub apps
      repo.resources.codespaces.readable_by?(user)
    elsif user.using_auth_via_granular_actor?  # on behalf of user with PAT v2 or GitHub apps
      codespace.writable_by?(user)
    elsif user.using_oauth? || user.using_auth_via_oauth_application?
      # Coarse-grained PAT (classic) or OAuth applications (like the VS Code extension, LWE, JetBrains, etc.)
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  role :codespace_reader_public do |context|
    user, repo, codespace = extract(context, :user, :repo, :resource)
    if user.can_have_granular_permissions? # on behalf of token/app with PAT v2 or GitHub apps
      repo.resources.codespaces.readable_by?(user)
    elsif user.using_auth_via_granular_actor?  # on behalf of user with PAT v2 or GitHub apps
      codespace.writable_by?(user)
    elsif user.using_oauth? || user.using_auth_via_oauth_application?
      # Coarse-grained PAT (classic) or OAuth applications (like the VS Code extension, LWE, JetBrains, etc.)
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  role :codespace_lister_public do |context|
    user = extract(context, :user)

    if user.can_have_granular_permissions? || user.using_auth_via_granular_actor?
      # since the token could be associated with many repositories, we need to check fine grained permissions in ProgrammaticActor::RepositoryFilter instead
      true
    elsif user.using_oauth?
      scope?(user, "codespace")
    else
      false
    end
  end

  role :codespace_lister_for_org_public, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    org.resources.organization_codespaces.readable_by?(user) || org.admins.include?(user)
  end

  role :organization_codespace_writer, scope: %w(admin:org) do |context|
    user, org, codespace = extract(context, :user, :resource, :codespace)

    root_repo = codespace.repository.fork? ? codespace.repository.parent : codespace.repository

    org.admins.include?(user) || (
      org.resources.organization_codespaces.writable_by?(user) &&
      root_repo.resources.codespaces.writable_by?(user)
    )
  end

  role :organization_codespace_lifecycle_admin_updater_public, scope: %w(admin:org) do |context|
    user, org, codespace = extract(context, :user, :resource, :codespace)

    org.admins.include?(user) || (org.resources.organization_codespaces.writable_by?(user) &&
      codespace.repository.resources.codespaces_lifecycle_admin.writable_by?(user))
  end

  role :organization_codespaces_settings_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    org.resources.organization_codespaces_settings.readable_by?(user) || org.admins.include?(user)
  end

  role :organization_codespaces_settings_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    org.resources.organization_codespaces_settings.writable_by?(user) || org.admins.include?(user)
  end

  role :codespace_reader_for_repo_public do |context|
    user, repo, codespace = extract(context, :user, :repo, :resource)

    if user.can_have_granular_permissions?
      repo.resources.codespaces.readable_by?(user)
    elsif user.using_auth_via_granular_actor?
      repo.readable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && repo.readable_by?(user)
    else
      false
    end
  end

  # A user who has access to list the user's codespaces.
  role :codespace_lister do |context|
    user, owner = extract(context, :user, :resource)

    next false unless is_using_codespaces_app?(user)
    next false if user.using_auth_via_oauth_application? && !scope?(user, "repo")

    if user.using_auth_via_oauth_application? || user.using_auth_via_integration?
      user == owner
    else
      user.can_have_granular_permissions?
    end
  end

  # A user who has access to list the user's codespaces.
  role :codespace_lister_for_repo do |context|
    user, resource, repo, owner = extract(context, :user, :resource, :repo, :owner)

    next false unless is_using_codespaces_app?(user)
    next false if user.using_auth_via_oauth_application? && !scope?(user, "repo")

    if user.using_auth_via_oauth_application? || user.using_auth_via_integration?
      user == owner && repo.readable_by?(user)
    else
      user.can_have_granular_permissions?
    end
  end

  # A user who has access to a codespace on a given repo.
  role :codespace_creator do |context|
    user, owner, repo = extract(context, :user, :resource, :repo)
    next false unless is_using_codespaces_app?(user)
    next false if user.using_auth_via_oauth_application? && !scope?(user, "repo")
    if user.using_auth_via_oauth_application?
      user == owner
    elsif user.using_auth_via_integration?
      user == owner && is_scoped_to_repository?(user.oauth_access.installation, repo.id)
    else
      user.can_have_granular_permissions? && is_scoped_to_repository?(user.installation, repo.id)
    end
  end

  # This is introduced as a replacement for `codespace_lifecycle_admin_updater_public`, unchanged except for
  # the `context` that is passed in, which is intended to fix authorization bugs for organization members.
  role :codespace_lifecycle_admin_updater do |context|
    user, repo, codespace = extract(context, :user, :resource, :codespace)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      repo.resources.codespaces_lifecycle_admin.writable_by?(user)
    elsif user.using_auth_via_granular_actor?
      codespace.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  role :codespace_lifecycle_admin_updater_public do |context|
    user, codespace, repo = extract(context, :user, :resource, :repo)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      repo.resources.codespaces_lifecycle_admin.writable_by?(user)
    elsif user.using_auth_via_granular_actor?
      codespace.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  # This is introduced as a replacement for `codespace_lifecycle_admin_reader_public`, unchanged except for
  # the `context` that is passed in, which is intended to fix authorization bugs for organization members.
  role :codespace_lifecycle_admin_reader, scope: "codespace" do |context|
    user, repo, codespace = extract(context, :user, :resource, :codespace)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      repo.resources.codespaces_lifecycle_admin.readable_by?(user)
    else
      codespace.writable_by?(user)
    end
  end

  role :codespace_lifecycle_admin_reader_public, scope: "codespace" do |context|
    user, codespace, repo = extract(context, :user, :resource, :repo)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      repo.resources.codespaces_lifecycle_admin.readable_by?(user)
    else
      codespace.writable_by?(user)
    end
  end

  role :codespace_owner_lister do |context|
    user, owner = extract(context, :user, :resource)

    scope?(user, "repo") && user == owner
  end

  role :codespace_repo_metadata_reader_public do |context|
    user, repo = extract(context, :user, :repo)

    if user.can_have_granular_permissions?
      repo.resources.codespaces_metadata.readable_by?(user)
    elsif user.using_auth_via_granular_actor?
      repo.resources.metadata.readable_by?(user)
    elsif user.using_oauth?
      scope?(user, "repo") && repo.resources.metadata.readable_by?(user)
    else
      false
    end
  end

  # This is introduced as a replacement for `codespace_metadata_reader_public`, unchanged except for
  # the `context` that is passed in, which is intended to fix authorization bugs for organization members.
  role :codespace_metadata_reader do |context|
    user, repo, codespace = extract(context, :user, :resource, :codespace)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      repo.resources.codespaces_metadata.readable_by?(user)
    elsif user.using_auth_via_granular_actor?
      codespace.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  role :codespace_metadata_reader_public do |context|
    user, repo, codespace = extract(context, :user, :repo, :resource)

    if user.bot? && integration_can_scope_to_a_codespace?(context.integration)
      codespace.resources.codespace_metadata.readable_by?(user)
    elsif user.can_have_granular_permissions?
      repo.resources.codespaces_metadata.readable_by?(user)
    elsif user.using_auth_via_granular_actor?
      codespace.writable_by?(user)
    elsif user.using_oauth?
      scope?(user, "codespace") && codespace.writable_by?(user)
    else
      false
    end
  end

  # A user who has access to prebuild codespaces new apis
  role :codespace_prebuilder do |context|
    user, workflow_run = extract(context, :user, :resource)

    return false unless workflow_run.is_a?(::Actions::WorkflowRun)

    user && workflow_run.resources.codespaces_prebuild.writable_by?(user)
  end

  # A user who is using the codespaces app to authenticate
  role :codespace_user do |context|
    user, _ = extract(context, :user, :resource)

    is_using_codespaces_app?(user)
  end

  role :codespaces_secrets_reader do |context|
    user = extract(context, :user)

    # Skip bot checks
    next true if user.can_have_granular_permissions?
    (!user.using_oauth? && user.resources.codespaces_user_secrets.readable_by?(user)) || (user.using_oauth? && scope?(user, "codespace:secrets"))
  end

  role :codespaces_secrets_writer do |context|
    user = extract(context, :user)

    # Skip bot checks
    next true if user.can_have_granular_permissions?
    (!user.using_oauth? && user.resources.codespaces_user_secrets.writable_by?(user)) || (user.using_oauth? && scope?(user, "codespace:secrets"))
  end

  # A user who has access to write to the Codespaces Repo Secrets API
  role :repo_codespaces_secrets_writer do |context|
    user, repo = extract(context, :user, :resource)

    next false if user.using_oauth? && !(oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo))

    if user.can_have_granular_permissions?
      # Note that we're reusing the same permission here as for user secrets being applied to a repository.
      # The else clause below should also require the repo's contents are writable by the user.
      repo.resources.codespaces_secrets.writable_by?(user)
    else
      # Admins of this repo that can create codespaces can write secrets to it. This does not give access to values. Metadata only.
      repo.resources.administration.writable_by?(user) && Codespaces::RepositoryPolicy.async_with_prefill(user, repo).sync.can_attempt_create?
    end
  end

  # A user who has access to read the Codespaces Repo Secrets API
  role :repo_codespaces_secrets_reader do |context|
    user, repo = extract(context, :user, :resource)

    next false if user.using_oauth? && !(oauth_allows_access?(user, repo) && oauth_application_policy_satisfied?(user, repo))

    if user.can_have_granular_permissions?
      # Note that we're reusing the same permission here as for user secrets being applied to a repository.
      # The else clause below should also require the repo's contents are writable by the user.
      repo.resources.codespaces_secrets.readable_by?(user)
    else
      # Users with write access and the ability to create codespaces on this repo can read its secrets. This does not give access to values. Metadata only.
      repo.resources.contents.writable_by?(user) && Codespaces::RepositoryPolicy.async_with_prefill(user, repo).sync.can_attempt_create?
    end
  end

  role :org_codespaces_secrets_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    org.resources.organization_codespaces_secrets.readable_by?(user)
  end

  role :org_codespaces_secrets_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    org.resources.organization_codespaces_secrets.writable_by?(user)
  end

  # A user using the lightweight web editor to authenticate
  role :lightweight_web_editor_user do |context|
    user = extract(context, :user)

    user && is_using_lightweight_web_editor_token?(user)
  end

  # A user using the lightweight web editor against a repo
  role :lightweight_web_editor do |context|
    user, repo = extract(context, :user, :resource)

    user && is_using_lightweight_web_editor_token?(user) &&
      repo && oauth_allows_access?(user, repo) && repo.readable_by?(user)
  end

  # A user using the vscode dev editor against a repo
  role :vscode_editor do |context|
    user, repo = extract(context, :user, :resource)

    next false unless oauth_allows_access?(user, repo)
    next false unless is_using_vscode_editor?(user)

    repo.resources.metadata.readable_by?(user)
  end

  def self.is_scoped_to_repository?(installation, repository_id)
    return false if installation.nil?
    installation.repository_ids(repository_ids: [repository_id]).any?
  end

  def self.is_using_codespaces_app?(user)
    app = current_app_for(user)
    ::Apps::Internal.capable?(:access_codespaces, app: app)
  end

  def self.is_using_lightweight_web_editor_token?(user)
    ::Apps::Internal.oauth_application(:lightweight_web_editor) == current_app_for(user)
  end

  def self.is_using_vscode_editor?(user)
    ::Apps::Internal.oauth_application(:vscode_auth_server) == current_app_for(user)
  end

  # Internal: The "App" associated with the current request based on the user/actor.
  #
  # Returns an Integration, OauthApplication, UserProgrammaticAccess or nil.
  def self.current_app_for(user)
    return unless user
    if user.can_have_granular_permissions?
      if user.is_a?(ProgrammaticAccessBot)
        user.user_programmatic_access
      else
        user.integration
      end
    elsif user.using_auth_via_integration?
      user.oauth_access.application
    elsif user.using_auth_via_oauth_application?
      user.oauth_application
    end
  end

  # A user who has access to write to the Enterprise Advanced Security API
  role :enterprise_advanced_security_writer, scope: %w(admin:enterprise) do |context|
    user, business = extract(context, :user, :resource)

    next false unless user
    next false if user.can_have_granular_permissions?

    business.adminable_by?(user)
  end

  role :security_events_reader, scope: %w[public_repo security_events] do |context|
    user, resource = extract(context, :user, :resource)
    next false unless user

    if resource.is_a?(PullRequest)
      pull_request = resource
      repository = resource.repository
    else
      repository = resource
    end

    actor = user.try(:installation) || user
    unless scope?(actor, "security_events")
      next false unless repository.public? && scope?(actor, "public_repo")
    end

    repository.resources.security_events.readable_by?(actor) || (pull_request && T.unsafe(pull_request.resources).sarifs.readable_by?(actor))
  end

  role :security_events_writer, scope: %w[public_repo security_events] do |context|
    user, resource = extract(context, :user, :resource)
    next false unless user

    if resource.is_a?(PullRequest)
      pull_request = resource
      repository = resource.repository
    else
      repository = resource
    end

    actor = user.try(:installation) || user
    unless scope?(actor, "security_events")
      next false unless repository.public? && scope?(actor, "public_repo")
    end

    CodeScanningRepositoryConfig.new(repository).code_scanning_upload_endpoint_available? &&
      ((pull_request && T.unsafe(pull_request.resources).sarifs.writable_by?(actor)) ||
       repository.resources.security_events.writable_by?(actor))
  end

  role :code_scanning_analysis_deleter do |context|
    user, resource = extract(context, :user, :resource)
    next false unless user

    repository = resource

    # An app shows up here as a bot user. In this case, we want to retrieve the specific installation for it.
    actor = user.try(:installation) || user
    unless scope?(actor, "security_events")
      next false unless repository.public? && scope?(actor, "public_repo")
    end

    next false unless CodeScanningRepositoryConfig.new(repository).code_scanning_upload_endpoint_available?

    # App installations and fine-grained PATs have granular permissions and can be granted the security_events permission.
    # For users, call code_scanning_analyses_deletable_by? which checks against authz.
    # We could move the app-specific logic into authzd, but keeping it here is more consistent with other Code Scanning
    # authorization checks.
    if actor.can_have_granular_permissions?
      repository.resources.security_events.writable_by?(actor)
    else
      repository.code_scanning_analyses_deletable_by?(actor)
    end
  end

  role :secret_scanning_alerts_api_reader, scope: %w[public_repo security_events]  do |context|
    user, repo = extract(context, :user, :resource)

    next false if repo.public? && !SecretScanning::Features::Repo::TokenScanning.new(repo).feature_available?

    actor = user.try(:installation) || user
    unless scope?(actor, "security_events")
      next false unless repo.public? && scope?(actor, "public_repo")
    end

    repo.resources.secret_scanning_alerts.readable_by?(actor)
  end

  role :secret_scanning_alerts_api_writer, scope: %w[public_repo security_events]  do |context|
    user, repo = extract(context, :user, :resource)

    next false if repo.public? && !SecretScanning::Features::Repo::TokenScanning.new(repo).feature_available?

    actor = user.try(:installation) || user
    unless scope?(actor, "security_events")
      next false unless repo.public? && scope?(actor, "public_repo")
    end

    repo.resources.secret_scanning_alerts.writable_by?(actor)
  end

  role :secret_scanning_push_protection_bypass_writer, scope: "repo"  do |context|
    user, repo = extract(context, :user, :resource)

    next false unless
      SecretScanning::Features::Repo::PushProtection.new(repo).enabled? ||
      SecretScanning::Features::User::PushProtection.new(T.must(user)).enabled?
    next false if
      SecretScanning::Features::Repo::DelegatedBypass.new(repo).enabled? &&
      !SecretScanning::Services::DelegatedBypassService.can_review_bypass_request?(repo, user)

    oauth_allows_access?(user, repo) && repo.resources.contents.writable_by?(user)
  end

  role :org_secret_scanning_alerts_api_reader, scope: %w[public_repo security_events]  do |context|
    actor, org = extract(context, :user, :resource)

    next false unless actor && org

    unless actor.can_have_granular_permissions?
      next SecurityProduct::Permissions::OrgAuthz.new(org, actor:).can_manage_security_products?
    end

    # We need to check the target because we're checking a repository permission without a repository present as a resource.
    next false if actor.ability_delegate.target != org

    granted_permissions = actor.ability_delegate.permissions
    Ability.can_at_least?(:read, granted_permissions["secret_scanning_alerts"])
  end

  role :repo_security_products_manager, scope: "repo" do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo
    next false if repo.owner.user?

    if user.can_have_granular_permissions?
      repo.resources.administration.writable_by?(user)
    else
      SecurityProduct::Permissions::RepoAuthz.new(repo, actor: user).can_manage_security_products?
    end
  end

  role :org_security_products_manager, scope: "write:org" do |context|
    user, org = extract(context, :user, :org)
    org ||= extract(context, :resource)

    next false unless user && org
    next false unless org.organization?

    if user.can_have_granular_permissions?
      org.resources.organization_administration.writable_by?(user)
    else
      SecurityProduct::Permissions::OrgAuthz.new(org, actor: user).can_manage_security_products?
    end
  end

  role :repo_code_security_configuration_reader, scope: "repo" do |context|
    actor = extract(context, :user)
    repo = extract(context, :resource)
    owner = repo.owner

    next false unless actor && owner && repo

    if actor.can_have_granular_permissions?
      repo.resources.administration.readable_by?(actor)
    elsif owner.organization?
      SecurityProduct::Permissions::OrgAuthz.new(owner, actor:).can_manage_security_products?
    else
      SecurityProduct::Permissions::RepoAuthz.new(repo, actor:).can_manage_security_products?
    end
  end

  role :enterprise_code_security_settings_reader, scope: "read:enterprise" do |context|
    user, business = extract(context, :user, :business)
    business ||= extract(context, :resource)

    next false unless user && business

    if user.can_have_granular_permissions?
      business.resources.enterprise_administration.readable_by?(user)
    else
      SecurityProduct::Permissions::BusinessAuthz.new(business, actor: user).can_view_code_security_settings?
    end
  end

  role :enterprise_code_security_settings_writer, scope: "admin:enterprise" do |context|
    user, business = extract(context, :user, :business)
    business ||= extract(context, :resource)

    next false unless user && business

    if user.can_have_granular_permissions?
      business.resources.enterprise_administration.writable_by?(user)
    else
      SecurityProduct::Permissions::BusinessAuthz.new(business, actor: user).can_modify_code_security_settings?
    end
  end

  role :enterprise_secret_scanning_alerts_api_reader, scope: "security_events" do |context|
    user, business = extract(context, :user, :resource)
    # Caller must be a member of the enterprise. We enumerate the orgs to which user
    # has owner/security-manager access to as part of endpoint logic.
    user && business && business.member?(user)
  end

  role :enterprise_code_scanning_alerts_api_reader, scope: "security_events" do |context|
    user, business = extract(context, :user, :resource)
    # Caller must be a member of the enterprise. We enumerate the orgs to which user
    # has owner/security-manager access to as part of endpoint logic.
    user && business && business.member?(user)
  end

  role :enterprise_dependabots_alerts_api_reader, scope: "security_events" do |context|
    user, business = extract(context, :user, :resource)
    # Caller must be a member of the enterprise. We enumerate the orgs to which user
    # has owner/security-manager access to as part of endpoint logic.
    user && business && business.member?(user)
  end

  role :org_code_scanning_alerts_api_reader, scope:  %w[public_repo security_events] do |context|
    actor, org = extract(context, :user, :resource)

    next false unless actor && org

    unless actor.can_have_granular_permissions?
      next SecurityProduct::Permissions::OrgAuthz.new(org, actor:).can_manage_security_products?
    end

    # We need to check the target because we're checking a repository
    # permission below without a repository being present as a resource.
    next false if actor.ability_delegate.target != org

    granted_permissions = actor.ability_delegate.permissions
    Ability.can_at_least?(:read, granted_permissions["security_events"])
  end

  role :org_code_scanning_alerts_for_only_public_repos, scope: "public_repo" do |context|
    user = extract(context, :user)
    !scope?(user, "security_events")
  end

  role :org_secret_scanning_alerts_for_only_public_repos, scope: "public_repo" do |context|
    user = extract(context, :user)
    !scope?(user, "security_events")
  end

  role :org_dependabot_alerts_api_reader, scope:  %w[public_repo security_events] do |context|
    actor, org = extract(context, :user, :resource)

    next false unless actor && org

    unless actor.can_have_granular_permissions?
      next SecurityProduct::Permissions::OrgAuthz.new(org, actor:).can_manage_security_products?
    end

    # We need to check the target because we're checking a repository
    # permission below without a repository being present as a resource.
    next false if actor.ability_delegate.target != org

    granted_permissions = actor.ability_delegate.permissions
    Ability.can_at_least?(:read, granted_permissions["vulnerability_alerts"])
  end

  role :org_repo_advisory_lister, scope:  ["repo"] do |context|
    actor, org = extract(context, :user, :resource)

    next false unless actor && org

    unless actor.can_have_granular_permissions?
      next SecurityProduct::Permissions::OrgAuthz.new(org, actor:).can_manage_security_products?
    end

    # We need to check the target because we're checking a repository
    # permission below without a repository being present as a resource.
    next false if actor.ability_delegate.target != org

    granted_permissions = actor.ability_delegate.permissions
    Ability.can_at_least?(:write, granted_permissions["repository_advisories"])
  end

  # A user that can read discussions in a repo
  role :discussion_reader do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    if discussion
      discussion.readable_by?(user)
    else
      repo.resources.discussions.readable_by?(user)
    end
  end

  role :repo_discussion_reader do |context|
    user, repo = extract(context, :user, :resource)

    next false unless user
    next false unless repo.discussions_on?
    next false unless oauth_allows_access?(user, repo)

    repo.resources.discussions.readable_by?(user)
  end

  role :discussion_label_reader do |context|
    user, repo = extract(context, :user, :repo)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    repo.discussions_metadata_readable_by?(user)
  end

  role :discussion_creator do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo
    next false unless oauth_allows_access?(user, repo)

    user.can_create_discussion?(repo)
  end

  role :discussion_announcement_creator do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    next false unless user && repo
    next false unless oauth_allows_access?(user, repo)

    repo.can_create_discussion_announcements?(user)
  end

  role :discussion_editor do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    discussion.modifiable_by?(user)
  end

  role :discussion_deleter do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    discussion.deletable_by?(user)
  end

  role :discussion_answer_toggler do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    DiscussionComment.can_toggle_answer_in_discussion?(discussion, actor: user)
  end

  role :upvote_toggler do |context|
    user, repo, votable = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    votable.async_upvotable_by?(user).sync
  end

  role :discussion_minimization_toggler do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    DiscussionComment.can_toggle_minimized_discussion_comment?(discussion, actor: user)
  end

  role :discussion_locker do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    discussion.lockable_by?(user)
  end

  role :discussion_unlocker do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    discussion.unlockable_by?(user)
  end

  role :discussion_closer do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    discussion.closable_by?(user)
  end

  role :discussion_reopener do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    discussion.reopenable_by?(user)
  end

  role :discussion_comment_creator do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    discussion.can_comment?(user)
  end

  role :discussion_comment_editor do |context|
    user, repo, comment = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    comment.modifiable_by?(user)
  end

  role :discussion_comment_deleter do |context|
    user, repo, comment = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    comment.deletable_by?(user)
  end

  role :discussion_category_reader do |context|
    user, repo, category = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    category.readable_by?(user)
  end

  role :discussion_poll_voter do |context|
    user, repo, discussion = extract(context, :user, :repo, :resource)

    next false unless user
    next false unless oauth_allows_access?(user, repo)

    discussion.poll_votable_by?(user)
  end

  role :org_reminder_workspace_modifier do |context|
    org, member, workspace = extract(context, :resource, :member, :workspace)
    next true if org.adminable_by?(member)
    workspace.present? && org.member?(member)
  end

  role :org_reminder_workspace_reader do |context|
    org, member = extract(context, :resource, :member)
    true if org.member?(member)
  end

  # A user with access to approve or reject deployments
  # https://github.com/github/github/blob/a2871e2c9e86c33c1fb4e17ee9c4e68c90d0139d/app/models/gate_approver.rb#L25
  role :deployment_approver do |context|
    user, repo = extract(context, :user, :repo)
    repo ||= extract(context, :resource)

    if user&.can_have_granular_permissions?
      repo.resources.deployments.readable_by?(user)
    else
      user && oauth_allows_access?(user, repo) && repo.resources.contents.readable_by?(user)
    end
  end

  role :org_reminders_access do |context|
    org, member = extract(context, :resource, :member)
    true if org.adminable_by?(member)
  end

  role :team_reminders_access do |context|
    org, team, member = extract(context, :resource, :team, :member)
    true if org.adminable_by?(member) || team.adminable_by?(member)
  end

  role :repo_traffic_access do |context|
    user = extract(context, :user)
    next false unless user

    if user.can_have_granular_permissions?
      roles[:repo_administration_reader].has_access?(context)
    else
      repo, key = extract(context, :repo, :public_key)
      repo ||= extract(context, :resource)
      next true if oauth_allows_access?(user, repo) && repo.writable_by?(user) # allow for archived repos
      key && repo && key.deploy_key? && key.repository == repo && !key.read_only?
    end
  end

  role :repo_refs_writer do |context|
    next false unless roles[:repo_contents_writer].has_access?(context)

    repo, actor, before_oid, after_oid = extract(context, :repo, :user, :before_oid, :after_oid)

    # This checks if additional permisstions are needed because workflow updates are being performed
    RefUpdates::WorkflowUpdatesPolicy.new(actor, repo).check_ref_update(before_oid, after_oid).allowed?
  end

  role :repo_refs_updater do |context|
    next false unless roles[:repo_contents_writer].has_access?(context) || (context[:ref_name] && roles[:fork_collab_grantee].has_access?(context))

    repo, actor, before_oid, after_oid = extract(context, :repo, :user, :before_oid, :after_oid)

    # This checks if additional permisstions are needed because workflow updates are being performed
    RefUpdates::WorkflowUpdatesPolicy.new(actor, repo).check_ref_update(before_oid, after_oid).allowed?
  end

  role :repo_refs_mass_updater do |context|
    next false unless roles[:repo_contents_writer].has_access?(context)

    repo, actor, ref_updates = extract(context, :repo, :user, :ref_updates)

    # This checks if additional permisstions are needed because workflow updates are being performed
    RefUpdates::WorkflowUpdatesPolicy.new(actor, repo).check_ref_updates(ref_updates).allowed?
  end

  # Octoshift migrator roles
  role :octoshift_importer do |context|
    user, owner = extract(context, :user, :resource)
    next false unless user && owner

    required_scope = owner.adminable_by?(user) ? "admin:org" : "read:org"
    next false unless scope?(user, required_scope)
    if GitHub.flipper[:octoshift_more_restrictive_scopes].enabled?
      next false unless scope?(user, "repo") && scope?(user, "workflow")
    end

    Octoshift::AuthorizationPolicy.can_import_repo?(user: user, owner: owner)
  end

  role :octoshift_enterprise_importer, scope: %w(read:enterprise admin:org repo workflow)  do |context|
    user, enterprise = extract(context, :user, :resource)
    next false unless user && enterprise

    # ensure all scopes are present
    required_scopes = ["read:enterprise", "admin:org", "repo", "workflow"]
    if user.using_oauth?
      allowed = required_scopes.map do |scope|
        scope?(user, scope)
      end

      allowed.all?
    else
      false
    end
  end

  role :octoshift_exporter, scope: %w[admin:org repo] do |context|
    user, owner = extract(context, :user, :resource)
    actor = user.try(:installation) || user

    next false unless user && owner
    next false unless %w[admin:org repo].all? { |s| scope?(user, s) }
    next false if user.using_auth_via_oauth_application? # GitHub oauth apps are not permitted at this time
    next false if actor.can_have_granular_permissions? # GitHub Apps are not permitted at this time

    Octoshift::AuthorizationPolicy.can_export_repo?(user: user, owner: owner)
  end

  role :permissionless_installation_token_creator do |context|
    Apps::Internal.capable?(:create_permissionless_installation_token, app: context.integration)
  end

  # A user who is using the Desktop app to authenticate
  role :desktop_user do |context|
    is_oauth_app_with_capability?(context, :access_desktop_internal)
  end

  # Users accessing through apps able to subscribe to Alive events
  role :alive_events_subscriber do |context|
    is_oauth_app_with_capability?(context, :subscribe_alive_events)
  end

  role :programmatic_actor_installed_on_some_org_repos do |context|
    user, org = extract(context, :user, :resource)

    programmatic_actor_grant = ProgrammaticActor::Grant.with(user).with_target(org)
    programmatic_actor_grant && !programmatic_actor_grant.installed_on_all_repositories?
  end

  role :copilot_user do |context|
    next false unless GitHub.copilot_enabled?

    user = extract(context, :resource)
    app = current_app_for(user)

    # authentication only happens in app context - we won't bother to instrument this
    next false unless app

    next false unless ::Apps::Internal.capable?(:generate_copilot_cdn_token, app: app)

    true
  end

  # org admin, can assign copilot seats
  role :copilot_org_admin_writer, scope: %w(manage_billing:copilot admin:org) do |context|
    actor, org = extract(context, :user, :resource)
    next false unless GitHub.copilot_enabled?
    next false unless actor && org

    if actor.can_have_granular_permissions?
      org.resources.organization_copilot_seat_management.writable_by?(actor) || org.resources.organization_administration.writable_by?(actor)
    else
      org.adminable_by?(actor)
    end
  end

  # org admin, can read information about an org's copilot subscription and see seats
  # TODO: consolidate this with copilot_org_usage_metrics_reader if we're ok with business admins reading things about org
  role :copilot_org_admin_reader, scope: %w(manage_billing:copilot read:org) do |context|
    actor, org = extract(context, :user, :resource)
    next false unless GitHub.copilot_enabled?
    next false unless actor && org

    if actor.can_have_granular_permissions?
      org.resources.organization_copilot_seat_management.readable_by?(actor) || org.resources.organization_administration.readable_by?(actor)
    else
      org.adminable_by?(actor)
    end
  end

  # enterprise admin or billing manager, can read information about an enterprise's copilot subscription, seats, and usage metrics
  role :copilot_enterprise_admin_reader, scope: %w(manage_billing:copilot read:enterprise) do |context|
    next false unless GitHub.copilot_enabled?
    actor, business = extract(context, :user, :resource)
    next false unless actor && business

    business.resources.enterprise_administration.readable_by?(actor) || business.billing_manager?(actor)
  end

  # org admin or admin or billing manager of parent business, can view usage metrics for org
  role :copilot_org_usage_metrics_reader, scope: %w(manage_billing:copilot read:org read:enterprise) do |context|
    next false unless GitHub.copilot_enabled?

    actor, org = extract(context, :user, :resource)
    next false unless actor && org

    if actor.can_have_granular_permissions?
      org.resources.organization_copilot_seat_management.readable_by?(actor) || org.resources.organization_administration.readable_by?(actor)
    else
      org.adminable_by?(actor) || org.business&.billing_manager?(actor) || (org.business && org.business.resources.enterprise_administration.readable_by?(actor))
    end
  end

  role :knowledge_base_lister, scope: %w(repo) do |context|
    user, actor = extract(context, :user, :authenticated_user)
    next false unless user
    next false unless GitHub.copilot_enabled?
    if user.bot?
      if Flipper[:copilot_knowledge_bases_fgp].enabled?(actor)
        next true if Apps::Internal.capable?(:list_current_user_accessible_knowledge_bases, app: current_app_for(user)) # for global apps
        next true unless user.using_auth_via_granular_actor? # for fine-grained PAT requests
        user.resources.knowledge_bases.readable_by?(user) # for Github apps
      else
        Apps::Internal.capable?(:list_current_user_accessible_knowledge_bases, app: current_app_for(user)) # for global apps
      end
    else
      if Flipper[:copilot_knowledge_bases_fgp].enabled?(actor)
        next false unless Copilot::User.new(user).has_copilot_enterprise_access?
        next true unless user.using_auth_via_granular_actor?
        user.resources.knowledge_bases.readable_by?(user)
      else
        Copilot::User.new(user).has_copilot_enterprise_access?
      end
    end
  end

  role :org_knowledge_base_viewer, scope: %w(read:org repo) do |context|
    next false unless GitHub.copilot_enabled?

    user, org = extract(context, :user, :resource)
    next false unless user && org

    if Flipper[:copilot_org_knowledge_bases_api].enabled?(org)
      next true if org.resources.organization_knowledge_bases.readable_by?(user)
    end

    org.resources.members.readable_by?(user)
  end

  role :knowledge_base_admin do |context|
    user, org = extract(context, :user, :resource)
    next false unless user && org
    next false unless Copilot::Organization.new(org).can_use_copilot_enterprise_features?
    if user.bot?
      Apps::Internal.capable?(:administer_knowledge_base, app: current_app_for(user))
    else
      org.adminable_by?(user)
    end
  end

  role :org_security_managers_reader, scope: "read:org" do |context|
    user, org = extract(context, :user, :resource)
    next false unless user && org

    # TODO: Investigate tucking the IntegrationInstallation resource checks into the FGP auth policy instead.
    # https://github.com/github/security-center/issues/1414
    if user.can_have_granular_permissions?
      org.resources.organization_administration.readable_by?(user)
    else
      SecurityProduct::Permissions::OrgAuthz.new(org, actor: user).can_view_security_managers?
    end
  end

  role :org_security_managers_writer, scope: "write:org" do |context|
    user, org = extract(context, :user, :resource)
    next false unless user && org

    # TODO: Investigate tucking the IntegrationInstallation resource checks into the FGP auth policy instead.
    # https://github.com/github/security-center/issues/1414
    if user.can_have_granular_permissions?
      org.resources.organization_administration.writable_by?(user)
    else
      SecurityProduct::Permissions::OrgAuthz.new(org, actor: user).can_add_security_managers?
    end
  end

  role :org_security_managers_admin, scope: "admin:org" do |context|
    user, org = extract(context, :user, :resource)
    next false unless user && org

    # TODO: Investigate tucking the IntegrationInstallation resource checks into the FGP auth policy instead.
    # https://github.com/github/security-center/issues/1414
    if user.can_have_granular_permissions?
      # The 'organization_administration' resource only has 'read' and 'write' access options.
      # It would need to be added to 'ADMINABLE_SUBJECT_TYPES' in '[...]/models/organization/resources.rb' to have an 'admin' option.
      # But this resource has 'administration' in the name already, so we'll use 'write' as enough to "administer"/remove security managers.
      org.resources.organization_administration.writable_by?(user)
    else
      SecurityProduct::Permissions::OrgAuthz.new(org, actor: user).can_remove_security_managers?
    end
  end

  # A user who has access to read from the Organization Custom Repository Roles API
  role :org_custom_repo_roles_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_custom_roles.readable_by?(user)
  end

  # A user who has access to write to the Organization Custom Repository Roles API
  role :org_custom_repo_roles_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_custom_roles.writable_by?(user)
  end

  # A user who has access to read to the Organization Custom Org Roles API
  role :org_custom_org_roles_reader, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_custom_org_roles.readable_by?(user)
  end

  # A user who has access to write to the Organization Custom Org Roles API
  role :org_custom_org_roles_writer, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_custom_org_roles.writable_by?(user)
  end

  # A user who has access to read enterprise announcements
  role :announcement_banner_reader do |context|
    user, business, resource = extract(context, :user, :business, :resource)
    next false unless user && business && resource
    next false unless user_in_business_for_announcements?(user, business)

    case resource
    when ::Repository
      if user.using_oauth?
        # oauth users need the right permission depending on the repo's visibility
        required_scope = resource.private? ? "repo" : "public_repo"
        scope?(user, required_scope) && resource.resources.contents.readable_by?(user)
      elsif user.can_have_granular_permissions?
        # GH apps need the FGP enabled regardless of repo visibility
        resource.resources.repository_announcement_banners.readable_by?(user)
      else
        # if a human can see the repo, they can see its announcement
        resource.resources.contents.readable_by?(user)
      end
    when ::Organization
      if user.using_oauth?
        # user is a member of the business (checked above), so anouncement is visible with the right scope
        scope?(user, "read:org")
      elsif user.can_have_granular_permissions?
        resource.resources.organization_announcement_banners.readable_by?(user)
      else
        # human user can see the org because they're in the business (checked above), so they can see its announcement
        true
      end
    when ::Business
      # if a human user is in the business (checked above), they can see its announcement.
      # apps can't use enterprise APIs, so disable for them.
      !user.can_have_granular_permissions? && !user.using_auth_via_oauth_application?
    end
  end

  # A user who has access to write enterprise announcements
  role :announcement_banner_writer do |context|
    user, business, resource = extract(context, :user, :business, :resource)
    next false unless user && business && resource
    next false unless user_in_business_for_announcements?(user, business)

    case resource
    when ::Repository
      if user.using_oauth?
        # oauth users need the "repo" scope for write permission regardless of visibility
        scope?(user, "repo") && resource.async_can_edit_announcement_banners?(user).sync
      elsif user.can_have_granular_permissions?
        # GH apps need the FGP enabled regardless of repo visibility
        resource.resources.repository_announcement_banners.writable_by?(user)
      else
        resource.async_can_edit_announcement_banners?(user).sync
      end
    when ::Organization
      if user.using_oauth?
        scope?(user, "write:org") && resource.adminable_by?(user)
      elsif user.can_have_granular_permissions?
        resource.resources.organization_announcement_banners.writable_by?(user)
      else
        # for now, check admin access to org to gate editing for human users
        resource.adminable_by?(user)
      end
    when ::Business
      # only human business admins can write enterprise announcements.
      # apps can't use enterprise APIs, so only enable for humans
      !user.can_have_granular_permissions? && !user.using_auth_via_oauth_application? && business.adminable_by?(user)
    end
  end

  role :organization_programmatic_access_grant_reader do |context|
    actor, organization = extract(context, :user, :resource)
    next false unless actor.can_have_granular_permissions? || actor.using_auth_via_integration?

    organization.resources.organization_personal_access_tokens.readable_by?(actor)
  end

  role :organization_programmatic_access_grant_request_reader do |context|
    actor, organization = extract(context, :user, :resource)
    next false unless actor.can_have_granular_permissions? || actor.using_auth_via_integration?

    organization.resources.organization_personal_access_token_requests.readable_by?(actor)
  end

  role :organization_programmatic_access_grant_request_writer do |context|
    actor, organization = extract(context, :user, :resource)
    next false unless actor.can_have_granular_permissions? || actor.using_auth_via_integration?

    organization.resources.organization_personal_access_token_requests.writable_by?(actor)
  end

  role :organization_programmatic_access_grant_writer do |context|
    actor, organization = extract(context, :user, :resource)
    next false unless actor.can_have_granular_permissions? || actor.using_auth_via_integration?

    organization.resources.organization_personal_access_tokens.writable_by?(actor)
  end

  role :repo_advisory_reader do |context|
    repo, actor, advisory = extract(context, :repo, :user, :resource)

    next false unless repo && actor && scope?(actor, "repo")

    if actor.can_have_granular_permissions?
      repo.resources.repository_advisories.readable_by?(actor)
    else
      advisory.readable_by?(actor)
    end
  end

  role :repo_advisory_lister do |context|
    repo, actor = extract(context, :resource, :user)

    next false unless repo && actor && scope?(actor, "repo")

    if actor.can_have_granular_permissions?
      repo.resources.repository_advisories.readable_by?(actor)
    else
      repo.readable_by?(actor)
    end
  end

  role :repo_advisory_admin do |context|
    repo, actor = extract(context, :repo, :user)

    next false unless repo && actor && scope?(actor, "repo")

    if actor.can_have_granular_permissions?
      repo.resources.repository_advisories.writable_by?(actor)
    else
      repo.advisory_management_authorized_for?(actor)
    end
  end

  role :repo_advisory_temporary_fork_admin do |context|
    repo, actor = extract(context, :repo, :user)

    next false unless repo && actor && scope?(actor, "repo")

    if actor.can_have_granular_permissions?
      repo.resources.repository_advisories.readable_by?(actor) && repo.resources.administration.writable_by?(actor)
    else
      repo.advisory_management_authorized_for?(actor)
    end
  end

  role :repo_advisory_collaborator do |context|
    repo, actor, advisory = extract(context, :repo, :user, :resource)

    next false unless repo && actor && scope?(actor, "repo")

    advisory.collaborator?(actor)
  end

  role :repo_advisory_temporary_fork_collaborator do |context|
    repo, actor, advisory = extract(context, :repo, :user, :resource)

    next false unless repo && actor && scope?(actor, "repo")
    # The only collaborators allowed to start a temp fork are pvd submitters
    next false unless advisory && advisory.user_is_pvd_submitter?(actor)

    if actor.can_have_granular_permissions?
      next false unless repo.resources.administration.writable_by?(actor) && repo.resources.repository_advisories.readable_by?(actor)
    else
      advisory.collaborator?(actor)
    end
  end

  role :repo_advisory_reporter do |context|
    repo, actor = extract(context, :repo, :user)

    next false unless repo && actor && oauth_allows_access?(actor, repo)

    repo.resources.repository_advisories.writable_by?(actor)
  end

  role :global_advisory_reader do |context|
    advisory, actor = extract(context, :resource, :user)
    next false unless advisory

    advisory.readable_by?(actor)
  end

  role :org_custom_properties_reader, scope: %w(read:org) do |context|
    user, org = extract(context, :user, :resource)
    next false unless user

    if user.can_have_granular_permissions?
      org.resources.organization_custom_properties.readable_by?(user)
    else
      org.member?(user)
    end
  end

  role :org_custom_properties_definitions_manager, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    next false unless user

    org.can_manage_organization_custom_properties_definitions?(user)
  end

  role :org_custom_properties_values_editor, scope: %w(admin:org) do |context|
    user, org = extract(context, :user, :resource)
    next false unless user

    org.can_edit_organization_custom_properties_values?(user)
  end

  role :repo_custom_properties_reader, scope: %w(repo) do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user

    if user.can_have_granular_permissions?
      repo.resources.repository_custom_properties.readable_by?(user)
    else
      repo.readable_by?(user)
    end
  end

  role :repo_custom_properties_values_editor, scope: %w(repo) do |context|
    user, repo = extract(context, :user, :resource)
    next false unless user

    repo.async_can_edit_custom_property_values_as_repo_actor?(user).sync
  end

  role :releases_creator do |context|
    # to create a release the user must have write access to repo as well as the workflow scope if modifying
    # a workflow file. The workflow scope check is expensive so only do it if the user has write access to the repo
    next false unless roles[:repo_contents_writer].has_access?(context)

    repo, actor, target_commitish = extract(context, :repo, :user, :target_commitish)
    before_oid = GitHub::NULL_OID
    after_oid = repo.ref_to_sha(target_commitish)

    next true unless after_oid.present?

    workflow_update_decision = RefUpdates::WorkflowUpdatesPolicy.new(actor, repo).check_ref_update(before_oid, after_oid)
    workflow_update_decision.allowed?
  end

  role :licensing_reader, scope: %w(read:enterprise manage_billing:enterprise) do |context|
    user, business = extract(context, :user, :resource)
    user && business && (business.owner?(user) || business.billing_manager?(user))
  end

  role :immutable_actions_migrator do |context|
    # since we are only triggering a dynamic workflow run as part of this endpoint, we do not require the workflow scope/permission, see https://github.com/github/package-registry-team/issues/8063
    # we also give the GITHUB_TOKEN for the migration workflow the following permissions: id-token: write, packages: write, contents: write, actions: read
    user, repo = extract(context, :user, :resource)
    next false unless user

    if user.using_auth_via_granular_actor? || user.can_have_granular_permissions?
      repo.resources.actions.readable_by?(user) && repo.resources.contents.writable_by?(user) && repo.resources.workflows.writable_by?(user)
    elsif user.using_oauth?
      required_scopes = ["write:packages"]
      allowed = required_scopes.map do |scope|
        scope?(user, scope)
      end
      allowed.all? && repo.writable_by?(user)
    else
      false
    end
  end

  def self.is_oauth_app_with_capability?(context, capability)
    user = extract(context, :user)

    # Right now only OAuth apps can do this
    return false unless user.using_auth_via_oauth_application?

    # Ensure they are specific oauth apps
    app = user.oauth_access.application

    Apps::Internal.capable?(capability, app: app)
  end

  def self.integration_can_scope_to_a_codespace?(integration)
    return false unless Apps::Internal.capable?(:static_installation_codespace_permissions, app: integration)

    permissions = Apps::Internal.property(:static_installation_codespace_permissions, app: integration)
    return false unless permissions

    permissions.fetch("codespace_metadata", nil) == :read
  end

  # used by the :enterprise_announcement_reader and :enterprise_announcement_writer roles
  def self.user_in_business_for_announcements?(user, business)
    return false if business.billing_manager?(user)

    # users and apps must be members of the business in question to access announcements
    if user.can_have_granular_permissions?
      return false if user.ability_delegate.target&.business&.id != business.id
    else
      return false if !user.businesses.pluck(:id).include?(business.id)
    end

    true
  end

end
