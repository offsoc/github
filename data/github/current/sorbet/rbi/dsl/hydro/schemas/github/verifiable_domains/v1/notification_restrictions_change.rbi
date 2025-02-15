# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::VerifiableDomains::V1::NotificationRestrictionsChange`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::VerifiableDomains::V1::NotificationRestrictionsChange`.

class Hydro::Schemas::Github::VerifiableDomains::V1::NotificationRestrictionsChange
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      affected_users_count: T.nilable(Google::Protobuf::UInt32Value),
      domains: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      owner_id: T.nilable(Integer),
      owner_type: T.nilable(T.any(Symbol, Integer)),
      status_type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(actor: nil, affected_users_count: nil, domains: T.unsafe(nil), owner_id: nil, owner_type: nil, status_type: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(T.nilable(Google::Protobuf::UInt32Value)) }
  def affected_users_count; end

  sig { params(value: T.nilable(Google::Protobuf::UInt32Value)).void }
  def affected_users_count=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_affected_users_count; end

  sig { void }
  def clear_domains; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_owner_type; end

  sig { void }
  def clear_status_type; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def domains; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def domains=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def owner_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def owner_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def status_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def status_type=(value); end
end
