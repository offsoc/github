# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Commits::V1::ListCommitsResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Commits::V1::ListCommitsResponse`.

class GitHub::Spokes::Proto::Commits::V1::ListCommitsResponse
  sig do
    params(
      commits: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Commits::V1::CommitItem], T::Array[GitHub::Spokes::Proto::Commits::V1::CommitItem])),
      next_cursor: T.nilable(GitHub::Spokes::Proto::Types::V1::Cursor)
    ).void
  end
  def initialize(commits: T.unsafe(nil), next_cursor: nil); end

  sig { void }
  def clear_commits; end

  sig { void }
  def clear_next_cursor; end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Commits::V1::CommitItem]) }
  def commits; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Commits::V1::CommitItem]).void }
  def commits=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Cursor)) }
  def next_cursor; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Cursor)).void }
  def next_cursor=(value); end
end
