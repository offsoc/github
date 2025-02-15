# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::PullRequestReviewItemEdge`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::PullRequestReviewItemEdge`.

class PlatformTypes::PullRequestReviewItemEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(T.any(PlatformTypes::PullRequestReviewThread, PlatformTypes::PullRequestReviewComment))) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
