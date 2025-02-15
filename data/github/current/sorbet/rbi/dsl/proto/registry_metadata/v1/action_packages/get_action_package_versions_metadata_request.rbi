# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::ActionPackages::GetActionPackageVersionsMetadataRequest`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::ActionPackages::GetActionPackageVersionsMetadataRequest`.

class Proto::RegistryMetadata::V1::ActionPackages::GetActionPackageVersionsMetadataRequest
  sig do
    params(
      versions: T.nilable(T.any(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::ActionPackages::ActionReference], T::Array[Proto::RegistryMetadata::V1::ActionPackages::ActionReference]))
    ).void
  end
  def initialize(versions: T.unsafe(nil)); end

  sig { void }
  def clear_versions; end

  sig { returns(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::ActionPackages::ActionReference]) }
  def versions; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::ActionPackages::ActionReference]
    ).void
  end
  def versions=(value); end
end
