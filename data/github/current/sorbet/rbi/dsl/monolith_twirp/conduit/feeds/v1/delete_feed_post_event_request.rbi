# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Conduit::Feeds::V1::DeleteFeedPostEventRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Conduit::Feeds::V1::DeleteFeedPostEventRequest`.

class MonolithTwirp::Conduit::Feeds::V1::DeleteFeedPostEventRequest
  sig { params(feed_post_id: T.nilable(Integer)).void }
  def initialize(feed_post_id: nil); end

  sig { void }
  def clear_feed_post_id; end

  sig { returns(Integer) }
  def feed_post_id; end

  sig { params(value: Integer).void }
  def feed_post_id=(value); end
end
