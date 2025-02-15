# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::WorkflowRunEvent`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::WorkflowRunEvent`.

module PlatformTypes::WorkflowRunEvent
  sig { returns(T::Boolean) }
  def branch_protection_rule?; end

  sig { returns(T::Boolean) }
  def check_run?; end

  sig { returns(T::Boolean) }
  def check_suite?; end

  sig { returns(T::Boolean) }
  def create?; end

  sig { returns(T::Boolean) }
  def delete?; end

  sig { returns(T::Boolean) }
  def deployment?; end

  sig { returns(T::Boolean) }
  def deployment_status?; end

  sig { returns(T::Boolean) }
  def discussion?; end

  sig { returns(T::Boolean) }
  def discussion_comment?; end

  sig { returns(T::Boolean) }
  def dynamic?; end

  sig { returns(T::Boolean) }
  def fork?; end

  sig { returns(T::Boolean) }
  def gollum?; end

  sig { returns(T::Boolean) }
  def issue_comment?; end

  sig { returns(T::Boolean) }
  def issues?; end

  sig { returns(T::Boolean) }
  def label?; end

  sig { returns(T::Boolean) }
  def merge_group?; end

  sig { returns(T::Boolean) }
  def milestone?; end

  sig { returns(T::Boolean) }
  def page_build?; end

  sig { returns(T::Boolean) }
  def project?; end

  sig { returns(T::Boolean) }
  def project_card?; end

  sig { returns(T::Boolean) }
  def project_column?; end

  sig { returns(T::Boolean) }
  def public?; end

  sig { returns(T::Boolean) }
  def pull_request?; end

  sig { returns(T::Boolean) }
  def pull_request_review?; end

  sig { returns(T::Boolean) }
  def pull_request_review_comment?; end

  sig { returns(T::Boolean) }
  def pull_request_target?; end

  sig { returns(T::Boolean) }
  def push?; end

  sig { returns(T::Boolean) }
  def registry_package?; end

  sig { returns(T::Boolean) }
  def release?; end

  sig { returns(T::Boolean) }
  def repository_dispatch?; end

  sig { returns(T::Boolean) }
  def schedule?; end

  sig { returns(T::Boolean) }
  def status?; end

  sig { returns(T::Boolean) }
  def watch?; end

  sig { returns(T::Boolean) }
  def workflow_dispatch?; end

  sig { returns(T::Boolean) }
  def workflow_run?; end

  BRANCH_PROTECTION_RULE = T.let("BRANCH_PROTECTION_RULE", String)
  CHECK_RUN = T.let("CHECK_RUN", String)
  CHECK_SUITE = T.let("CHECK_SUITE", String)
  CREATE = T.let("CREATE", String)
  DELETE = T.let("DELETE", String)
  DEPLOYMENT = T.let("DEPLOYMENT", String)
  DEPLOYMENT_STATUS = T.let("DEPLOYMENT_STATUS", String)
  DISCUSSION = T.let("DISCUSSION", String)
  DISCUSSION_COMMENT = T.let("DISCUSSION_COMMENT", String)
  DYNAMIC = T.let("DYNAMIC", String)
  FORK = T.let("FORK", String)
  GOLLUM = T.let("GOLLUM", String)
  ISSUES = T.let("ISSUES", String)
  ISSUE_COMMENT = T.let("ISSUE_COMMENT", String)
  LABEL = T.let("LABEL", String)
  MERGE_GROUP = T.let("MERGE_GROUP", String)
  MILESTONE = T.let("MILESTONE", String)
  PAGE_BUILD = T.let("PAGE_BUILD", String)
  PROJECT = T.let("PROJECT", String)
  PROJECT_CARD = T.let("PROJECT_CARD", String)
  PROJECT_COLUMN = T.let("PROJECT_COLUMN", String)
  PUBLIC = T.let("PUBLIC", String)
  PULL_REQUEST = T.let("PULL_REQUEST", String)
  PULL_REQUEST_REVIEW = T.let("PULL_REQUEST_REVIEW", String)
  PULL_REQUEST_REVIEW_COMMENT = T.let("PULL_REQUEST_REVIEW_COMMENT", String)
  PULL_REQUEST_TARGET = T.let("PULL_REQUEST_TARGET", String)
  PUSH = T.let("PUSH", String)
  REGISTRY_PACKAGE = T.let("REGISTRY_PACKAGE", String)
  RELEASE = T.let("RELEASE", String)
  REPOSITORY_DISPATCH = T.let("REPOSITORY_DISPATCH", String)
  SCHEDULE = T.let("SCHEDULE", String)
  STATUS = T.let("STATUS", String)
  WATCH = T.let("WATCH", String)
  WORKFLOW_DISPATCH = T.let("WORKFLOW_DISPATCH", String)
  WORKFLOW_RUN = T.let("WORKFLOW_RUN", String)
end
