# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ProjectV2ItemFieldReviewerValue`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ProjectV2ItemFieldReviewerValue`.

class PlatformTypes::ProjectV2ItemFieldReviewerValue < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig do
    returns(T.any(PlatformTypes::ProjectV2Field, PlatformTypes::ProjectV2SingleSelectField, PlatformTypes::ProjectV2IterationField))
  end
  def field; end

  sig { returns(T::Boolean) }
  def field?; end

  sig { returns(T.nilable(PlatformTypes::RequestedReviewerConnection)) }
  def reviewers; end

  sig { returns(T::Boolean) }
  def reviewers?; end
end
