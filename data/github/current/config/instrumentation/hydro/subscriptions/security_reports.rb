# typed: true
# frozen_string_literal: true

# Hydro event subscriptions related to security compliance reports.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("security_report.download") do |payload|
    account = if payload[:account_type] == "Business"
      Business.find_by id: payload[:account_id]
    else
      Organization.find_by id: payload[:account_id]
    end
    actor = User.find_by id: payload[:actor_id]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(actor),
      report_key: payload[:report_key]
    }
    if account.is_a?(::Business)
      message[:enterprise] = serializer.business(account)
    elsif account.is_a?(::Organization)
      message[:organization] = serializer.organization(account)
    end

    publish(message, schema: "github.v1.SecurityReportDownload", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
