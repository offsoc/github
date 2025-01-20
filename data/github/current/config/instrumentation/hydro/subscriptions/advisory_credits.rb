# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Advisory Credits.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("advisory_credit.create") do |payload|
    publish(
      serializer.advisory_credit(
        payload,
        except: [:advisory_credit_created_at, :advisory_credit_current_state],
      ),
      schema: "github.security_advisories.v0.AdvisoryCreditCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end

  subscribe("advisory_credit.accept") do |payload|
    publish(
      serializer.advisory_credit(
        payload,
        except: [:advisory_credit_current_state],
      ),
      schema: "github.security_advisories.v0.AdvisoryCreditAccept", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end

  subscribe("advisory_credit.decline") do |payload|
    publish(
      serializer.advisory_credit(
        payload,
        except: [:advisory_credit_current_state],
      ),
      schema: "github.security_advisories.v0.AdvisoryCreditDecline", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end

  subscribe("advisory_credit.destroy") do |payload|
    publish(
      serializer.advisory_credit(payload),
      schema: "github.security_advisories.v0.AdvisoryCreditDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end

  subscribe("advisory_credit.notify") do |payload|
    publish(
      serializer.advisory_credit(
        payload,
        except: [:advisory_credit_current_state]
      ),
      schema: "github.security_advisories.v0.AdvisoryCreditNotify", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 } # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end
end
