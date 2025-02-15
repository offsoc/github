# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Issues::V1::GetIssueBodyHistoryResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Issues::V1::GetIssueBodyHistoryResponse`.

class GitHub::Proto::SecretScanning::Issues::V1::GetIssueBodyHistoryResponse
  sig do
    params(
      issue_body_history: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Issues::V1::IssueBody], T::Array[GitHub::Proto::SecretScanning::Issues::V1::IssueBody])),
      next_cursor: T.nilable(String)
    ).void
  end
  def initialize(issue_body_history: T.unsafe(nil), next_cursor: nil); end

  sig { void }
  def clear_issue_body_history; end

  sig { void }
  def clear_next_cursor; end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Issues::V1::IssueBody]) }
  def issue_body_history; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Issues::V1::IssueBody]).void }
  def issue_body_history=(value); end

  sig { returns(String) }
  def next_cursor; end

  sig { params(value: String).void }
  def next_cursor=(value); end
end
