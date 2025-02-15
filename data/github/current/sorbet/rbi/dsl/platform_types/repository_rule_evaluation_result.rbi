# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::RepositoryRuleEvaluationResult`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::RepositoryRuleEvaluationResult`.

module PlatformTypes::RepositoryRuleEvaluationResult
  sig { returns(T::Boolean) }
  def failed?; end

  sig { returns(T::Boolean) }
  def passed?; end

  FAILED = T.let("FAILED", String)
  PASSED = T.let("PASSED", String)
end
