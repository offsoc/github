# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `RemoveForksForInaccessibleRepositoriesJob`.
# Please instead update this file by running `bin/tapioca dsl RemoveForksForInaccessibleRepositoriesJob`.

class RemoveForksForInaccessibleRepositoriesJob
  class << self
    sig do
      params(
        repository_ids: T.untyped,
        user_ids: T.untyped,
        block: T.nilable(T.proc.params(job: RemoveForksForInaccessibleRepositoriesJob).void)
      ).returns(T.any(RemoveForksForInaccessibleRepositoriesJob, FalseClass))
    end
    def perform_later(repository_ids, user_ids, &block); end

    sig { params(repository_ids: T.untyped, user_ids: T.untyped).returns(T.untyped) }
    def perform_now(repository_ids, user_ids); end
  end
end
