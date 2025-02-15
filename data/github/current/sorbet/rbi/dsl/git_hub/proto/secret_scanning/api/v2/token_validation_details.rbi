# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V2::TokenValidationDetails`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V2::TokenValidationDetails`.

class GitHub::Proto::SecretScanning::Api::V2::TokenValidationDetails
  sig do
    params(
      async_check_requested_at: T.nilable(Google::Protobuf::Timestamp),
      validity_last_checked: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(async_check_requested_at: nil, validity_last_checked: nil); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def async_check_requested_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def async_check_requested_at=(value); end

  sig { void }
  def clear_async_check_requested_at; end

  sig { void }
  def clear_validity_last_checked; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def validity_last_checked; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def validity_last_checked=(value); end
end
