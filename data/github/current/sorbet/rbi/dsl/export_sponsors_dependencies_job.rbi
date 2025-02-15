# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `ExportSponsorsDependenciesJob`.
# Please instead update this file by running `bin/tapioca dsl ExportSponsorsDependenciesJob`.

class ExportSponsorsDependenciesJob
  class << self
    sig do
      params(
        org: ::Organization,
        actor: ::User,
        block: T.nilable(T.proc.params(job: ExportSponsorsDependenciesJob).void)
      ).returns(T.any(ExportSponsorsDependenciesJob, FalseClass))
    end
    def perform_later(org:, actor:, &block); end

    sig { params(org: ::Organization, actor: ::User).void }
    def perform_now(org:, actor:); end
  end
end
