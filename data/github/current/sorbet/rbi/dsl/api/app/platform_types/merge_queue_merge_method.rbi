# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::MergeQueueMergeMethod`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::MergeQueueMergeMethod`.

module Api::App::PlatformTypes::MergeQueueMergeMethod
  sig { returns(T::Boolean) }
  def merge?; end

  sig { returns(T::Boolean) }
  def rebase?; end

  sig { returns(T::Boolean) }
  def squash?; end

  MERGE = T.let("MERGE", String)
  REBASE = T.let("REBASE", String)
  SQUASH = T.let("SQUASH", String)
end
