# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Authnd::Proto::FindActiveDeviceAuthResponse::Result`.
# Please instead update this file by running `bin/tapioca dsl Authnd::Proto::FindActiveDeviceAuthResponse::Result`.

module Authnd::Proto::FindActiveDeviceAuthResponse::Result
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Authnd::Proto::FindActiveDeviceAuthResponse::Result::RESULT_FAILED_GENERIC = -1
Authnd::Proto::FindActiveDeviceAuthResponse::Result::RESULT_NOT_FOUND = 2
Authnd::Proto::FindActiveDeviceAuthResponse::Result::RESULT_SUCCESS = 1
Authnd::Proto::FindActiveDeviceAuthResponse::Result::RESULT_UNKNOWN = 0
