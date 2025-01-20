# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Reactions.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("reaction.created") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:reaction]&.user),
      subject_type: payload[:reaction]&.subject_type,
      subject_id: payload[:reaction]&.subject_id,
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository: serializer.repository(payload[:reaction]&.repository),
      repository_owner: serializer.user(payload[:reaction]&.repository&.owner),
      content: payload[:reaction].content
    }

    publish(message, schema: "github.v1.ReactionCreate")
  end
end
