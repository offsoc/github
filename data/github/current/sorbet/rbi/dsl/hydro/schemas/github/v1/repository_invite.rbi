# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::RepositoryInvite`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::RepositoryInvite`.

class Hydro::Schemas::Github::V1::RepositoryInvite
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      invitee: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)
    ).void
  end
  def initialize(actor: nil, invitee: nil, repository: nil, request_context: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_invitee; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_request_context; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def invitee; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def invitee=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end
end
