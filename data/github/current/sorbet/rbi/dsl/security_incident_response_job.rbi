# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SecurityIncidentResponseJob`.
# Please instead update this file by running `bin/tapioca dsl SecurityIncidentResponseJob`.

class SecurityIncidentResponseJob
  class << self
    sig do
      params(
        actor: T.untyped,
        id: T.untyped,
        incident_responses: T.untyped,
        block: T.nilable(T.proc.params(job: SecurityIncidentResponseJob).void)
      ).returns(T.any(SecurityIncidentResponseJob, FalseClass))
    end
    def perform_later(actor:, id:, incident_responses:, &block); end

    sig { params(actor: T.untyped, id: T.untyped, incident_responses: T.untyped).returns(T.untyped) }
    def perform_now(actor:, id:, incident_responses:); end
  end
end
