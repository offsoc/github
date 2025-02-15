# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Issues::V1::ListIssueCommentsResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Issues::V1::ListIssueCommentsResponse`.

class GitHub::Proto::SecretScanning::Issues::V1::ListIssueCommentsResponse
  sig do
    params(
      issue_comment_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      next_cursor: T.nilable(String)
    ).void
  end
  def initialize(issue_comment_ids: T.unsafe(nil), next_cursor: nil); end

  sig { void }
  def clear_issue_comment_ids; end

  sig { void }
  def clear_next_cursor; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def issue_comment_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def issue_comment_ids=(value); end

  sig { returns(String) }
  def next_cursor; end

  sig { params(value: String).void }
  def next_cursor=(value); end
end
