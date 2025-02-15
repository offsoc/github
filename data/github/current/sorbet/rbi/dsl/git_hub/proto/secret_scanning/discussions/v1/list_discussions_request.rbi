# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Discussions::V1::ListDiscussionsRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Discussions::V1::ListDiscussionsRequest`.

class GitHub::Proto::SecretScanning::Discussions::V1::ListDiscussionsRequest
  sig { params(cursor: T.nilable(String), repo_id: T.nilable(Integer)).void }
  def initialize(cursor: nil, repo_id: nil); end

  sig { void }
  def clear_cursor; end

  sig { void }
  def clear_repo_id; end

  sig { returns(String) }
  def cursor; end

  sig { params(value: String).void }
  def cursor=(value); end

  sig { returns(Integer) }
  def repo_id; end

  sig { params(value: Integer).void }
  def repo_id=(value); end
end
