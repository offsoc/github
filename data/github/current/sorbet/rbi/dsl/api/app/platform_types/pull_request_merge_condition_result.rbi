# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PullRequestMergeConditionResult`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PullRequestMergeConditionResult`.

module Api::App::PlatformTypes::PullRequestMergeConditionResult
  sig { returns(T::Boolean) }
  def failed?; end

  sig { returns(T::Boolean) }
  def passed?; end

  sig { returns(T::Boolean) }
  def unknown?; end

  FAILED = T.let("FAILED", String)
  PASSED = T.let("PASSED", String)
  UNKNOWN = T.let("UNKNOWN", String)
end
