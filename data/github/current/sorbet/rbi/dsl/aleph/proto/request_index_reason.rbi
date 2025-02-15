# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aleph::Proto::RequestIndexReason`.
# Please instead update this file by running `bin/tapioca dsl Aleph::Proto::RequestIndexReason`.

module Aleph::Proto::RequestIndexReason
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Aleph::Proto::RequestIndexReason::CODE_NAV_USER_VIEWING_CODE = 1
Aleph::Proto::RequestIndexReason::CODE_NAV_USER_VIEWING_CODE_DIFF = 5
Aleph::Proto::RequestIndexReason::UNKNOWN_INDEXING_REQUESTER = 0
Aleph::Proto::RequestIndexReason::VEA_REPO_USER_VIEWING_ALERTS = 4
Aleph::Proto::RequestIndexReason::VEA_REPO_WITH_ALERT = 3
Aleph::Proto::RequestIndexReason::VEA_REPO_WITH_VULNERABILITY = 2
