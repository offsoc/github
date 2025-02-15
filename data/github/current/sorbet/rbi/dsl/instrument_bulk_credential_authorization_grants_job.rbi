# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `InstrumentBulkCredentialAuthorizationGrantsJob`.
# Please instead update this file by running `bin/tapioca dsl InstrumentBulkCredentialAuthorizationGrantsJob`.

class InstrumentBulkCredentialAuthorizationGrantsJob
  class << self
    sig do
      params(
        organization_ids: T.untyped,
        credential_id: T.untyped,
        credential_type: T.untyped,
        block: T.nilable(T.proc.params(job: InstrumentBulkCredentialAuthorizationGrantsJob).void)
      ).returns(T.any(InstrumentBulkCredentialAuthorizationGrantsJob, FalseClass))
    end
    def perform_later(organization_ids:, credential_id:, credential_type:, &block); end

    sig do
      params(
        organization_ids: T.untyped,
        credential_id: T.untyped,
        credential_type: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(organization_ids:, credential_id:, credential_type:); end
  end
end
