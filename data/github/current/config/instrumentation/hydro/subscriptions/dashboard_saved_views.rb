# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("dashboard_saved_view.create") do |payload|
    user = payload[:user]
    saved_collection = payload[:dashboard_saved_collection]
    saved_view = payload[:dashboard_saved_view]

    message = {
      user: serializer.user(user),
      dashboard_saved_collection: serializer.dashboard_saved_collection(saved_collection),
      dashboard_saved_view: serializer.dashboard_saved_view(saved_view)
    }

    publish(message, schema: "github.v1.DashboardSavedViewCreate")
  end

  subscribe("dashboard_saved_view.update") do |payload|
    user = payload[:user]
    saved_collection = payload[:dashboard_saved_collection]
    saved_view = payload[:dashboard_saved_view]

    message = {
      user: serializer.user(user),
      dashboard_saved_collection: serializer.dashboard_saved_collection(saved_collection),
      dashboard_saved_view: serializer.dashboard_saved_view(saved_view)
    }

    publish(message, schema: "github.v1.DashboardSavedViewUpdate")
  end

  subscribe("dashboard_saved_view.destroy") do |payload|
    user = payload[:user]
    saved_collection = payload[:dashboard_saved_collection]
    saved_view = payload[:dashboard_saved_view]

    message = {
      user: serializer.user(user),
      dashboard_saved_collection: serializer.dashboard_saved_collection(saved_collection),
      dashboard_saved_view: serializer.dashboard_saved_view(saved_view)
    }

    publish(message, schema: "github.v1.DashboardSavedViewDestroy")
  end
end
