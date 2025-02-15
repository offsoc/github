# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PullRequestContributionsByRepository`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PullRequestContributionsByRepository`.

class Api::App::PlatformTypes::PullRequestContributionsByRepository < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Api::App::PlatformTypes::CreatedPullRequestContributionConnection) }
  def contributions; end

  sig { returns(T::Boolean) }
  def contributions?; end

  sig { returns(T::Array[Api::App::PlatformTypes::PullRequestContributionsByState]) }
  def contributions_by_state; end

  sig { returns(T::Boolean) }
  def contributions_by_state?; end

  sig { returns(Api::App::PlatformTypes::Repository) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end
end
