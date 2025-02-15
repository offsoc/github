# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ProjectV2ItemType`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ProjectV2ItemType`.

module PlatformTypes::ProjectV2ItemType
  sig { returns(T::Boolean) }
  def draft_issue?; end

  sig { returns(T::Boolean) }
  def issue?; end

  sig { returns(T::Boolean) }
  def pull_request?; end

  sig { returns(T::Boolean) }
  def redacted?; end

  DRAFT_ISSUE = T.let("DRAFT_ISSUE", String)
  ISSUE = T.let("ISSUE", String)
  PULL_REQUEST = T.let("PULL_REQUEST", String)
  REDACTED = T.let("REDACTED", String)
end
