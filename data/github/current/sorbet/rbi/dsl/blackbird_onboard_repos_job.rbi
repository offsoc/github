# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BlackbirdOnboardReposJob`.
# Please instead update this file by running `bin/tapioca dsl BlackbirdOnboardReposJob`.

class BlackbirdOnboardReposJob
  class << self
    sig do
      params(
        actor_id: ::Integer,
        repo_ids: T::Array[::Integer],
        block: T.nilable(T.proc.params(job: BlackbirdOnboardReposJob).void)
      ).returns(T.any(BlackbirdOnboardReposJob, FalseClass))
    end
    def perform_later(actor_id, repo_ids, &block); end

    sig { params(actor_id: ::Integer, repo_ids: T::Array[::Integer]).void }
    def perform_now(actor_id, repo_ids); end
  end
end
