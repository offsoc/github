# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MapImportRecordsJob`.
# Please instead update this file by running `bin/tapioca dsl MapImportRecordsJob`.

class MapImportRecordsJob
  class << self
    sig do
      params(
        migration: T.untyped,
        mappings: T.untyped,
        actor: T.untyped,
        block: T.nilable(T.proc.params(job: MapImportRecordsJob).void)
      ).returns(T.any(MapImportRecordsJob, FalseClass))
    end
    def perform_later(migration, mappings, actor, &block); end

    sig { params(migration: T.untyped, mappings: T.untyped, actor: T.untyped).returns(T.untyped) }
    def perform_now(migration, mappings, actor); end
  end
end
