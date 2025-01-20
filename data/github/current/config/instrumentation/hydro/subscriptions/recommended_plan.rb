# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("recommended_plan.recommended") do |payload|
    serialized_user = serializer.user(payload[:user])
    plan_suggestion = payload[:plan_suggestion]

    message = {
      user: serialized_user,
      recommended_plan: plan_suggestion.recommended_plan,
      team_size: plan_suggestion.team_size,
      education_type: plan_suggestion.education_type,
      tools: plan_suggestion.tools,
      user_self_description: plan_suggestion.user_self_description
    }

    publish(message, schema: "github.v1.RecommendedPlan", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end
end
