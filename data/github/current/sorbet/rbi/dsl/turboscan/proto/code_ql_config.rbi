# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::CodeQLConfig`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::CodeQLConfig`.

class Turboscan::Proto::CodeQLConfig
  sig do
    params(
      initial_languages: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      languages: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      query_suite: T.nilable(T.any(Symbol, Integer)),
      threat_model: T.nilable(T.any(Symbol, Integer)),
      trigger: T.nilable(T.any(Symbol, Integer)),
      updated_at: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(initial_languages: T.unsafe(nil), languages: T.unsafe(nil), query_suite: nil, threat_model: nil, trigger: nil, updated_at: nil); end

  sig { void }
  def clear_initial_languages; end

  sig { void }
  def clear_languages; end

  sig { void }
  def clear_query_suite; end

  sig { void }
  def clear_threat_model; end

  sig { void }
  def clear_trigger; end

  sig { void }
  def clear_updated_at; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def initial_languages; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def initial_languages=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def languages; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def languages=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def query_suite; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def query_suite=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def threat_model; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def threat_model=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def trigger; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def trigger=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def updated_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def updated_at=(value); end
end
