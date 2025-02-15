# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Deploy::WorkflowCancelAllRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Deploy::WorkflowCancelAllRequest`.

class GitHub::Launch::Services::Deploy::WorkflowCancelAllRequest
  sig do
    params(
      event_type: T.nilable(String),
      name: T.nilable(String),
      owner: T.nilable(String),
      repository_id: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)
    ).void
  end
  def initialize(event_type: nil, name: nil, owner: nil, repository_id: nil); end

  sig { void }
  def clear_event_type; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_owner; end

  sig { void }
  def clear_repository_id; end

  sig { returns(String) }
  def event_type; end

  sig { params(value: String).void }
  def event_type=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def owner; end

  sig { params(value: String).void }
  def owner=(value); end

  sig { returns(T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)) }
  def repository_id; end

  sig { params(value: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def repository_id=(value); end
end
