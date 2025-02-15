# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Conduit::Feeds::V1::GetFeedResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Conduit::Feeds::V1::GetFeedResponse`.

class MonolithTwirp::Conduit::Feeds::V1::GetFeedResponse
  sig do
    params(
      feed_items: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Conduit::Feeds::V1::FeedItem], T::Array[MonolithTwirp::Conduit::Feeds::V1::FeedItem])),
      ranking_model_id: T.nilable(String),
      user_id: T.nilable(Integer),
      variants: T.nilable(String)
    ).void
  end
  def initialize(feed_items: T.unsafe(nil), ranking_model_id: nil, user_id: nil, variants: nil); end

  sig { void }
  def clear_feed_items; end

  sig { void }
  def clear_ranking_model_id; end

  sig { void }
  def clear_user_id; end

  sig { void }
  def clear_variants; end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Conduit::Feeds::V1::FeedItem]) }
  def feed_items; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::Conduit::Feeds::V1::FeedItem]).void }
  def feed_items=(value); end

  sig { returns(String) }
  def ranking_model_id; end

  sig { params(value: String).void }
  def ranking_model_id=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end

  sig { returns(String) }
  def variants; end

  sig { params(value: String).void }
  def variants=(value); end
end
