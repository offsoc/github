# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("prioritizable.context_rebalanced") do |payload|
    actor_id = payload[:actor_id]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(User.find_by(id: actor_id) || User.ghost)

    context_id = payload[:context_id]
    context_type = payload[:context_type]
    performed_at = payload[:performed_at]

    prioritizable_context_rebalanced_message = {
      actor: serialized_actor,
      context_id:,
      context_type:,
      performed_at:,
      request_context: serialized_request_context,
    }

    publish(
      prioritizable_context_rebalanced_message,
      schema: "github.prioritizable.v0.PrioritizableContextRebalanced",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
    )
  end
end
