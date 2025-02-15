# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aleph::Proto::FindReferencesToQualifiedNamesResponse`.
# Please instead update this file by running `bin/tapioca dsl Aleph::Proto::FindReferencesToQualifiedNamesResponse`.

class Aleph::Proto::FindReferencesToQualifiedNamesResponse
  sig do
    params(
      backend: T.nilable(T.any(Symbol, Integer)),
      commit_oid: T.nilable(String),
      references: T.nilable(T.any(Google::Protobuf::RepeatedField[Aleph::Proto::QualifiedNameLocation], T::Array[Aleph::Proto::QualifiedNameLocation])),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(backend: nil, commit_oid: nil, references: T.unsafe(nil), repository_id: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def backend; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def backend=(value); end

  sig { void }
  def clear_backend; end

  sig { void }
  def clear_commit_oid; end

  sig { void }
  def clear_references; end

  sig { void }
  def clear_repository_id; end

  sig { returns(String) }
  def commit_oid; end

  sig { params(value: String).void }
  def commit_oid=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Aleph::Proto::QualifiedNameLocation]) }
  def references; end

  sig { params(value: Google::Protobuf::RepeatedField[Aleph::Proto::QualifiedNameLocation]).void }
  def references=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
