# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Notifyd::Proto::Subscriptions::GetRequest`.
# Please instead update this file by running `bin/tapioca dsl Notifyd::Proto::Subscriptions::GetRequest`.

class Notifyd::Proto::Subscriptions::GetRequest
  sig do
    params(
      filter_by_custom_fields: T.nilable(T.any(Google::Protobuf::RepeatedField[Notifyd::Proto::Subscriptions::CustomField], T::Array[Notifyd::Proto::Subscriptions::CustomField])),
      page: T.nilable(Notifyd::Proto::Subscriptions::Page),
      user_id: T.nilable(Integer)
    ).void
  end
  def initialize(filter_by_custom_fields: T.unsafe(nil), page: nil, user_id: nil); end

  sig { void }
  def clear_filter_by_custom_fields; end

  sig { void }
  def clear_page; end

  sig { void }
  def clear_user_id; end

  sig { returns(Google::Protobuf::RepeatedField[Notifyd::Proto::Subscriptions::CustomField]) }
  def filter_by_custom_fields; end

  sig { params(value: Google::Protobuf::RepeatedField[Notifyd::Proto::Subscriptions::CustomField]).void }
  def filter_by_custom_fields=(value); end

  sig { returns(T.nilable(Notifyd::Proto::Subscriptions::Page)) }
  def page; end

  sig { params(value: T.nilable(Notifyd::Proto::Subscriptions::Page)).void }
  def page=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end
end
