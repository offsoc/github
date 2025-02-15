# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::CheckWorkflowsPolicyRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::CheckWorkflowsPolicyRequest`.

class MonolithTwirp::Actions::Core::V1::CheckWorkflowsPolicyRequest
  sig do
    params(
      repository_id: T.nilable(MonolithTwirp::Actions::Core::V1::Identity),
      should_ignore_repo_policies: T.nilable(T::Boolean),
      workflows: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))
    ).void
  end
  def initialize(repository_id: nil, should_ignore_repo_policies: nil, workflows: T.unsafe(nil)); end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_should_ignore_repo_policies; end

  sig { void }
  def clear_workflows; end

  sig { returns(T.nilable(MonolithTwirp::Actions::Core::V1::Identity)) }
  def repository_id; end

  sig { params(value: T.nilable(MonolithTwirp::Actions::Core::V1::Identity)).void }
  def repository_id=(value); end

  sig { returns(T::Boolean) }
  def should_ignore_repo_policies; end

  sig { params(value: T::Boolean).void }
  def should_ignore_repo_policies=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def workflows; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def workflows=(value); end
end
