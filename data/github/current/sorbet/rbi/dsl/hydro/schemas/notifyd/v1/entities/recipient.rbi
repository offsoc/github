# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Notifyd::V1::Entities::Recipient`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Notifyd::V1::Entities::Recipient`.

class Hydro::Schemas::Notifyd::V1::Entities::Recipient
  sig do
    params(
      reasons: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      user_id: T.nilable(Integer)
    ).void
  end
  def initialize(reasons: T.unsafe(nil), user_id: nil); end

  sig { void }
  def clear_reasons; end

  sig { void }
  def clear_user_id; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def reasons; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def reasons=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end
end
