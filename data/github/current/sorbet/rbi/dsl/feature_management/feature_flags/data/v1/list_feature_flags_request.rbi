# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Data::V1::ListFeatureFlagsRequest`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Data::V1::ListFeatureFlagsRequest`.

class FeatureManagement::FeatureFlags::Data::V1::ListFeatureFlagsRequest
  sig do
    params(
      names: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      owning_service: T.nilable(String)
    ).void
  end
  def initialize(names: T.unsafe(nil), owning_service: nil); end

  sig { void }
  def clear_names; end

  sig { void }
  def clear_owning_service; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def names; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def names=(value); end

  sig { returns(String) }
  def owning_service; end

  sig { params(value: String).void }
  def owning_service=(value); end
end
