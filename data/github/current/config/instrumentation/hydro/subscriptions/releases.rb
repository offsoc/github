# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Releases.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("release.published") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:owner]),
      release: serializer.release(payload[:release]),
      short_description_html: "#{payload[:release]&.short_description_html}",
      body: payload[:release]&.body,
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      specimen_body: serializer.specimen_data(payload[:release]&.body),
    }

    publish(message, schema: "github.v1.ReleasePublish", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("release.viewed") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      release: serializer.release(payload[:release]),
      repository: serializer.repository(payload[:repository]),
      body: payload[:release]&.body,
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      specimen_body: serializer.specimen_data(payload[:release]&.body),
    }

    publish(message, schema: "github.v1.ReleaseView")
  end

  subscribe("release.notes_generated") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      release: serializer.release(payload[:release]),
      repository: serializer.repository(payload[:repository]),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository_owner: serializer.user(payload[:owner]),
    }

    publish(message, schema: "github.releases.v1.ReleaseNotesGenerated")
  end

  subscribe("release_asset.uploaded") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:owner]),
      release: serializer.release(payload[:release]),
      asset_id: payload[:asset]&.id,
      name: payload[:asset]&.name,
      content_type: payload[:asset]&.content_type,
      size: payload[:asset]&.size,
      label: payload[:asset]&.label,
      storage_blob_id: payload[:asset]&.storage_blob_id,
      storage_provider: payload[:asset]&.storage_provider,
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
    }

    publish(message, schema: "github.v1.ReleaseAssetUploaded")
  end
end
