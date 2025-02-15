# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::References::V1::UpdateResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::References::V1::UpdateResponse`.

class GitHub::Spokes::Proto::References::V1::UpdateResponse
  sig do
    params(
      checksum: T.nilable(String),
      committed_at: T.nilable(Integer),
      error_message: T.nilable(String),
      error_reason: T.nilable(T.any(Symbol, Integer)),
      refs_status: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::References::V1::RefStatus], T::Array[GitHub::Spokes::Proto::References::V1::RefStatus]))
    ).void
  end
  def initialize(checksum: nil, committed_at: nil, error_message: nil, error_reason: nil, refs_status: T.unsafe(nil)); end

  sig { returns(String) }
  def checksum; end

  sig { params(value: String).void }
  def checksum=(value); end

  sig { void }
  def clear_checksum; end

  sig { void }
  def clear_committed_at; end

  sig { void }
  def clear_error_message; end

  sig { void }
  def clear_error_reason; end

  sig { void }
  def clear_refs_status; end

  sig { returns(Integer) }
  def committed_at; end

  sig { params(value: Integer).void }
  def committed_at=(value); end

  sig { returns(String) }
  def error_message; end

  sig { params(value: String).void }
  def error_message=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def error_reason; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def error_reason=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::References::V1::RefStatus]) }
  def refs_status; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::References::V1::RefStatus]).void }
  def refs_status=(value); end
end
