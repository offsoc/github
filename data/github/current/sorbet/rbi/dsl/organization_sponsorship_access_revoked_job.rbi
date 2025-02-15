# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `OrganizationSponsorshipAccessRevokedJob`.
# Please instead update this file by running `bin/tapioca dsl OrganizationSponsorshipAccessRevokedJob`.

class OrganizationSponsorshipAccessRevokedJob
  class << self
    sig do
      params(
        organization: ::Organization,
        actor: ::User,
        block: T.nilable(T.proc.params(job: OrganizationSponsorshipAccessRevokedJob).void)
      ).returns(T.any(OrganizationSponsorshipAccessRevokedJob, FalseClass))
    end
    def perform_later(organization:, actor:, &block); end

    sig { params(organization: ::Organization, actor: ::User).void }
    def perform_now(organization:, actor:); end
  end
end
