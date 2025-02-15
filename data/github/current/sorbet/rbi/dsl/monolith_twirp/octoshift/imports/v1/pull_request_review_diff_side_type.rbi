# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::PullRequestReviewDiffSideType`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::PullRequestReviewDiffSideType`.

module MonolithTwirp::Octoshift::Imports::V1::PullRequestReviewDiffSideType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::Octoshift::Imports::V1::PullRequestReviewDiffSideType::PULL_REQUEST_REVIEW_DIFF_SIDE_TYPE_INVALID = 0
MonolithTwirp::Octoshift::Imports::V1::PullRequestReviewDiffSideType::PULL_REQUEST_REVIEW_DIFF_SIDE_TYPE_LEFT = 1
MonolithTwirp::Octoshift::Imports::V1::PullRequestReviewDiffSideType::PULL_REQUEST_REVIEW_DIFF_SIDE_TYPE_RIGHT = 2
