# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Features::Core::V1::CheckActorFeaturesResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Features::Core::V1::CheckActorFeaturesResponse`.

class MonolithTwirp::Features::Core::V1::CheckActorFeaturesResponse
  sig do
    params(
      actor_id: T.nilable(String),
      feature_flags: T.nilable(T.any(Google::Protobuf::Map[String, T::Boolean], T::Hash[String, T::Boolean]))
    ).void
  end
  def initialize(actor_id: nil, feature_flags: T.unsafe(nil)); end

  sig { returns(String) }
  def actor_id; end

  sig { params(value: String).void }
  def actor_id=(value); end

  sig { void }
  def clear_actor_id; end

  sig { void }
  def clear_feature_flags; end

  sig { returns(Google::Protobuf::Map[String, T::Boolean]) }
  def feature_flags; end

  sig { params(value: Google::Protobuf::Map[String, T::Boolean]).void }
  def feature_flags=(value); end
end
