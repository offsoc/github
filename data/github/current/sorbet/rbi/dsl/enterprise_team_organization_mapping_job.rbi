# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `EnterpriseTeamOrganizationMappingJob`.
# Please instead update this file by running `bin/tapioca dsl EnterpriseTeamOrganizationMappingJob`.

class EnterpriseTeamOrganizationMappingJob
  class << self
    sig do
      params(
        enterprise_team_id: ::Integer,
        organization_id: T.nilable(::Integer),
        block: T.nilable(T.proc.params(job: EnterpriseTeamOrganizationMappingJob).void)
      ).returns(T.any(EnterpriseTeamOrganizationMappingJob, FalseClass))
    end
    def perform_later(enterprise_team_id, organization_id: T.unsafe(nil), &block); end

    sig { params(enterprise_team_id: ::Integer, organization_id: T.nilable(::Integer)).void }
    def perform_now(enterprise_team_id, organization_id: T.unsafe(nil)); end
  end
end
