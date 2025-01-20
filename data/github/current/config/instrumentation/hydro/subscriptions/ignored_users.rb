# typed: false

# frozen_string_literal: true

# These are Hydro event subscriptions for IgnoredUser
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("ignored_user") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      blocked_from_content_id: payload[:blocked_from_content_id],
      blocked_from_content_type: payload[:blocked_from_content_type],
      action: serializer.enum(
        type: Hydro::Schemas::Github::V1::IgnoredUser::Action,
        value: payload[:action],
        default: :ACTION_IGNORED_USER_UNKNOWN
      ),
      expires_at: payload[:expires_at],
      ignored: serializer.user(payload[:ignored]),
      ignored_by: serializer.user(payload[:ignored_by]),
      ignored_by_org: serializer.organization(payload[:ignored_by_org]),
      minimize_reason: payload[:minimize_reason],
      repository: serializer.repository(payload[:repository])
    }

    publish(message, schema: "github.v1.IgnoredUser")
  end
end
