# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Authnd::Proto::IssueTokenResponse::Result`.
# Please instead update this file by running `bin/tapioca dsl Authnd::Proto::IssueTokenResponse::Result`.

module Authnd::Proto::IssueTokenResponse::Result
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Authnd::Proto::IssueTokenResponse::Result::RESULT_FAILED_GENERIC = -1
Authnd::Proto::IssueTokenResponse::Result::RESULT_FAILED_USER_SUSPENDED = 5
Authnd::Proto::IssueTokenResponse::Result::RESULT_FAILED_USER_UNKNOWN = 4
Authnd::Proto::IssueTokenResponse::Result::RESULT_INVALID_ATTRIBUTES = 2
Authnd::Proto::IssueTokenResponse::Result::RESULT_SUCCESS = 1
Authnd::Proto::IssueTokenResponse::Result::RESULT_UNKNOWN = 0
Authnd::Proto::IssueTokenResponse::Result::RESULT_UNSUPPORTED_TOKEN_TYPE = 3
