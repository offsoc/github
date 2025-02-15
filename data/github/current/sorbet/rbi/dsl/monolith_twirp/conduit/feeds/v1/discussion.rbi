# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Conduit::Feeds::V1::Discussion`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Conduit::Feeds::V1::Discussion`.

class MonolithTwirp::Conduit::Feeds::V1::Discussion
  sig do
    params(
      author: T.nilable(MonolithTwirp::Conduit::Feeds::V1::User),
      body_html: T.nilable(String),
      comment_count: T.nilable(Integer),
      id: T.nilable(Integer),
      repository: T.nilable(MonolithTwirp::Conduit::Feeds::V1::Repository),
      title: T.nilable(String),
      total_upvotes: T.nilable(Integer)
    ).void
  end
  def initialize(author: nil, body_html: nil, comment_count: nil, id: nil, repository: nil, title: nil, total_upvotes: nil); end

  sig { returns(T.nilable(MonolithTwirp::Conduit::Feeds::V1::User)) }
  def author; end

  sig { params(value: T.nilable(MonolithTwirp::Conduit::Feeds::V1::User)).void }
  def author=(value); end

  sig { returns(String) }
  def body_html; end

  sig { params(value: String).void }
  def body_html=(value); end

  sig { void }
  def clear_author; end

  sig { void }
  def clear_body_html; end

  sig { void }
  def clear_comment_count; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_title; end

  sig { void }
  def clear_total_upvotes; end

  sig { returns(Integer) }
  def comment_count; end

  sig { params(value: Integer).void }
  def comment_count=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T.nilable(MonolithTwirp::Conduit::Feeds::V1::Repository)) }
  def repository; end

  sig { params(value: T.nilable(MonolithTwirp::Conduit::Feeds::V1::Repository)).void }
  def repository=(value); end

  sig { returns(String) }
  def title; end

  sig { params(value: String).void }
  def title=(value); end

  sig { returns(Integer) }
  def total_upvotes; end

  sig { params(value: Integer).void }
  def total_upvotes=(value); end
end
