# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboghas::Proto::GetMeterEmissionsResponse`.
# Please instead update this file by running `bin/tapioca dsl Turboghas::Proto::GetMeterEmissionsResponse`.

class Turboghas::Proto::GetMeterEmissionsResponse
  sig do
    params(
      added: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      removed: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))
    ).void
  end
  def initialize(added: T.unsafe(nil), removed: T.unsafe(nil)); end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def added; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def added=(value); end

  sig { void }
  def clear_added; end

  sig { void }
  def clear_removed; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def removed; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def removed=(value); end
end
