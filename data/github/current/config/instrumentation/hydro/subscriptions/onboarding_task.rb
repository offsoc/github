# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("onboarding_task.complete") do |payload|
    serialized_user = serializer.user(payload[:user])
    taskable = payload[:taskable]

    message = {
      user: serialized_user,
      type: payload[:type],
      task: payload[:task],
      completed_tasks: payload[:completed_tasks],
      remaining_tasks: payload[:remaining_tasks],
      taskable_type: taskable.class.name,
      taskable_id: taskable.id,
    }

    publish(message, schema: "github.v1.OnboardingTaskCompleted", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end
end
