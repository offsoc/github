# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Authzd::Proto::Request`.
# Please instead update this file by running `bin/tapioca dsl Authzd::Proto::Request`.

class Authzd::Proto::Request
  sig do
    params(
      attributes: T.nilable(T.any(Google::Protobuf::RepeatedField[Authzd::Proto::Attribute], T::Array[Authzd::Proto::Attribute]))
    ).void
  end
  def initialize(attributes: T.unsafe(nil)); end

  sig { returns(Google::Protobuf::RepeatedField[Authzd::Proto::Attribute]) }
  def attributes; end

  sig { params(value: Google::Protobuf::RepeatedField[Authzd::Proto::Attribute]).void }
  def attributes=(value); end

  sig { void }
  def clear_attributes; end
end
