# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ProjectWorkflowTriggerType`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ProjectWorkflowTriggerType`.

module PlatformTypes::ProjectWorkflowTriggerType
  sig { returns(T::Boolean) }
  def issue_closed?; end

  sig { returns(T::Boolean) }
  def issue_pending_card_added?; end

  sig { returns(T::Boolean) }
  def issue_reopened?; end

  sig { returns(T::Boolean) }
  def pr_approved?; end

  sig { returns(T::Boolean) }
  def pr_closed_not_merged?; end

  sig { returns(T::Boolean) }
  def pr_merged?; end

  sig { returns(T::Boolean) }
  def pr_pending_approval?; end

  sig { returns(T::Boolean) }
  def pr_pending_card_added?; end

  sig { returns(T::Boolean) }
  def pr_reopened?; end

  ISSUE_CLOSED = T.let("ISSUE_CLOSED", String)
  ISSUE_PENDING_CARD_ADDED = T.let("ISSUE_PENDING_CARD_ADDED", String)
  ISSUE_REOPENED = T.let("ISSUE_REOPENED", String)
  PR_APPROVED = T.let("PR_APPROVED", String)
  PR_CLOSED_NOT_MERGED = T.let("PR_CLOSED_NOT_MERGED", String)
  PR_MERGED = T.let("PR_MERGED", String)
  PR_PENDING_APPROVAL = T.let("PR_PENDING_APPROVAL", String)
  PR_PENDING_CARD_ADDED = T.let("PR_PENDING_CARD_ADDED", String)
  PR_REOPENED = T.let("PR_REOPENED", String)
end
