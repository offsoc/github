# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SpokesCreateGistReplicaJob`.
# Please instead update this file by running `bin/tapioca dsl SpokesCreateGistReplicaJob`.

class SpokesCreateGistReplicaJob
  class << self
    sig do
      params(
        gist_id: T.untyped,
        host: T.untyped,
        block: T.nilable(T.proc.params(job: SpokesCreateGistReplicaJob).void)
      ).returns(T.any(SpokesCreateGistReplicaJob, FalseClass))
    end
    def perform_later(gist_id, host, &block); end

    sig { params(gist_id: T.untyped, host: T.untyped).returns(T.untyped) }
    def perform_now(gist_id, host); end
  end
end
