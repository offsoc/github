# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Package::GetPackageVersionFilesResponse`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Package::GetPackageVersionFilesResponse`.

class Proto::RegistryMetadata::V1::Package::GetPackageVersionFilesResponse
  sig do
    params(
      files: T.nilable(T.any(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Package::PackageFile], T::Array[Proto::RegistryMetadata::V1::Package::PackageFile]))
    ).void
  end
  def initialize(files: T.unsafe(nil)); end

  sig { void }
  def clear_files; end

  sig { returns(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Package::PackageFile]) }
  def files; end

  sig { params(value: Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Package::PackageFile]).void }
  def files=(value); end
end
