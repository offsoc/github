# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Discussions::V1::StreamDiscussionContentRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Discussions::V1::StreamDiscussionContentRequest`.

class GitHub::Proto::SecretScanning::Discussions::V1::StreamDiscussionContentRequest
  sig do
    params(
      cursor: T.nilable(GitHub::Proto::SecretScanning::Discussions::V1::StreamDiscussionContentResponseCursor),
      discussion_number: T.nilable(Integer),
      repo_id: T.nilable(Integer)
    ).void
  end
  def initialize(cursor: nil, discussion_number: nil, repo_id: nil); end

  sig { void }
  def clear_cursor; end

  sig { void }
  def clear_discussion_number; end

  sig { void }
  def clear_repo_id; end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Discussions::V1::StreamDiscussionContentResponseCursor)) }
  def cursor; end

  sig do
    params(
      value: T.nilable(GitHub::Proto::SecretScanning::Discussions::V1::StreamDiscussionContentResponseCursor)
    ).void
  end
  def cursor=(value); end

  sig { returns(Integer) }
  def discussion_number; end

  sig { params(value: Integer).void }
  def discussion_number=(value); end

  sig { returns(Integer) }
  def repo_id; end

  sig { params(value: Integer).void }
  def repo_id=(value); end
end
