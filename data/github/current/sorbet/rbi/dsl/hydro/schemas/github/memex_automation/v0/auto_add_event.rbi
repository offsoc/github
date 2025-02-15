# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::MemexAutomation::V0::AutoAddEvent`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::MemexAutomation::V0::AutoAddEvent`.

class Hydro::Schemas::Github::MemexAutomation::V0::AutoAddEvent
  sig do
    params(
      actor_id: T.nilable(Integer),
      issue_id: T.nilable(Integer),
      pull_request_id: T.nilable(Integer),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(actor_id: nil, issue_id: nil, pull_request_id: nil, repository_id: nil); end

  sig { returns(Integer) }
  def actor_id; end

  sig { params(value: Integer).void }
  def actor_id=(value); end

  sig { void }
  def clear_actor_id; end

  sig { void }
  def clear_issue_id; end

  sig { void }
  def clear_pull_request_id; end

  sig { void }
  def clear_repository_id; end

  sig { returns(Integer) }
  def issue_id; end

  sig { params(value: Integer).void }
  def issue_id=(value); end

  sig { returns(Integer) }
  def pull_request_id; end

  sig { params(value: Integer).void }
  def pull_request_id=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
