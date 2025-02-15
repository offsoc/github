# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Notifyd::V1::DeliverWeb`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Notifyd::V1::DeliverWeb`.

class Hydro::Schemas::Notifyd::V1::DeliverWeb
  sig do
    params(
      notification_id: T.nilable(String),
      recipients: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Notifyd::V1::Entities::Recipient], T::Array[Hydro::Schemas::Notifyd::V1::Entities::Recipient])),
      retries: T.nilable(Hydro::Schemas::Notifyd::V0::Entities::Retries),
      subject_id: T.nilable(Integer),
      subject_type: T.nilable(String),
      tracking: T.nilable(Hydro::Schemas::Notifyd::V0::Entities::Tracking)
    ).void
  end
  def initialize(notification_id: nil, recipients: T.unsafe(nil), retries: nil, subject_id: nil, subject_type: nil, tracking: nil); end

  sig { void }
  def clear_notification_id; end

  sig { void }
  def clear_recipients; end

  sig { void }
  def clear_retries; end

  sig { void }
  def clear_subject_id; end

  sig { void }
  def clear_subject_type; end

  sig { void }
  def clear_tracking; end

  sig { returns(String) }
  def notification_id; end

  sig { params(value: String).void }
  def notification_id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Notifyd::V1::Entities::Recipient]) }
  def recipients; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Notifyd::V1::Entities::Recipient]).void }
  def recipients=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Notifyd::V0::Entities::Retries)) }
  def retries; end

  sig { params(value: T.nilable(Hydro::Schemas::Notifyd::V0::Entities::Retries)).void }
  def retries=(value); end

  sig { returns(Integer) }
  def subject_id; end

  sig { params(value: Integer).void }
  def subject_id=(value); end

  sig { returns(String) }
  def subject_type; end

  sig { params(value: String).void }
  def subject_type=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Notifyd::V0::Entities::Tracking)) }
  def tracking; end

  sig { params(value: T.nilable(Hydro::Schemas::Notifyd::V0::Entities::Tracking)).void }
  def tracking=(value); end
end
