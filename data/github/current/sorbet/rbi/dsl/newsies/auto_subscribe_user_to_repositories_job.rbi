# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Newsies::AutoSubscribeUserToRepositoriesJob`.
# Please instead update this file by running `bin/tapioca dsl Newsies::AutoSubscribeUserToRepositoriesJob`.

class Newsies::AutoSubscribeUserToRepositoriesJob
  class << self
    sig do
      params(
        user_id: T.untyped,
        repository_ids: T.untyped,
        notify: T.untyped,
        block: T.nilable(T.proc.params(job: Newsies::AutoSubscribeUserToRepositoriesJob).void)
      ).returns(T.any(Newsies::AutoSubscribeUserToRepositoriesJob, FalseClass))
    end
    def perform_later(user_id, repository_ids, notify = T.unsafe(nil), &block); end

    sig { params(user_id: T.untyped, repository_ids: T.untyped, notify: T.untyped).returns(T.untyped) }
    def perform_now(user_id, repository_ids, notify = T.unsafe(nil)); end
  end
end
