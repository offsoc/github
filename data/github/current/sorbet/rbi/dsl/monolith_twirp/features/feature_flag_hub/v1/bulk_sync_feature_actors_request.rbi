# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Features::FeatureFlagHub::V1::BulkSyncFeatureActorsRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Features::FeatureFlagHub::V1::BulkSyncFeatureActorsRequest`.

class MonolithTwirp::Features::FeatureFlagHub::V1::BulkSyncFeatureActorsRequest
  sig do
    params(
      actors: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      feature_name: T.nilable(String),
      is_first_batch: T.nilable(T::Boolean),
      is_last_batch: T.nilable(T::Boolean),
      sync_correlation_id: T.nilable(String)
    ).void
  end
  def initialize(actors: T.unsafe(nil), feature_name: nil, is_first_batch: nil, is_last_batch: nil, sync_correlation_id: nil); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def actors; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def actors=(value); end

  sig { void }
  def clear_actors; end

  sig { void }
  def clear_feature_name; end

  sig { void }
  def clear_is_first_batch; end

  sig { void }
  def clear_is_last_batch; end

  sig { void }
  def clear_sync_correlation_id; end

  sig { returns(String) }
  def feature_name; end

  sig { params(value: String).void }
  def feature_name=(value); end

  sig { returns(T::Boolean) }
  def is_first_batch; end

  sig { params(value: T::Boolean).void }
  def is_first_batch=(value); end

  sig { returns(T::Boolean) }
  def is_last_batch; end

  sig { params(value: T::Boolean).void }
  def is_last_batch=(value); end

  sig { returns(String) }
  def sync_correlation_id; end

  sig { params(value: String).void }
  def sync_correlation_id=(value); end
end
