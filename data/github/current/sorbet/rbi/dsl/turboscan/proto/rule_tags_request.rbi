# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::RuleTagsRequest`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::RuleTagsRequest`.

class Turboscan::Proto::RuleTagsRequest
  sig do
    params(
      repository_id: T.nilable(Integer),
      tools: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))
    ).void
  end
  def initialize(repository_id: nil, tools: T.unsafe(nil)); end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_tools; end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def tools; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def tools=(value); end
end
