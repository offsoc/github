# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aleph::Proto::SymbolInformation`.
# Please instead update this file by running `bin/tapioca dsl Aleph::Proto::SymbolInformation`.

class Aleph::Proto::SymbolInformation
  sig do
    params(
      definition: T.nilable(Aleph::Proto::DefinitionInformation),
      fully_qualified_names: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      location: T.nilable(Aleph::Proto::Location),
      reference: T.nilable(Aleph::Proto::ReferenceInformation),
      search_keys: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))
    ).void
  end
  def initialize(definition: nil, fully_qualified_names: T.unsafe(nil), location: nil, reference: nil, search_keys: T.unsafe(nil)); end

  sig { void }
  def clear_definition; end

  sig { void }
  def clear_fully_qualified_names; end

  sig { void }
  def clear_location; end

  sig { void }
  def clear_reference; end

  sig { void }
  def clear_search_keys; end

  sig { returns(T.nilable(Aleph::Proto::DefinitionInformation)) }
  def definition; end

  sig { params(value: T.nilable(Aleph::Proto::DefinitionInformation)).void }
  def definition=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def fully_qualified_names; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def fully_qualified_names=(value); end

  sig { returns(T.nilable(Aleph::Proto::Location)) }
  def location; end

  sig { params(value: T.nilable(Aleph::Proto::Location)).void }
  def location=(value); end

  sig { returns(T.nilable(Aleph::Proto::ReferenceInformation)) }
  def reference; end

  sig { params(value: T.nilable(Aleph::Proto::ReferenceInformation)).void }
  def reference=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def search_keys; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def search_keys=(value); end
end
