# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::MergeCommitTitle`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::MergeCommitTitle`.

module Api::App::PlatformTypes::MergeCommitTitle
  sig { returns(T::Boolean) }
  def merge_message?; end

  sig { returns(T::Boolean) }
  def pr_title?; end

  MERGE_MESSAGE = T.let("MERGE_MESSAGE", String)
  PR_TITLE = T.let("PR_TITLE", String)
end
