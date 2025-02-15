# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome`.

module Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome::ACCESS_DENIED = 4
Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome::NAMESPACE_RETIRED = 3
Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome::PACKAGE_NOT_FOUND = 1
Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome::UNKNOWN_OUTCOME = 0
Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome::VERSION_NOT_FOUND = 2
Proto::RegistryMetadata::V1::ActionPackages::ActionPackageResolutionOutcome::VERSION_RESOLVED = 5
