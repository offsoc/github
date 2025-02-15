# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `StorageClusterMoveObjectJob`.
# Please instead update this file by running `bin/tapioca dsl StorageClusterMoveObjectJob`.

class StorageClusterMoveObjectJob
  class << self
    sig do
      params(
        oid: T.untyped,
        from_host: T.untyped,
        to_host: T.untyped,
        block: T.nilable(T.proc.params(job: StorageClusterMoveObjectJob).void)
      ).returns(T.any(StorageClusterMoveObjectJob, FalseClass))
    end
    def perform_later(oid, from_host, to_host, &block); end

    sig { params(oid: T.untyped, from_host: T.untyped, to_host: T.untyped).returns(T.untyped) }
    def perform_now(oid, from_host, to_host); end
  end
end
