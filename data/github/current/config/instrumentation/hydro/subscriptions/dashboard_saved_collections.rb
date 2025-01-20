# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("dashboard_saved_collection.create") do |payload|
    user = payload[:user]
    saved_collection = payload[:dashboard_saved_collection]

    message = {
      user: serializer.user(user),
      dashboard_saved_collection: serializer.dashboard_saved_collection(saved_collection)
    }

    publish(message, schema: "github.v1.DashboardSavedCollectionCreate")
  end

  subscribe("dashboard_saved_collection.update") do |payload|
    user = payload[:user]
    saved_collection = payload[:dashboard_saved_collection]

    message = {
      user: serializer.user(user),
      dashboard_saved_collection: serializer.dashboard_saved_collection(saved_collection)
    }

    publish(message, schema: "github.v1.DashboardSavedCollectionUpdate")
  end

  subscribe("dashboard_saved_collection.destroy") do |payload|
    user = payload[:user]
    saved_collection = payload[:dashboard_saved_collection]

    message = {
      user: serializer.user(user),
      dashboard_saved_collection: serializer.dashboard_saved_collection(saved_collection)
    }

    publish(message, schema: "github.v1.DashboardSavedCollectionDestroy")
  end
end
