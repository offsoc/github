# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Package::GetPackageVersionResponse`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Package::GetPackageVersionResponse`.

class Proto::RegistryMetadata::V1::Package::GetPackageVersionResponse
  sig { params(version: T.nilable(Proto::RegistryMetadata::V1::Package::Version)).void }
  def initialize(version: nil); end

  sig { void }
  def clear_version; end

  sig { returns(T.nilable(Proto::RegistryMetadata::V1::Package::Version)) }
  def version; end

  sig { params(value: T.nilable(Proto::RegistryMetadata::V1::Package::Version)).void }
  def version=(value); end
end
