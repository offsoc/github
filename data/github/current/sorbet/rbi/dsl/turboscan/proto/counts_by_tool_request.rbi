# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::CountsByToolRequest`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::CountsByToolRequest`.

class Turboscan::Proto::CountsByToolRequest
  sig do
    params(
      ref_names_bytes: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(ref_names_bytes: T.unsafe(nil), repository_id: nil); end

  sig { void }
  def clear_ref_names_bytes; end

  sig { void }
  def clear_repository_id; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def ref_names_bytes; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def ref_names_bytes=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
