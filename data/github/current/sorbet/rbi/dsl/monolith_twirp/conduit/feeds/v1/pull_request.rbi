# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Conduit::Feeds::V1::PullRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Conduit::Feeds::V1::PullRequest`.

class MonolithTwirp::Conduit::Feeds::V1::PullRequest
  sig do
    params(
      actor_id: T.nilable(Integer),
      id: T.nilable(Integer),
      repository_id: T.nilable(Integer),
      repository_owner_id: T.nilable(Integer)
    ).void
  end
  def initialize(actor_id: nil, id: nil, repository_id: nil, repository_owner_id: nil); end

  sig { returns(Integer) }
  def actor_id; end

  sig { params(value: Integer).void }
  def actor_id=(value); end

  sig { void }
  def clear_actor_id; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_repository_owner_id; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end

  sig { returns(Integer) }
  def repository_owner_id; end

  sig { params(value: Integer).void }
  def repository_owner_id=(value); end
end
