# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SubscribeUserToThreadJob`.
# Please instead update this file by running `bin/tapioca dsl SubscribeUserToThreadJob`.

class SubscribeUserToThreadJob
  class << self
    sig do
      params(
        user_id: T.untyped,
        repository_id: T.untyped,
        commit_oid: T.untyped,
        reason: T.untyped,
        options: T.untyped,
        block: T.nilable(T.proc.params(job: SubscribeUserToThreadJob).void)
      ).returns(T.any(SubscribeUserToThreadJob, FalseClass))
    end
    def perform_later(user_id, repository_id, commit_oid, reason = T.unsafe(nil), options = T.unsafe(nil), &block); end

    sig do
      params(
        user_id: T.untyped,
        repository_id: T.untyped,
        commit_oid: T.untyped,
        reason: T.untyped,
        options: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(user_id, repository_id, commit_oid, reason = T.unsafe(nil), options = T.unsafe(nil)); end
  end
end
