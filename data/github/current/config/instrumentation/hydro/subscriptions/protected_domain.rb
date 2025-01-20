# frozen_string_literal: true

# Hydro event subscriptions related to Pages domain Protection
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("protected_domain.create") do |payload|
    message = {
      event_type: :CREATE,
      domain: serializer.protected_domain(payload[:domain]),
      actor: serializer.user(payload[:owner])
    }

    publish(message, schema: "github.protected_domain.v1.Lifecycle")
  end

  subscribe("protected_domain.delete") do |payload|
    message = {
      event_type: :DELETE,
      domain: serializer.protected_domain(payload[:domain]),
      actor: serializer.user(payload[:owner])
    }

    publish(message, schema: "github.protected_domain.v1.Lifecycle")
  end

  subscribe("protected_domain.verified") do |payload|
    message = {
      event_type: :VERIFIED,
      domain: serializer.protected_domain(payload[:domain]),
      actor: serializer.user(payload[:owner]),
    }

    publish(message, schema: "github.protected_domain.v1.StatusChange")
  end

  subscribe("protected_domain.unverified") do |payload|
    message = {
      event_type: :UNVERIFIED,
      domain: serializer.protected_domain(payload[:domain]),
      actor: serializer.user(payload[:owner]),
    }

    publish(message, schema: "github.protected_domain.v1.StatusChange")
  end

  subscribe("protected_domain.pending") do |payload|
    message = {
      event_type: :PENDING,
      domain: serializer.protected_domain(payload[:domain]),
      actor: serializer.user(payload[:owner]),
    }

    publish(message, schema: "github.protected_domain.v1.StatusChange")
  end

  subscribe("protected_domain.verify_attempt") do |payload|
    verify_status = case payload[:verify_status]
    when :verified
      :VERIFIED
    when :dns_record_not_found
      :DNS_RECORD_NOT_FOUND
    when :no_domain
      :DOMAIN_DOES_NOT_EXITS
    when :resolve_error
      :RESOLVE_ERROR
    when :dns_error
      :DNS_ERROR
    else
      nil
    end
    message = {
      domain: serializer.protected_domain(payload[:domain]),
      actor: serializer.user(payload[:owner]),
      status: verify_status
    }

    publish(message, schema: "github.protected_domain.v1.VerifyAttempt")
  end
end
