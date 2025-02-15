# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest::ChecksumStrategy`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest::ChecksumStrategy`.

module GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest::ChecksumStrategy
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest::ChecksumStrategy::CHECKSUM_STRATEGY_FORGET_CHECKSUMS = 2
GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest::ChecksumStrategy::CHECKSUM_STRATEGY_INVALID = 0
GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest::ChecksumStrategy::CHECKSUM_STRATEGY_REUSE_CHECKSUMS = 1
