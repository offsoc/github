# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PullRequestReviewDecision`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PullRequestReviewDecision`.

module Api::App::PlatformTypes::PullRequestReviewDecision
  sig { returns(T::Boolean) }
  def approved?; end

  sig { returns(T::Boolean) }
  def changes_requested?; end

  sig { returns(T::Boolean) }
  def review_required?; end

  APPROVED = T.let("APPROVED", String)
  CHANGES_REQUESTED = T.let("CHANGES_REQUESTED", String)
  REVIEW_REQUIRED = T.let("REVIEW_REQUIRED", String)
end
