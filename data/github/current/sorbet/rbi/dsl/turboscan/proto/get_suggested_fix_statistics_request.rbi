# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::GetSuggestedFixStatisticsRequest`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::GetSuggestedFixStatisticsRequest`.

class Turboscan::Proto::GetSuggestedFixStatisticsRequest
  sig do
    params(
      end: T.nilable(Google::Protobuf::Timestamp),
      exclude_rule_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      owner_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      repository_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      rule_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      severities: T.nilable(T.any(Google::Protobuf::RepeatedField[T.any(Symbol, Integer)], T::Array[T.any(Symbol, Integer)])),
      start: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(end: nil, exclude_rule_ids: T.unsafe(nil), owner_ids: T.unsafe(nil), repository_ids: T.unsafe(nil), rule_ids: T.unsafe(nil), severities: T.unsafe(nil), start: nil); end

  sig { void }
  def clear_end; end

  sig { void }
  def clear_exclude_rule_ids; end

  sig { void }
  def clear_owner_ids; end

  sig { void }
  def clear_repository_ids; end

  sig { void }
  def clear_rule_ids; end

  sig { void }
  def clear_severities; end

  sig { void }
  def clear_start; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def end; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def end=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def exclude_rule_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def exclude_rule_ids=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def owner_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def owner_ids=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def repository_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def repository_ids=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def rule_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def rule_ids=(value); end

  sig { returns(Google::Protobuf::RepeatedField[T.any(Symbol, Integer)]) }
  def severities; end

  sig { params(value: Google::Protobuf::RepeatedField[T.any(Symbol, Integer)]).void }
  def severities=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def start; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def start=(value); end
end
