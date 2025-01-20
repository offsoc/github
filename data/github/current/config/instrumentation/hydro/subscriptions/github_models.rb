# typed: true
# frozen_string_literal: true

# Hydro events related to GitHub Models, also referred to as Project Neutron
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("github_models.api.authentication_result") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      success: payload[:success],
      reason: payload[:reason]
    }

    publish(message, schema: "github.github_models.v0.ApiAuthenticationResult")
  end

  subscribe("github_models.feedback") do |payload|
    message = {
      user: payload[:user] ? serializer.user(payload[:user]) : nil,
      feedback_type: serializer.model_feedback_type(payload[:feedback_type]),
      feedback_choice: serializer.model_feedback_choices(payload[:feedback_choice]),
      content: payload[:content],
      model: payload[:model],
      can_be_contacted: payload[:can_be_contacted],
    }
    publish(message, schema: "github.github_models.v0.Feedback")
  end
end
