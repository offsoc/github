# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Google::Protobuf::GeneratedCodeInfo::Annotation`.
# Please instead update this file by running `bin/tapioca dsl Google::Protobuf::GeneratedCodeInfo::Annotation`.

class Google::Protobuf::GeneratedCodeInfo::Annotation
  sig do
    params(
      begin: T.nilable(Integer),
      end: T.nilable(Integer),
      path: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      semantic: T.nilable(T.any(Symbol, Integer)),
      source_file: T.nilable(String)
    ).void
  end
  def initialize(begin: nil, end: nil, path: T.unsafe(nil), semantic: nil, source_file: nil); end

  sig { returns(Integer) }
  def begin; end

  sig { params(value: Integer).void }
  def begin=(value); end

  sig { void }
  def clear_begin; end

  sig { void }
  def clear_end; end

  sig { void }
  def clear_path; end

  sig { void }
  def clear_semantic; end

  sig { void }
  def clear_source_file; end

  sig { returns(Integer) }
  def end; end

  sig { params(value: Integer).void }
  def end=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def path; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def path=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def semantic; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def semantic=(value); end

  sig { returns(String) }
  def source_file; end

  sig { params(value: String).void }
  def source_file=(value); end
end
