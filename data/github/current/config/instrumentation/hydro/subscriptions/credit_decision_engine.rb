# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("credit_check.result") do |payload|
    message = {
      request_id: payload[:request_id],
      reference_id: payload[:reference_id],
      status: payload[:status],
      error: payload[:error],
      result_date: payload[:result_date],
    }

    publish(message, schema: "github.credit_decision_engine.v0.CreditCheckResult")
  end
end
