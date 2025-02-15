# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::GetCommitMessageRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::GetCommitMessageRequest`.

class MonolithTwirp::Actions::Core::V1::GetCommitMessageRequest
  sig { params(commit_sha: T.nilable(String), repository_id: T.nilable(Integer)).void }
  def initialize(commit_sha: nil, repository_id: nil); end

  sig { void }
  def clear_commit_sha; end

  sig { void }
  def clear_repository_id; end

  sig { returns(String) }
  def commit_sha; end

  sig { params(value: String).void }
  def commit_sha=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
