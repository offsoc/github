# typed: true
# frozen_string_literal: true

# Many repository lifecycle events have been moved to the Hydro event system, via aqueduct-bridge jobs.
# See `SecurityCenter::HydroRepository*Job` classes for more details.
# This file contains the remaining Rails pubsub events to notify Security Center and security features.

GitHub.subscribe "repo.update_default_branch" do |name, _start, _ending, _transaction_id, payload|
  repo_id, org_id = payload.values_at(:repo_id, :org_id)
  repo = Repository.includes(:owner).find_by(id: repo_id)
  next if repo.nil?

  # notifying ourselves here so that we fetch any current code scanning details for the new default branch
  # if/when another analysis completes, we'll be notified and update again
  SecurityCenterUpdater.notify_security_center_for_repo(
    repo,
    repo.owner,
    feature_type: "code_scanning",
    source_event: name,
    payload:,
  )

  SecurityCenterUpdater.notify_security_features_for_repo(
    repo,
    source_event: name,
    payload:,
  )
end

GitHub.subscribe "repo.initial_push" do |name, _start, _ending, _transaction_id, payload|
  repo_id, org_id = payload.values_at(:repo_id, :org_id)

  SecurityCenterUpdater.notify_security_features_for_repo_id(
    repo_id,
    owner_id: org_id,
    source_event: name,
  )
end

GitHub.subscribe "repo.codeql_disabled" do |name, _start, _ending, _transaction_id, payload|
  repo_id, org_id = payload.values_at(:repo_id, :org_id)

  if repo_id && org_id
    SecurityCenterUpdater.notify_security_center_for_repo(
      Repository.find_by(id: repo_id),
      Organization.find_by(id: org_id),
      feature_type: "code_scanning",
      source_event: name,
      payload: payload)
  end
end

GitHub.subscribe "repo.codeql_enabled" do |name, _start, _ending, _transaction_id, payload|
  repo_id, org_id = payload.values_at(:repo_id, :org_id)

  if repo_id && org_id
    SecurityCenterUpdater.notify_security_center_for_repo(
      Repository.find_by(id: repo_id),
      Organization.find_by(id: org_id),
      feature_type: "code_scanning",
      source_event: name,
      payload: payload)
  end
end

GitHub.subscribe("business.add_organization") do |name, _start, _ending, _transaction_id, payload|
  org_id = payload.values_at(:org_id)
  SecurityCenterUpdater.notify_security_center_for_org(org_id, source_event: name)
end

GitHub.subscribe "business.remove_organization" do |name, _start, _ending, _transaction_id, payload|
  org_id = payload.values_at(:org_id)
  SecurityCenterUpdater.notify_security_center_for_org(org_id, source_event: name)
end

GitHub.subscribe "org.transform" do |name, _start, _ending, _transaction_id, payload|
  org_id = payload.values_at(:org_id)
  SecurityCenterUpdater.notify_security_center_for_org(org_id, source_event: name)

  GitHub.dogstats.increment("security_center_notify_for_org_onboarding.completed", tags: ["source_event:#{name}"])
end

GitHub.subscribe "org.advanced_security_toggled" do |name, _start, _ending, _transaction_id, payload|
  SecurityCenter::OwnerReconciliationJob.perform_later(owner_id: payload[:id], source_event: name)
end

GitHub.subscribe "business.advanced_security_toggled" do |name, _start, _ending, _transaction_id, payload|
  SecurityCenter::BusinessReconciliationJob.perform_later(
    business_id: payload[:id],
    source_event: name,
    entity_type: SecurityCenter::BusinessReconciliationJob::EntityType::Organization,
  )

  SecurityCenter::BusinessReconciliationJob.perform_later(
    business_id: payload[:id],
    source_event: name,
    entity_type: SecurityCenter::BusinessReconciliationJob::EntityType::User,
  )
end

GlobalInstrumenter.subscribe "security_center.dependabot_config_change" do |name, _start, _ending, _transaction_id, payload|
  repository, owner = payload.values_at(:repository, :owner)
  SecurityCenterUpdater.notify_security_center_for_repo(
    repository,
    owner,
    feature_type: :dependabot_version_updates,
    source_event: name
  )
end

GlobalInstrumenter.subscribe "billing.plan_change" do |name, _start, _ending, _transaction_id, payload|
  org = Organization.find_by(id: payload[:user_id])

  next unless org

  old_plan = GitHub::Plan.find(payload[:old_plan_name])
  new_plan = GitHub::Plan.find(payload[:new_plan_name])

  next unless old_plan.try(:business_plus?) || new_plan.try(:business_plus?)

  datadog_tags = T.let([], T::Array[String])
  datadog_tags << "org_deleted:#{org.deleted?}"
  datadog_tags << "business_plus_plan_removed:#{old_plan.business_plus?}" if !org.deleted? && old_plan.try(:business_plus?) && !new_plan.try(:business_plus?)
  GitHub.dogstats.increment("security_center_limited_version.billing_plan_change", tags: datadog_tags)

  SecurityCenter::OwnerReconciliationJob.perform_later(owner_id: org.id, source_event: name)
end

module SecurityCenterUpdater
  def self.notify_security_center_for_org(org_id, source_event: "")
    return unless org_id

    org = Organization.find_by(id: org_id)
    if org.nil?
      GitHub.dogstats.increment("security_center_notify_for_org.org_not_found", tags: [
        "source_event:#{source_event}"
      ])
      return
    end

    GitHub.logger.info(
      "Queue organization reconciliation",
      "gh.org.id": org.id,
      "gh.org.login": org.display_login,
      "gh.security_center.source_event": source_event,
    )

    SecurityCenter::OwnerReconciliationJob.perform_later(owner_id: org.id, source_event: source_event)
  end

  def self.notify_security_center_for_repo_id(repo_id, owner_id:, prev_owner_id: nil, source_event: "", payload: nil)
    return unless repo_id

    repo = Repository.find_by(id: repo_id)
    current_owner = owner_id ? Organization.find_by(id: owner_id) : nil
    previous_owner = prev_owner_id ? Organization.find_by(id: prev_owner_id) : nil

    notify_security_center_for_repo(repo, current_owner, previous_owner, source_event: source_event, payload: payload)
  end

  def self.notify_security_center_for_repo(repo, *owners, feature_type: "all_features", source_event: "", payload: nil)
    if repo.nil?
      GitHub.dogstats.increment("security_center_repository_update.repo_not_found", tags: [
        "source_event:#{source_event}"
      ])
      return
    end

    has_any_org_owner = T.let(false, T::Boolean)
    has_any_org_owner_with_ghas = T.let(false, T::Boolean)

    owners.compact.each do |owner|
      next unless owner.organization?

      has_any_org_owner = true
      has_any_org_owner_with_ghas = true if owner.advanced_security_purchased?

      break if has_any_org_owner_with_ghas
    end

    GitHub.dogstats.increment("security_center_repository_update.notified", tags: [
      "source_event:#{source_event}",
      "feature_type:#{feature_type}",
      "is_owned_by_org:#{has_any_org_owner}",
      "is_ghas_enabled:#{has_any_org_owner_with_ghas}"
    ])

    # allow notifying ourselves for available features and their respective subfeatures
    allowed_feature_types = ["all_features"] + owners
      .flat_map { |owner| SecurityCenter::SecurityFeatures.all_visible(owner) }.uniq
      .flat_map { |f| [f] + RepositorySecurityCenterStatus.subfeatures_for(f) }

    return unless has_any_org_owner_with_ghas || has_any_org_owner && allowed_feature_types.include?(feature_type)

    GitHub.logger.info(
      "Notify security center about a repository update",
      "gh.owner.id": repo.owner_id,
      "gh.owner.login": repo.owner_display_login,
      "gh.repo.id": repo.id,
      "gh.repo.name": repo.name,
      "gh.security_center.source_event": source_event,
    )

    GlobalInstrumenter.instrument("security_center.repository_update", {
      repository_id: repo.id,
      feature_type: feature_type,
      source_event: source_event,
    })
  end

  def self.notify_security_center_for_security_advisory(vulnerability_id: nil, vulnerable_version_range_id: nil, source_event: "")
    return unless SecurityProduct::VulnerabilityAlerts.enabled_for_instance?

    SecurityCenter::AdvisoryChangeHandlerJob.perform_later(
      vulnerability_id: vulnerability_id,
      vulnerable_version_range_id: vulnerable_version_range_id,
      source_event: source_event,
    )
  end

  def self.notify_security_features_for_repo_id(repo_id, owner_id:, prev_owner_id: nil, source_event: "", payload: nil)
    return unless repo_id

    repo = Repository.find_by(id: repo_id)
    current_owner = owner_id ? Organization.find_by(id: owner_id) : nil
    previous_owner = prev_owner_id ? Organization.find_by(id: prev_owner_id) : nil

    emit_security_feature_repository_update_event(repo, current_owner, previous_owner, source_event: source_event, payload: payload)
  end

  def self.notify_security_features_for_repo(repo, source_event: "", payload: nil)
    emit_security_feature_repository_update_event(repo, repo&.owner, source_event:, payload:)
  end

  class << self
    private

    def emit_security_feature_repository_update_event(repo, *owners, source_event: "", payload: nil)
      if repo.nil?
        GitHub.dogstats.increment("security_feature_repository_update.repo_not_found", tags: [
          "source_event:#{source_event}"
        ])
        return
      end

      has_any_org_owner = T.let(false, T::Boolean)
      has_any_org_owner_with_ghas = T.let(false, T::Boolean)

      # Check if repo visiblity was changed from public
      repo_visibility_changed_from_public = repo_visibility_change_from_public?(repo, source_event, payload)

      owners.compact.each do |owner|
        next unless owner.organization?

        has_any_org_owner = true
        has_any_org_owner_with_ghas = true if owner.advanced_security_purchased?

        break if has_any_org_owner_with_ghas
      end

      GitHub.dogstats.increment("security_feature_repository_update.notified", tags: [
        "source_event:#{source_event}",
        "visibility:#{repo.visibility}",
        "is_owned_by_org:#{has_any_org_owner}",
        "is_ghas_enabled:#{has_any_org_owner_with_ghas}",
        "is_public_repo:#{repo.public?}",
        "changed_from_public_repo:#{repo_visibility_changed_from_public}"
      ])

      # Secret scanning supports only GHAS enabled orgs
      should_notify_secret_scanning = has_any_org_owner_with_ghas

      # Code scanning supports GHAS enabled orgs or public repos
      should_notify_code_scanning = if GitHub.enterprise?
        has_any_org_owner_with_ghas
      else
        has_any_org_owner_with_ghas || (repo.public? || repo_visibility_changed_from_public) && has_any_org_owner
      end

      return unless should_notify_secret_scanning || should_notify_code_scanning

      GitHub.logger.info(
        "Notify security features about a repository update",
        "gh.owner.id": repo.owner_id,
        "gh.owner.login": repo.owner_display_login,
        "gh.repo.id": repo.id,
        "gh.repo.name": repo.name,
        "gh.security_center.source_event": source_event,
      )

      # Send a hydro message to tell security features to update their info about a repo
      GlobalInstrumenter.instrument("security_center.security_feature_repository_update", {
        repository: repo,
        source_event: source_event
      })
    end

    def repo_visibility_change_from_public?(repository, event_name, event_payload)
      if !repository.public? && event_payload.present? && event_name == "repo.access"
        previous_visibility = event_payload.values_at(:previous_visibility).first
        return previous_visibility == Repository::PUBLIC_VISIBILITY
      end

      false
    end
  end
end
