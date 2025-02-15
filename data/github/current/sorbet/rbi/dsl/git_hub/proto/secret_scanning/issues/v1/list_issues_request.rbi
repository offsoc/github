# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Issues::V1::ListIssuesRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Issues::V1::ListIssuesRequest`.

class GitHub::Proto::SecretScanning::Issues::V1::ListIssuesRequest
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
