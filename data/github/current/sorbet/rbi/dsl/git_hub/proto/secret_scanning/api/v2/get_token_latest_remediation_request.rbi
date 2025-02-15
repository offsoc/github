# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V2::GetTokenLatestRemediationRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V2::GetTokenLatestRemediationRequest`.

class GitHub::Proto::SecretScanning::Api::V2::GetTokenLatestRemediationRequest
  sig do
    params(
      numbers: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(numbers: T.unsafe(nil), repository_id: nil); end

  sig { void }
  def clear_numbers; end

  sig { void }
  def clear_repository_id; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def numbers; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def numbers=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
