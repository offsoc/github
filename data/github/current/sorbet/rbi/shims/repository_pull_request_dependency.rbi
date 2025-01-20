# typed: true

module Repository::PullRequestDependency
  sig { returns(Promise[T::Boolean]) }
  def async_merge_commits_allowed?; end

  sig { returns(Promise[T::Boolean]) }
  def async_squash_commits_allowed?; end

  sig { returns(Promise[T::Boolean]) }
  def async_rebase_commits_allowed?; end
end
