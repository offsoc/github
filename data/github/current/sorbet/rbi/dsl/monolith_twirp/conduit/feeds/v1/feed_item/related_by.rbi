# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Conduit::Feeds::V1::FeedItem::RelatedBy`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Conduit::Feeds::V1::FeedItem::RelatedBy`.

module MonolithTwirp::Conduit::Feeds::V1::FeedItem::RelatedBy
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::Conduit::Feeds::V1::FeedItem::RelatedBy::RELATED_BY_ACTOR = 2
MonolithTwirp::Conduit::Feeds::V1::FeedItem::RelatedBy::RELATED_BY_INVALID = 0
MonolithTwirp::Conduit::Feeds::V1::FeedItem::RelatedBy::RELATED_BY_NONE = 1
MonolithTwirp::Conduit::Feeds::V1::FeedItem::RelatedBy::RELATED_BY_SUBJECT = 3
