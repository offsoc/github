# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V2::TimelineSegment`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V2::TimelineSegment`.

class GitHub::Proto::SecretScanning::Api::V2::TimelineSegment
  sig do
    params(
      cursor: T.nilable(String),
      events: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Api::V2::TimelineEvent], T::Array[GitHub::Proto::SecretScanning::Api::V2::TimelineEvent]))
    ).void
  end
  def initialize(cursor: nil, events: T.unsafe(nil)); end

  sig { void }
  def clear_cursor; end

  sig { void }
  def clear_events; end

  sig { returns(String) }
  def cursor; end

  sig { params(value: String).void }
  def cursor=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Api::V2::TimelineEvent]) }
  def events; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Api::V2::TimelineEvent]).void }
  def events=(value); end
end
