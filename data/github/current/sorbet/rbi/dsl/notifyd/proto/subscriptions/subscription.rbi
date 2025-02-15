# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Notifyd::Proto::Subscriptions::Subscription`.
# Please instead update this file by running `bin/tapioca dsl Notifyd::Proto::Subscriptions::Subscription`.

class Notifyd::Proto::Subscriptions::Subscription
  sig do
    params(
      created_at: T.nilable(Integer),
      custom_fields: T.nilable(T.any(Google::Protobuf::RepeatedField[Notifyd::Proto::Subscriptions::CustomField], T::Array[Notifyd::Proto::Subscriptions::CustomField])),
      id: T.nilable(Integer),
      reason: T.nilable(String),
      user_id: T.nilable(Integer)
    ).void
  end
  def initialize(created_at: nil, custom_fields: T.unsafe(nil), id: nil, reason: nil, user_id: nil); end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_custom_fields; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_reason; end

  sig { void }
  def clear_user_id; end

  sig { returns(Integer) }
  def created_at; end

  sig { params(value: Integer).void }
  def created_at=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Notifyd::Proto::Subscriptions::CustomField]) }
  def custom_fields; end

  sig { params(value: Google::Protobuf::RepeatedField[Notifyd::Proto::Subscriptions::CustomField]).void }
  def custom_fields=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(String) }
  def reason; end

  sig { params(value: String).void }
  def reason=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end
end
