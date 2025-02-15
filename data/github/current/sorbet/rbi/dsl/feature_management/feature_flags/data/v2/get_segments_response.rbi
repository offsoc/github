# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Data::V2::GetSegmentsResponse`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Data::V2::GetSegmentsResponse`.

class FeatureManagement::FeatureFlags::Data::V2::GetSegmentsResponse
  sig do
    params(
      segments: T.nilable(T.any(Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Data::V2::Segment], T::Array[FeatureManagement::FeatureFlags::Data::V2::Segment]))
    ).void
  end
  def initialize(segments: T.unsafe(nil)); end

  sig { void }
  def clear_segments; end

  sig { returns(Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Data::V2::Segment]) }
  def segments; end

  sig { params(value: Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Data::V2::Segment]).void }
  def segments=(value); end
end
