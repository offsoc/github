# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::RequestReviewsPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::RequestReviewsPayload`.

class PlatformTypes::RequestReviewsPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def actor; end

  sig { returns(T::Boolean) }
  def actor?; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::PullRequest)) }
  def pull_request; end

  sig { returns(T::Boolean) }
  def pull_request?; end

  sig { returns(T.nilable(PlatformTypes::UserEdge)) }
  def requested_reviewers_edge; end

  sig { returns(T::Boolean) }
  def requested_reviewers_edge?; end
end
