# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHubConnectIndexAllReposJob`.
# Please instead update this file by running `bin/tapioca dsl GitHubConnectIndexAllReposJob`.

class GitHubConnectIndexAllReposJob
  class << self
    sig do
      params(
        _options: T.untyped,
        block: T.nilable(T.proc.params(job: GitHubConnectIndexAllReposJob).void)
      ).returns(T.any(GitHubConnectIndexAllReposJob, FalseClass))
    end
    def perform_later(_options = T.unsafe(nil), &block); end

    sig { params(_options: T.untyped).returns(T.untyped) }
    def perform_now(_options = T.unsafe(nil)); end
  end
end
