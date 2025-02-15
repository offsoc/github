# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::UserStatus`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::UserStatus`.

class Hydro::Schemas::Github::V1::Entities::UserStatus
  sig do
    params(
      created_at: T.nilable(Google::Protobuf::Timestamp),
      emoji: T.nilable(String),
      expires_at: T.nilable(Google::Protobuf::Timestamp),
      id: T.nilable(Integer),
      limited_availability: T.nilable(T::Boolean),
      message: T.nilable(String),
      organization_id: T.nilable(Integer),
      updated_at: T.nilable(Google::Protobuf::Timestamp),
      user_id: T.nilable(Integer)
    ).void
  end
  def initialize(created_at: nil, emoji: nil, expires_at: nil, id: nil, limited_availability: nil, message: nil, organization_id: nil, updated_at: nil, user_id: nil); end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_emoji; end

  sig { void }
  def clear_expires_at; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_limited_availability; end

  sig { void }
  def clear_message; end

  sig { void }
  def clear_organization_id; end

  sig { void }
  def clear_updated_at; end

  sig { void }
  def clear_user_id; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(String) }
  def emoji; end

  sig { params(value: String).void }
  def emoji=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def expires_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def expires_at=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T::Boolean) }
  def limited_availability; end

  sig { params(value: T::Boolean).void }
  def limited_availability=(value); end

  sig { returns(String) }
  def message; end

  sig { params(value: String).void }
  def message=(value); end

  sig { returns(Integer) }
  def organization_id; end

  sig { params(value: Integer).void }
  def organization_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def updated_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def updated_at=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end
end
