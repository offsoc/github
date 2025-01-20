# frozen_string_literal: true

# This is a Hydro event subscription related to wiki push/edit via web UI or Git.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("wiki.edit") do |payload|
    ref_updates = payload[:ref_updates].map do |(ref, before, after)|
      {
        ref_name: ref&.dup&.force_encoding(Encoding::UTF_8),
        previous_ref_oid: before,
        current_ref_oid: after,
      }
    end
    message = {
      pusher: serializer.user(payload[:pusher]),
      owner: serializer.user(payload[:owner]),
      request_context: payload[:request_context],
      repository: serializer.repository(payload[:repository]),
      wiki_world_writable: payload[:wiki_world_writable],
      ref_updates: Array.wrap(ref_updates),
      feature_flags: payload[:feature_flags],
      pushed_at: payload[:pushed_at],
      business_id: payload[:business_id],
    }

    publish(message, schema: "github.v1.WikiPostReceive")
  end
end
