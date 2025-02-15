# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::EnterpriseAccount::V0::EnterpriseRemoveAdmin`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::EnterpriseAccount::V0::EnterpriseRemoveAdmin`.

class Hydro::Schemas::Github::EnterpriseAccount::V0::EnterpriseRemoveAdmin
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      enterprise: T.nilable(Hydro::Schemas::Github::V1::Entities::Business),
      new_role: T.nilable(Google::Protobuf::StringValue),
      reason: T.nilable(Google::Protobuf::StringValue),
      role: T.nilable(Google::Protobuf::StringValue),
      user: T.nilable(Hydro::Schemas::Github::V1::Entities::User)
    ).void
  end
  def initialize(actor: nil, enterprise: nil, new_role: nil, reason: nil, role: nil, user: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_enterprise; end

  sig { void }
  def clear_new_role; end

  sig { void }
  def clear_reason; end

  sig { void }
  def clear_role; end

  sig { void }
  def clear_user; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Business)) }
  def enterprise; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Business)).void }
  def enterprise=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def new_role; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def new_role=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def reason; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def reason=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def role; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def role=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def user; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def user=(value); end
end
