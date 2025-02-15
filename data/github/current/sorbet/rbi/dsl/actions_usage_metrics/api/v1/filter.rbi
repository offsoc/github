# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `ActionsUsageMetrics::Api::V1::Filter`.
# Please instead update this file by running `bin/tapioca dsl ActionsUsageMetrics::Api::V1::Filter`.

class ActionsUsageMetrics::Api::V1::Filter
  sig do
    params(
      key: T.nilable(String),
      operator: T.nilable(T.any(Symbol, Integer)),
      values: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))
    ).void
  end
  def initialize(key: nil, operator: nil, values: T.unsafe(nil)); end

  sig { void }
  def clear_key; end

  sig { void }
  def clear_operator; end

  sig { void }
  def clear_values; end

  sig { returns(String) }
  def key; end

  sig { params(value: String).void }
  def key=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def operator; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def operator=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def values; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def values=(value); end
end
