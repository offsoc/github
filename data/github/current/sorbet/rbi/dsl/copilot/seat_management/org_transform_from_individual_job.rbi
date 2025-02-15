# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Copilot::SeatManagement::OrgTransformFromIndividualJob`.
# Please instead update this file by running `bin/tapioca dsl Copilot::SeatManagement::OrgTransformFromIndividualJob`.

class Copilot::SeatManagement::OrgTransformFromIndividualJob
  class << self
    sig do
      params(
        org_id: ::Integer,
        block: T.nilable(T.proc.params(job: Copilot::SeatManagement::OrgTransformFromIndividualJob).void)
      ).returns(T.any(Copilot::SeatManagement::OrgTransformFromIndividualJob, FalseClass))
    end
    def perform_later(org_id:, &block); end

    sig { params(org_id: ::Integer).void }
    def perform_now(org_id:); end
  end
end
