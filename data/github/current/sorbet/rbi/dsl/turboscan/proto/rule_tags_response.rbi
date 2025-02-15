# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::RuleTagsResponse`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::RuleTagsResponse`.

class Turboscan::Proto::RuleTagsResponse
  sig { params(rule_tags: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))).void }
  def initialize(rule_tags: T.unsafe(nil)); end

  sig { void }
  def clear_rule_tags; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def rule_tags; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def rule_tags=(value); end
end
