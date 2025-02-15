# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Package::GetPackagesByNamesResponse`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Package::GetPackagesByNamesResponse`.

class Proto::RegistryMetadata::V1::Package::GetPackagesByNamesResponse
  sig do
    params(
      packages: T.nilable(T.any(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Package::PackageMetadata], T::Array[Proto::RegistryMetadata::V1::Package::PackageMetadata]))
    ).void
  end
  def initialize(packages: T.unsafe(nil)); end

  sig { void }
  def clear_packages; end

  sig { returns(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Package::PackageMetadata]) }
  def packages; end

  sig { params(value: Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Package::PackageMetadata]).void }
  def packages=(value); end
end
