# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PullRequestReviewThreadOutdatedFilterType`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PullRequestReviewThreadOutdatedFilterType`.

module Api::App::PlatformTypes::PullRequestReviewThreadOutdatedFilterType
  sig { returns(T::Boolean) }
  def exclude_outdated?; end

  sig { returns(T::Boolean) }
  def include_outdated?; end

  sig { returns(T::Boolean) }
  def only_outdated?; end

  EXCLUDE_OUTDATED = T.let("EXCLUDE_OUTDATED", String)
  INCLUDE_OUTDATED = T.let("INCLUDE_OUTDATED", String)
  ONLY_OUTDATED = T.let("ONLY_OUTDATED", String)
end
