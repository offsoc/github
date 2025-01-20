# typed: true

module Configurable::MergeCommits
  sig { returns(Promise[T::Boolean]) }
  def self.async_merge_commits_allowed?; end
end
