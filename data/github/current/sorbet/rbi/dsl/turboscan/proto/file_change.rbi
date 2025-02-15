# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::FileChange`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::FileChange`.

class Turboscan::Proto::FileChange
  sig do
    params(
      changes: T.nilable(T.any(Google::Protobuf::RepeatedField[Turboscan::Proto::Change], T::Array[Turboscan::Proto::Change])),
      file_path: T.nilable(String)
    ).void
  end
  def initialize(changes: T.unsafe(nil), file_path: nil); end

  sig { returns(Google::Protobuf::RepeatedField[Turboscan::Proto::Change]) }
  def changes; end

  sig { params(value: Google::Protobuf::RepeatedField[Turboscan::Proto::Change]).void }
  def changes=(value); end

  sig { void }
  def clear_changes; end

  sig { void }
  def clear_file_path; end

  sig { returns(String) }
  def file_path; end

  sig { params(value: String).void }
  def file_path=(value); end
end
