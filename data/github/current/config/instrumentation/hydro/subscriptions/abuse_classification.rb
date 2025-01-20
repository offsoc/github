# frozen_string_literal: true

# Hydro event subscriptions for abuse classification.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("abuse_classification.publish") do |payload|
    # If this is nil, implicitly this mean previous_* and current_* are the same
    # In cases where previous_* is different, we grab that value before the
    # user is updated and send that value here to be instrumented.
    previous_classification = payload[:serialized_previous_classification]
    previous_classification = serializer.account_spammy_classification(payload[:account]) if previous_classification.nil?
    previous_spammy_reason = payload[:serialized_previous_spammy_reason]
    previous_spammy_reason = serializer.account_spammy_reason(payload[:account]) if previous_spammy_reason.nil?
    previously_suspended = payload[:serialized_previously_suspended]
    previously_suspended = serializer.account_suspended(payload[:account]) if previously_suspended.nil?

    origin = payload[:origin]
    origin ||= Spam::Origin.call(origin)
    origin = origin.upcase

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      account: serializer.user(payload[:account]),
      previous_classification: previous_classification,
      current_classification: serializer.account_spammy_classification(payload[:account]),
      previous_spammy_reason: previous_spammy_reason,
      current_spammy_reason: serializer.account_spammy_reason(payload[:account]),
      previously_suspended: previously_suspended,
      currently_suspended: serializer.account_suspended(payload[:account]),
      currently_deleted: serializer.account_currently_deleted(payload[:account]),
      origin: origin,
      queue_action: payload[:queue_action],
      queue_entry: serializer.spam_queue_entry(payload[:queue_entry]),
      previous_queue: serializer.spam_queue(payload[:previous_queue]),
      current_queue: serializer.spam_queue(payload[:current_queue]),
      queued_time_in_seconds: payload[:queued_time_in_seconds] && payload[:queued_time_in_seconds].to_i,
      rule_name: payload[:rule_name],
      rule_version: payload[:rule_version],
    }

    publish(message, schema: "github.v1.AbuseClassification", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("enterprise_abuse_classification.publish") do |payload|
    # If this is nil, implicitly this mean previous_* and current_* are the same
    # In cases where previous_* is different, we grab that value before the
    # enterprise is updated and send that value here to be instrumented.
    previous_classification = payload[:serialized_previous_classification]
    previous_classification = serializer.account_spammy_classification(payload[:business]) if previous_classification.nil?
    previous_spammy_reason = payload[:serialized_previous_spammy_reason]
    previous_spammy_reason = serializer.account_spammy_reason(payload[:business]) if previous_spammy_reason.nil?
    previously_suspended = payload[:serialized_previously_suspended]
    previously_suspended = serializer.account_suspended(payload[:business]) if previously_suspended.nil?

    origin = payload[:origin]
    origin ||= Spam::Origin.call(origin)
    origin = origin.upcase

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      business: serializer.business(payload[:business]),
      previous_classification: previous_classification,
      current_classification: serializer.account_spammy_classification(payload[:business]),
      previous_spammy_reason: previous_spammy_reason,
      current_spammy_reason: serializer.account_spammy_reason(payload[:business]),
      previously_suspended: previously_suspended,
      currently_suspended: serializer.account_suspended(payload[:business]),
      currently_deleted: serializer.account_currently_deleted(payload[:business]),
      origin: origin,
      queue_action: payload[:queue_action],
      queue_entry: serializer.spam_queue_entry(payload[:queue_entry]),
      previous_queue: serializer.spam_queue(payload[:previous_queue]),
      current_queue: serializer.spam_queue(payload[:current_queue]),
      queued_time_in_seconds: payload[:queued_time_in_seconds] && payload[:queued_time_in_seconds].to_i,
      rule_name: payload[:rule_name],
      rule_version: payload[:rule_version],
    }

    publish(message, schema: "github.v1.EnterpriseAbuseClassification")
  end

  subscribe("add_account_to_spamurai_queue") do |payload|
    message = payload.slice(:account_global_relay_id, :additional_context, :queue_global_relay_id, :origin)
    publish(message, schema: "hamzo.v1.AddToQueue", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
