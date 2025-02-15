# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::StoragePolicyType`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::StoragePolicyType`.

module MonolithTwirp::Octoshift::Imports::V1::StoragePolicyType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::Octoshift::Imports::V1::StoragePolicyType::STORAGE_POLICY_TYPE_CLUSTER = 1
MonolithTwirp::Octoshift::Imports::V1::StoragePolicyType::STORAGE_POLICY_TYPE_INVALID = 0
MonolithTwirp::Octoshift::Imports::V1::StoragePolicyType::STORAGE_POLICY_TYPE_MEMORY_ALPHA = 3
MonolithTwirp::Octoshift::Imports::V1::StoragePolicyType::STORAGE_POLICY_TYPE_S3 = 2
