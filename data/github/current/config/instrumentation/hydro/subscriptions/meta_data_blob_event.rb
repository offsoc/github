# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  def build_metadata_blob_message(payload, action)
    {
      action: action,
      actor_id: payload[:actor_id],
      data: payload[:data],
      parent_id: payload[:parent_id],
      parent_type: payload[:parent_type],
      submitter_id: payload[:submitter_id],
      submitter_type: payload[:submitter_type]
    }.freeze
  end

  subscribe("meta_data_blob.create") do |payload|
    return unless GitHub.flipper[:meta_data_blobs].enabled?
    message = build_metadata_blob_message(payload, "CREATED")
    publish(message, schema: "github.v1.MetaDataBlobEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
