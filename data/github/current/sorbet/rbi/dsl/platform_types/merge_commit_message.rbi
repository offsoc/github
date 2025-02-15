# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::MergeCommitMessage`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::MergeCommitMessage`.

module PlatformTypes::MergeCommitMessage
  sig { returns(T::Boolean) }
  def blank?; end

  sig { returns(T::Boolean) }
  def pr_body?; end

  sig { returns(T::Boolean) }
  def pr_title?; end

  BLANK = T.let("BLANK", String)
  PR_BODY = T.let("PR_BODY", String)
  PR_TITLE = T.let("PR_TITLE", String)
end
