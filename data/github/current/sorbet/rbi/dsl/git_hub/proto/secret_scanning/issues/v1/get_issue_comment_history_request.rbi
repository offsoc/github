# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Issues::V1::GetIssueCommentHistoryRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Issues::V1::GetIssueCommentHistoryRequest`.

class GitHub::Proto::SecretScanning::Issues::V1::GetIssueCommentHistoryRequest
  sig { params(cursor: T.nilable(String), issue_comment_id: T.nilable(Integer)).void }
  def initialize(cursor: nil, issue_comment_id: nil); end

  sig { void }
  def clear_cursor; end

  sig { void }
  def clear_issue_comment_id; end

  sig { returns(String) }
  def cursor; end

  sig { params(value: String).void }
  def cursor=(value); end

  sig { returns(Integer) }
  def issue_comment_id; end

  sig { params(value: Integer).void }
  def issue_comment_id=(value); end
end
