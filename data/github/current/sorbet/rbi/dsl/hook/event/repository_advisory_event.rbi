# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hook::Event::RepositoryAdvisoryEvent`.
# Please instead update this file by running `bin/tapioca dsl Hook::Event::RepositoryAdvisoryEvent`.

class Hook::Event::RepositoryAdvisoryEvent
  sig do
    params(
      action: T.untyped,
      repository_advisory_id: T.untyped,
      actor_id: T.untyped,
      business_id: T.untyped,
      delivered_hook_ids: T.untyped,
      enterprise: T.untyped,
      event_guid: T.untyped,
      installation: T.untyped,
      organization_id: T.untyped,
      primary_resource: T.untyped,
      primary_resource_data: T.untyped,
      repository_id: T.untyped,
      triggered_at: T.untyped
    ).void
  end
  def initialize(action:, repository_advisory_id:, actor_id: nil, business_id: nil, delivered_hook_ids: nil, enterprise: nil, event_guid: nil, installation: nil, organization_id: nil, primary_resource: nil, primary_resource_data: nil, repository_id: nil, triggered_at: nil); end

  sig { returns(T.untyped) }
  def action; end

  sig { params(value: T.untyped).void }
  def action=(value); end

  sig { returns(T.untyped) }
  def business_id; end

  sig { returns(T.untyped) }
  def repository_advisory_id; end

  sig { params(value: T.untyped).void }
  def business_id=(value); end

  sig { params(value: T.untyped).void }
  def event_guid=(value); end

  sig { params(value: T.untyped).void }
  def repository_advisory_id=(value); end

  sig { returns(T.untyped) }
  def actor_id; end

  sig { params(value: T.untyped).void }
  def actor_id=(value); end

  sig { returns(T.untyped) }
  def delivered_hook_ids; end

  sig { params(value: T.untyped).void }
  def delivered_hook_ids=(value); end

  sig { returns(T.untyped) }
  def enterprise; end

  sig { params(value: T.untyped).void }
  def enterprise=(value); end

  sig { returns(T.untyped) }
  def event_guid; end

  sig { returns(T.untyped) }
  def installation; end

  sig { params(value: T.untyped).void }
  def installation=(value); end

  sig { returns(T.untyped) }
  def organization_id; end

  sig { params(value: T.untyped).void }
  def organization_id=(value); end

  sig { returns(T.untyped) }
  def primary_resource; end

  sig { params(value: T.untyped).void }
  def primary_resource=(value); end

  sig { returns(T.untyped) }
  def primary_resource_data; end

  sig { params(value: T.untyped).void }
  def primary_resource_data=(value); end

  sig { returns(T.untyped) }
  def repository_id; end

  sig { params(value: T.untyped).void }
  def repository_id=(value); end

  sig { returns(T.untyped) }
  def triggered_at; end

  sig { params(value: T.untyped).void }
  def triggered_at=(value); end

  class << self
    sig do
      params(
        action: T.untyped,
        repository_advisory_id: T.untyped,
        actor_id: T.untyped,
        business_id: T.untyped,
        delivered_hook_ids: T.untyped,
        enterprise: T.untyped,
        event_guid: T.untyped,
        installation: T.untyped,
        organization_id: T.untyped,
        primary_resource: T.untyped,
        primary_resource_data: T.untyped,
        repository_id: T.untyped,
        triggered_at: T.untyped
      ).returns(T::Boolean)
    end
    def queue(action:, repository_advisory_id:, actor_id: nil, business_id: nil, delivered_hook_ids: nil, enterprise: nil, event_guid: nil, installation: nil, organization_id: nil, primary_resource: nil, primary_resource_data: nil, repository_id: nil, triggered_at: nil); end
  end
end
