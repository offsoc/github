# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SoftDeleteOrganizationRepositoriesJob`.
# Please instead update this file by running `bin/tapioca dsl SoftDeleteOrganizationRepositoriesJob`.

class SoftDeleteOrganizationRepositoriesJob
  class << self
    sig do
      params(
        id: ::Integer,
        block: T.nilable(T.proc.params(job: SoftDeleteOrganizationRepositoriesJob).void)
      ).returns(T.any(SoftDeleteOrganizationRepositoriesJob, FalseClass))
    end
    def perform_later(id, &block); end

    sig { params(id: ::Integer).void }
    def perform_now(id); end
  end
end
