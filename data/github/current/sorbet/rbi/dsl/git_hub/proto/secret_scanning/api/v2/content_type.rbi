# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V2::ContentType`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V2::ContentType`.

module GitHub::Proto::SecretScanning::Api::V2::ContentType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Proto::SecretScanning::Api::V2::ContentType::COMMIT_COMMENT = 3
GitHub::Proto::SecretScanning::Api::V2::ContentType::COMMIT_METADATA = 2
GitHub::Proto::SecretScanning::Api::V2::ContentType::CONTENT_TYPE_UNKNOWN = 0
GitHub::Proto::SecretScanning::Api::V2::ContentType::DISCUSSION_BODY = 13
GitHub::Proto::SecretScanning::Api::V2::ContentType::DISCUSSION_COMMENT = 14
GitHub::Proto::SecretScanning::Api::V2::ContentType::DISCUSSION_TITLE = 12
GitHub::Proto::SecretScanning::Api::V2::ContentType::ISSUE_BODY = 10
GitHub::Proto::SecretScanning::Api::V2::ContentType::ISSUE_COMMENT = 11
GitHub::Proto::SecretScanning::Api::V2::ContentType::ISSUE_TITLE = 9
GitHub::Proto::SecretScanning::Api::V2::ContentType::PULL_REQUEST_BODY = 5
GitHub::Proto::SecretScanning::Api::V2::ContentType::PULL_REQUEST_COMMENT = 6
GitHub::Proto::SecretScanning::Api::V2::ContentType::PULL_REQUEST_REVIEW_COMMENT = 7
GitHub::Proto::SecretScanning::Api::V2::ContentType::PULL_REQUEST_TIMELINE_COMMENT = 8
GitHub::Proto::SecretScanning::Api::V2::ContentType::PULL_REQUEST_TITLE = 4
GitHub::Proto::SecretScanning::Api::V2::ContentType::REPOSITORY_BLOB = 1
GitHub::Proto::SecretScanning::Api::V2::ContentType::WIKI_BLOB = 15
