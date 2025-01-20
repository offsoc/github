# typed: true

module Configurable::SquashCommits
  sig { returns(Promise[T::Boolean]) }
  def self.async_squash_commits_allowed?; end
end
