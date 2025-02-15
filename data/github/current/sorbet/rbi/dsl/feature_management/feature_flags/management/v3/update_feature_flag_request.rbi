# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Management::V3::UpdateFeatureFlagRequest`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Management::V3::UpdateFeatureFlagRequest`.

class FeatureManagement::FeatureFlags::Management::V3::UpdateFeatureFlagRequest
  sig do
    params(
      feature: T.nilable(FeatureManagement::FeatureFlags::Management::V3::FeatureFlag),
      update_mask: T.nilable(Google::Protobuf::FieldMask)
    ).void
  end
  def initialize(feature: nil, update_mask: nil); end

  sig { returns(T.nilable(Symbol)) }
  def _update_mask; end

  sig { void }
  def clear_feature; end

  sig { void }
  def clear_update_mask; end

  sig { returns(T.nilable(FeatureManagement::FeatureFlags::Management::V3::FeatureFlag)) }
  def feature; end

  sig { params(value: T.nilable(FeatureManagement::FeatureFlags::Management::V3::FeatureFlag)).void }
  def feature=(value); end

  sig { returns(T.nilable(Google::Protobuf::FieldMask)) }
  def update_mask; end

  sig { params(value: T.nilable(Google::Protobuf::FieldMask)).void }
  def update_mask=(value); end
end
