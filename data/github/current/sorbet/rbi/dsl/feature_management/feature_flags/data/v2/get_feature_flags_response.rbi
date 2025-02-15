# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Data::V2::GetFeatureFlagsResponse`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Data::V2::GetFeatureFlagsResponse`.

class FeatureManagement::FeatureFlags::Data::V2::GetFeatureFlagsResponse
  sig do
    params(
      feature_flags: T.nilable(T.any(Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Data::V2::FeatureFlag], T::Array[FeatureManagement::FeatureFlags::Data::V2::FeatureFlag]))
    ).void
  end
  def initialize(feature_flags: T.unsafe(nil)); end

  sig { void }
  def clear_feature_flags; end

  sig { returns(Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Data::V2::FeatureFlag]) }
  def feature_flags; end

  sig { params(value: Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Data::V2::FeatureFlag]).void }
  def feature_flags=(value); end
end
