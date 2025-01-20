# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("billing.payment_transaction") do |payload|
    payment_method = PaymentMethod.find(payload[:payment_method_id])

    message = {
      payment_method: serializer.payment_method(payment_method),
      success: payload[:success],
      payment_amount_in_cents: payload[:payment_amount],
      attempt_number: payload[:attempt_number],
      processor_response_code: payload[:processor_response_code],
      processor_response: payload[:processor_response],
    }
    if payload[:user_id].present?
      user = User.find(payload[:user_id])
      message[:account] = serializer.user(user)
    elsif payload[:business_id].present?
      business = Business.find(payload[:business_id])
      message[:enterprise] = serializer.business(business)
    end

    publish(message, schema: "github.billing.v0.PaymentTransaction")
  end

  subscribe("browser.payment_method.verification_failure") do |payload|
    target = User.find_by(id: payload[:account_id])
    error_code = payload.dig(:client, :context, :processor_response_code)
    error_msg = payload.dig(:client, :context, :processor_response_reason)

    message = {
      processor_response_code: error_code,
      processor_response_reason: error_msg,
      request_context: serializer.request_context(GitHub.context.to_hash,
      overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      account: serializer.user(target),
    }

    publish(message, schema: "github.billing.v0.PaymentMethodVerificationFailure", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    GitHub.dogstats.increment(
      "billing.payment_method.verification_failure",
      tags: ["error_code:#{error_code}"]
    )
  end

  subscribe("billing.early_fraud_warning") do |payload|
    message = {
      stripe_fraud_id: payload[:stripe_fraud_id],
      actionable: payload[:actionable],
      stripe_charge_id: payload[:stripe_charge_id],
      fraud_type: payload[:fraud_type],
      stripe_timestamp: payload[:stripe_timestamp],
      user_id: payload[:user_id],
    }.freeze

    publish(message, schema: "github.billing.v0.EarlyFraudWarning")
  end

  subscribe("billing.budget_updated") do |payload|
    payload[:user_owner] = serializer.user(payload[:user_owner]) if payload[:user_owner]
    payload[:business_owner] = serializer.business(payload[:business_owner]) if payload[:business_owner]

    payload[:user_target] = serializer.user(payload[:user_target]) if payload[:user_target]
    payload[:business_target] = serializer.business(payload[:business_target]) if payload[:business_target]

    publish(payload, schema: "github.billing.v0.BudgetChanged")
  end
end
