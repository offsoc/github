# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `ExportSponsorableMaintainersJob`.
# Please instead update this file by running `bin/tapioca dsl ExportSponsorableMaintainersJob`.

class ExportSponsorableMaintainersJob
  class << self
    sig do
      params(
        viewer: T.untyped,
        sort_by: T.untyped,
        org: T.untyped,
        ecosystems: T.untyped,
        direct_only: T.untyped,
        block: T.nilable(T.proc.params(job: ExportSponsorableMaintainersJob).void)
      ).returns(T.any(ExportSponsorableMaintainersJob, FalseClass))
    end
    def perform_later(viewer:, sort_by: T.unsafe(nil), org: T.unsafe(nil), ecosystems: T.unsafe(nil), direct_only: T.unsafe(nil), &block); end

    sig do
      params(
        viewer: T.untyped,
        sort_by: T.untyped,
        org: T.untyped,
        ecosystems: T.untyped,
        direct_only: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(viewer:, sort_by: T.unsafe(nil), org: T.unsafe(nil), ecosystems: T.unsafe(nil), direct_only: T.unsafe(nil)); end
  end
end
