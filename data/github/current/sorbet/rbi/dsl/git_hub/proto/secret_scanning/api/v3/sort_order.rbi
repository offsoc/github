# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V3::SortOrder`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V3::SortOrder`.

module GitHub::Proto::SecretScanning::Api::V3::SortOrder
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Proto::SecretScanning::Api::V3::SortOrder::CREATED_ASCENDING = 1
GitHub::Proto::SecretScanning::Api::V3::SortOrder::CREATED_DESCENDING = 2
GitHub::Proto::SecretScanning::Api::V3::SortOrder::NAME_ASCENDING = 5
GitHub::Proto::SecretScanning::Api::V3::SortOrder::NAME_DESCENDING = 6
GitHub::Proto::SecretScanning::Api::V3::SortOrder::NO_SORT_ORDER = 0
GitHub::Proto::SecretScanning::Api::V3::SortOrder::UPDATED_ASCENDING = 3
GitHub::Proto::SecretScanning::Api::V3::SortOrder::UPDATED_DESCENDING = 4
