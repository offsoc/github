# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("security_center.repository_update") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_type: payload[:feature_type],
      source_event: payload[:source_event],
    }

    # Using the repo id as partition key should ensure that events for a given repo are processed in order
    partition_key = payload[:repository_id]

    Hydro::PublishRetrier.publish(
      message,
      partition_key: partition_key,
      schema: "github.v1.SecurityCenterRepositoryUpdate",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("security_center.security_feature_repository_update") do |payload|
    repo = payload[:repository] || Repository.find_by(id: payload[:repository_id])
    next if repo.nil?

    organization_id = !repo.deleted? && repo.owner.is_a?(Organization) ? repo.owner_id : 0
    default_branch_ref = repo.default_branch_ref&.qualified_name || ""
    source_event = payload[:source_event] || ""
    security_feature_details = [:SECRET_SCANNING, :CODE_SCANNING].map do |feature|
      {
        security_feature: feature,
        feature_visible: repo.security_feature_visible?(feature)
      }
    end

    if source_event == "hydro.schemas.github.repositories.v1.Deleted"
      GitHub.dogstats.increment("security_center.hydro_repo_deleted_discrepancy.count", tags: ["repo_deleted:#{repo.deleted?}"])
      organization_id = 0
    end

    tss_flags = SecretScanning::Instrumentation::RepositoryServiceFlags.new(repo).repo_update_flags

    code_scanning_flags = []

    feature_flags = tss_flags.concat(code_scanning_flags)

    message = {
      repository: {
        id: repo.id,
        visibility: repo.visibility,
        organization_id: organization_id,
        default_branch_ref: default_branch_ref
      },
      security_feature_details: security_feature_details,
      feature_flags: feature_flags,
      source_event: source_event
    }

    Hydro::PublishRetrier.publish(
      message,
      partition_key: repo.id,
      schema: "github.security_center.v1.SecurityFeatureRepoUpdate",
      topic_format_options: {
        format_version: Hydro::Topic::FormatVersion::V2
      })
  end
end
