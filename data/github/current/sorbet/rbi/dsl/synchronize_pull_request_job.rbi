# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SynchronizePullRequestJob`.
# Please instead update this file by running `bin/tapioca dsl SynchronizePullRequestJob`.

class SynchronizePullRequestJob
  class << self
    sig do
      params(
        pull_request_id: T.untyped,
        user: T.untyped,
        installation: T.untyped,
        repo: T.untyped,
        forced: T.untyped,
        ref: T.untyped,
        before: T.untyped,
        after: T.untyped,
        should_mark_merged: T.untyped,
        precomputed_merge_oids: T.untyped,
        promote_reviews: T.untyped,
        push_options: T.untyped,
        non_compliant_merge: T.untyped,
        pushed_at: T.untyped,
        kwargs: T.untyped,
        block: T.nilable(T.proc.params(job: SynchronizePullRequestJob).void)
      ).returns(T.any(SynchronizePullRequestJob, FalseClass))
    end
    def perform_later(pull_request_id:, user:, installation:, repo:, forced:, ref:, before:, after:, should_mark_merged: T.unsafe(nil), precomputed_merge_oids: T.unsafe(nil), promote_reviews: T.unsafe(nil), push_options: T.unsafe(nil), non_compliant_merge: T.unsafe(nil), pushed_at: T.unsafe(nil), **kwargs, &block); end

    sig do
      params(
        pull_request_id: T.untyped,
        user: T.untyped,
        installation: T.untyped,
        repo: T.untyped,
        forced: T.untyped,
        ref: T.untyped,
        before: T.untyped,
        after: T.untyped,
        should_mark_merged: T.untyped,
        precomputed_merge_oids: T.untyped,
        promote_reviews: T.untyped,
        push_options: T.untyped,
        non_compliant_merge: T.untyped,
        pushed_at: T.untyped,
        kwargs: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(pull_request_id:, user:, installation:, repo:, forced:, ref:, before:, after:, should_mark_merged: T.unsafe(nil), precomputed_merge_oids: T.unsafe(nil), promote_reviews: T.unsafe(nil), push_options: T.unsafe(nil), non_compliant_merge: T.unsafe(nil), pushed_at: T.unsafe(nil), **kwargs); end
  end
end
