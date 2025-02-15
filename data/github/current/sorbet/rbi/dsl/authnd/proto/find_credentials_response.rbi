# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Authnd::Proto::FindCredentialsResponse`.
# Please instead update this file by running `bin/tapioca dsl Authnd::Proto::FindCredentialsResponse`.

class Authnd::Proto::FindCredentialsResponse
  sig do
    params(
      credentials: T.nilable(T.any(Google::Protobuf::RepeatedField[Authnd::Proto::AttributeList], T::Array[Authnd::Proto::AttributeList])),
      error: T.nilable(String),
      result: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(credentials: T.unsafe(nil), error: nil, result: nil); end

  sig { void }
  def clear_credentials; end

  sig { void }
  def clear_error; end

  sig { void }
  def clear_result; end

  sig { returns(Google::Protobuf::RepeatedField[Authnd::Proto::AttributeList]) }
  def credentials; end

  sig { params(value: Google::Protobuf::RepeatedField[Authnd::Proto::AttributeList]).void }
  def credentials=(value); end

  sig { returns(String) }
  def error; end

  sig { params(value: String).void }
  def error=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def result; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def result=(value); end
end
