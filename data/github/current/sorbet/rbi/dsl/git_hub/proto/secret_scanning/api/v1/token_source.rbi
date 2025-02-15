# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V1::TokenSource`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V1::TokenSource`.

module GitHub::Proto::SecretScanning::Api::V1::TokenSource
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Proto::SecretScanning::Api::V1::TokenSource::COMMIT = 2
GitHub::Proto::SecretScanning::Api::V1::TokenSource::COMMIT_COMMENT = 9
GitHub::Proto::SecretScanning::Api::V1::TokenSource::CONTENT = 1
GitHub::Proto::SecretScanning::Api::V1::TokenSource::DISCUSSION_BODY = 7
GitHub::Proto::SecretScanning::Api::V1::TokenSource::DISCUSSION_COMMENT = 8
GitHub::Proto::SecretScanning::Api::V1::TokenSource::DISCUSSION_TITLE = 14
GitHub::Proto::SecretScanning::Api::V1::TokenSource::GIST_COMMENT = 11
GitHub::Proto::SecretScanning::Api::V1::TokenSource::GIST_CONTENT = 10
GitHub::Proto::SecretScanning::Api::V1::TokenSource::ISSUE_COMMENT = 6
GitHub::Proto::SecretScanning::Api::V1::TokenSource::ISSUE_DESCRIPTION = 5
GitHub::Proto::SecretScanning::Api::V1::TokenSource::ISSUE_TITLE = 12
GitHub::Proto::SecretScanning::Api::V1::TokenSource::NPM = 15
GitHub::Proto::SecretScanning::Api::V1::TokenSource::PULL_REQUEST_COMMENT = 4
GitHub::Proto::SecretScanning::Api::V1::TokenSource::PULL_REQUEST_DESCRIPTION = 3
GitHub::Proto::SecretScanning::Api::V1::TokenSource::PULL_REQUEST_TITLE = 13
GitHub::Proto::SecretScanning::Api::V1::TokenSource::UNKNOWN_SOURCE = 0
GitHub::Proto::SecretScanning::Api::V1::TokenSource::WIKI_COMMIT = 17
GitHub::Proto::SecretScanning::Api::V1::TokenSource::WIKI_CONTENT = 16
