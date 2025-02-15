# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::RepositoryEnabled`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::RepositoryEnabled`.

class Hydro::Schemas::Github::V1::RepositoryEnabled
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      enabled_at: T.nilable(Google::Protobuf::Timestamp),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)
    ).void
  end
  def initialize(actor: nil, enabled_at: nil, repository: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_enabled_at; end

  sig { void }
  def clear_repository; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def enabled_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def enabled_at=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end
end
