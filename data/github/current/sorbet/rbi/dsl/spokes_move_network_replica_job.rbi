# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SpokesMoveNetworkReplicaJob`.
# Please instead update this file by running `bin/tapioca dsl SpokesMoveNetworkReplicaJob`.

class SpokesMoveNetworkReplicaJob
  class << self
    sig do
      params(
        network_id: T.untyped,
        from_host: T.untyped,
        to_host: T.untyped,
        queued_time: T.untyped,
        block: T.nilable(T.proc.params(job: SpokesMoveNetworkReplicaJob).void)
      ).returns(T.any(SpokesMoveNetworkReplicaJob, FalseClass))
    end
    def perform_later(network_id, from_host, to_host, queued_time = T.unsafe(nil), &block); end

    sig do
      params(
        network_id: T.untyped,
        from_host: T.untyped,
        to_host: T.untyped,
        queued_time: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(network_id, from_host, to_host, queued_time = T.unsafe(nil)); end
  end
end
