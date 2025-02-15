# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Conduit::Feeds::V1::Release`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Conduit::Feeds::V1::Release`.

class MonolithTwirp::Conduit::Feeds::V1::Release
  sig do
    params(
      author: T.nilable(MonolithTwirp::Conduit::Feeds::V1::User),
      id: T.nilable(Integer),
      name: T.nilable(String),
      repository: T.nilable(MonolithTwirp::Conduit::Feeds::V1::Repository),
      short_description_html: T.nilable(String),
      tag_name: T.nilable(String)
    ).void
  end
  def initialize(author: nil, id: nil, name: nil, repository: nil, short_description_html: nil, tag_name: nil); end

  sig { returns(T.nilable(MonolithTwirp::Conduit::Feeds::V1::User)) }
  def author; end

  sig { params(value: T.nilable(MonolithTwirp::Conduit::Feeds::V1::User)).void }
  def author=(value); end

  sig { void }
  def clear_author; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_short_description_html; end

  sig { void }
  def clear_tag_name; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(T.nilable(MonolithTwirp::Conduit::Feeds::V1::Repository)) }
  def repository; end

  sig { params(value: T.nilable(MonolithTwirp::Conduit::Feeds::V1::Repository)).void }
  def repository=(value); end

  sig { returns(String) }
  def short_description_html; end

  sig { params(value: String).void }
  def short_description_html=(value); end

  sig { returns(String) }
  def tag_name; end

  sig { params(value: String).void }
  def tag_name=(value); end
end
