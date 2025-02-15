# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Feeds::V0::FeedClick`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Feeds::V0::FeedClick`.

class Hydro::Schemas::Github::Feeds::V0::FeedClick
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      click_target: T.nilable(String),
      clicked_at: T.nilable(Google::Protobuf::Timestamp),
      feed_card_id: T.nilable(Hydro::Schemas::Github::Feeds::V0::Entities::FeedCard),
      metadata: T.nilable(Hydro::Schemas::Github::Feeds::V0::Entities::FeedMetadata),
      original_request_id: T.nilable(String),
      ranking_model_id: T.nilable(String),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)
    ).void
  end
  def initialize(actor: nil, click_target: nil, clicked_at: nil, feed_card_id: nil, metadata: nil, original_request_id: nil, ranking_model_id: nil, request_context: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_click_target; end

  sig { void }
  def clear_clicked_at; end

  sig { void }
  def clear_feed_card_id; end

  sig { void }
  def clear_metadata; end

  sig { void }
  def clear_original_request_id; end

  sig { void }
  def clear_ranking_model_id; end

  sig { void }
  def clear_request_context; end

  sig { returns(String) }
  def click_target; end

  sig { params(value: String).void }
  def click_target=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def clicked_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def clicked_at=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Feeds::V0::Entities::FeedCard)) }
  def feed_card_id; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Feeds::V0::Entities::FeedCard)).void }
  def feed_card_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Feeds::V0::Entities::FeedMetadata)) }
  def metadata; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Feeds::V0::Entities::FeedMetadata)).void }
  def metadata=(value); end

  sig { returns(String) }
  def original_request_id; end

  sig { params(value: String).void }
  def original_request_id=(value); end

  sig { returns(String) }
  def ranking_model_id; end

  sig { params(value: String).void }
  def ranking_model_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end
end
