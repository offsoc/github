# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::TrackedIssueStates`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::TrackedIssueStates`.

module PlatformTypes::TrackedIssueStates
  sig { returns(T::Boolean) }
  def closed?; end

  sig { returns(T::Boolean) }
  def open?; end

  CLOSED = T.let("CLOSED", String)
  OPEN = T.let("OPEN", String)
end
