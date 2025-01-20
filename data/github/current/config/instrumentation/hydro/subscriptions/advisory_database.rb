# typed: true
# frozen_string_literal: true

# Events related to /advisories. Note there are two different sources that we
# subscribe to in this file: `GlobalInstrumenter`, and `GitHub`.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("epss_ingestion.issue_ingestion_batch") do |payload|
    message = {
      source_of_ingest: payload[:source_of_ingest],
      records_to_ingest: payload[:records_to_ingest],
      ingest_for_date: payload[:ingest_for_date],
    }

    publish(message, schema: "advisory_db.v0.EPSSIngest")
  end

  subscribe("repository_advisory.create") do |payload|
    repository_advisory = payload[:repository_advisory]
    repo = repository_advisory.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      author: serializer.user(repository_advisory.author),
      repository: serializer.repository(repo),
      repository_owner: serializer.user(repo.owner),
      repository_advisory: serializer.repository_advisory(repository_advisory),
    }

    publish(message, schema: "github.v1.RepositoryAdvisoryCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_advisory.publish") do |payload|
    repository_advisory = payload[:repository_advisory]
    repo = repository_advisory.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(repo),
      repository_owner: serializer.user(repo.owner),
      repository_advisory: serializer.repository_advisory(repository_advisory),
    }

    publish(message, schema: "github.v1.RepositoryAdvisoryPublish", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish(
      {
        actor: serializer.user(payload[:actor]),
        repository_advisory_content: serializer.repository_advisory_content(repository_advisory),
      },
      schema: "advisory_db.v0.RepositoryAdvisoryCurationRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end

  subscribe("repository_advisory.request_cve") do |payload|
    repository_advisory = payload[:repository_advisory]

    message = {
      actor: serializer.user(payload[:actor]),
      repository_advisory: serializer.repository_advisory(repository_advisory),
      title: repository_advisory.title,
      description: repository_advisory.description,
      cve_id: repository_advisory.cve_id,
      cvss_v3: repository_advisory.cvss_v3,
      affected_products: repository_advisory.affected_products.map do |affected_product|
        {
          package_ecosystem: affected_product.ecosystem,
          package_name: affected_product.package,
          vulnerable_version_range: affected_product.affected_versions,
          first_patched_version: affected_product.patches,
          affected_functions: affected_product.affected_functions,
        }
      end
    }

    publish(message, schema: "advisory_db.v0.CVERequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_advisory.update") do |payload|
    repository_advisory = payload[:repository_advisory]
    repo = repository_advisory.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(repository_advisory.author),
      repository: serializer.repository(repo),
      repository_owner: serializer.user(repo.owner),
      repository_advisory: serializer.repository_advisory(repository_advisory),
    }

    publish(message, schema: "github.v1.RepositoryAdvisoryUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    if payload[:request_curation]
      publish(
        {
          actor: serializer.user(payload[:actor]),
          repository_advisory_content: serializer.repository_advisory_content(repository_advisory),
        },
        schema: "advisory_db.v0.RepositoryAdvisoryCurationRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
      )
    end
  end

  subscribe("repository_advisory.workspace_open") do |payload|
    repository_advisory = payload[:repository_advisory]
    repo = repository_advisory.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(repo),
      repository_owner: serializer.user(repo.owner),
      repository_advisory: serializer.repository_advisory(repository_advisory),
      workspace: serializer.repository(repository_advisory.workspace_repository),
    }

    publish(message, schema: "github.v1.RepositoryAdvisoryWorkspaceOpen", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("security_advisory.show") do |payload|
    security_advisory = SecurityAdvisory.find(payload.fetch(:security_advisory_id))

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      security_advisory: security_advisory.hydro_entity_payload,
    }
    publish(message, schema: "github.v1.SecurityAdvisoryShow")
  end

  subscribe("vulnerability_alerting_event.save") do |payload|
    publish(payload, schema: "advisory_db.v0.AdvisoryAlertingEvent")
  end
end

Hydro::EventForwarder.configure(source: GitHub) do
  subscribe("security_advisory.publish") do |payload|
    security_advisory = AdvisoryDB::ScopedVulnerabilityHelper.get_hydro_security_advisory(payload.fetch(:security_advisory_id))
    next unless security_advisory.disclosed?

    message = { security_advisory: security_advisory.hydro_entity_payload }
    publish(message, schema: "github.v1.SecurityAdvisoryPublish", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("security_advisory.update") do |payload|
    security_advisory = AdvisoryDB::ScopedVulnerabilityHelper.get_hydro_security_advisory(payload.fetch(:security_advisory_id))
    next unless security_advisory.disclosed?

    message = { security_advisory: security_advisory.hydro_entity_payload }
    publish(message, schema: "github.v1.SecurityAdvisoryUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("security_advisory.withdraw") do |payload|
    security_advisory = AdvisoryDB::ScopedVulnerabilityHelper.get_hydro_security_advisory(payload.fetch(:security_advisory_id))
    next unless security_advisory.disclosed?

    message = { security_advisory: security_advisory.hydro_entity_payload }
    publish(message, schema: "github.v1.SecurityAdvisoryWithdraw", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
