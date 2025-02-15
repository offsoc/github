# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V2::TokenLocationIdsSelector`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V2::TokenLocationIdsSelector`.

class GitHub::Proto::SecretScanning::Api::V2::TokenLocationIdsSelector
  sig { params(location_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))).void }
  def initialize(location_ids: T.unsafe(nil)); end

  sig { void }
  def clear_location_ids; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def location_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def location_ids=(value); end
end
