# typed: true

module Configurable::RebaseCommits
  sig { returns(Promise[T::Boolean]) }
  def self.async_rebase_commits_allowed?; end
end
