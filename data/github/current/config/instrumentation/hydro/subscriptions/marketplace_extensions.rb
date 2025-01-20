# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe(::Marketplace::Events::CREATE_EXTENSION_VIEW) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      viewer: serializer.user(User.find_by(id: payload[:viewer_id])),
    }

    publish(message, schema: "github.marketplace.v0.CreateExtensionView")
  end
end
