# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DisableRepositoryAccessJob`.
# Please instead update this file by running `bin/tapioca dsl DisableRepositoryAccessJob`.

class DisableRepositoryAccessJob
  class << self
    sig do
      params(
        repo: T.untyped,
        reason: T.untyped,
        user: T.untyped,
        opts: T.untyped,
        block: T.nilable(T.proc.params(job: DisableRepositoryAccessJob).void)
      ).returns(T.any(DisableRepositoryAccessJob, FalseClass))
    end
    def perform_later(repo, reason, user, **opts, &block); end

    sig { params(repo: T.untyped, reason: T.untyped, user: T.untyped, opts: T.untyped).returns(T.untyped) }
    def perform_now(repo, reason, user, **opts); end
  end
end
