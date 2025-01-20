# frozen_string_literal: true

# hydro event subscriptions related to topics

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("topic") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      actor: serializer.user(payload[:actor]),
      action: serializer.enum(
        type: Hydro::Schemas::Github::V1::TopicsData::Action,
        value: payload[:action],
        default: :UNKNOWN
      ),
      topic: serializer.topic(payload[:topic])
    }

    publish(message, schema: "github.v1.TopicsData")
  end
end
