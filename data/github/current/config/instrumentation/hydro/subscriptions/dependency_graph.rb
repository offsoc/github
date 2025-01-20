# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions for Dependency Graph.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do

  subscribe("dependency_graph.request_snapshot") do |payload|
    message = {
      push_id: payload[:push_id],
      before_sha: payload[:before_sha],
      sha: payload[:sha],
      ref: payload[:ref],
      pushed_at: payload[:pushed_at],
      repository: serializer.repository(payload[:repository]),
      owner_name: payload[:owner_name],
      manifest_files: payload[:manifest_files],
    }

    publish(message, schema: "github.dependencygraph.v0.RequestPushSnapshot", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("dependency_graph.rich_diff.view") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      repo: serializer.repository(payload[:repo]),
      pull_request: serializer.pull_request(payload[:pull_request]),
      path: payload[:path],
      filename: payload[:filename],
      vulnerability_display_count: payload[:vulnerability_display_count],
    }

    publish(message, schema: "github.dependencygraph.v0.DependencyReviewRichDiffView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("dependency_graph.auto_dependencies_submit") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      repository: payload[:repositories].map { |r| serializer.repository(r) },
      enrollment_status: serializer.enum(
        type: Hydro::Schemas::Github::Dependencygraph::V0::RepositoryAutoDepsEnroll::EnrollmentStatus,
        value: payload[:enrollment_status],
        default: :UNKNOWN
      ),
      runner_type: serializer.enum(
        type: Hydro::Schemas::Github::Dependencygraph::V0::RepositoryAutoDepsEnroll::RunnerType,
        value: payload[:runner_type],
        default: :CLOUD
      ),
      modified_at: Time.zone.now
    }

    publish(message, publisher: GitHub.sync_hydro_publisher, schema: "github.dependencygraph.v0.RepositoryAutoDepsEnroll")
  end

end
