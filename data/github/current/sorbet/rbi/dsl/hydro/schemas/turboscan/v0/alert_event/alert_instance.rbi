# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Turboscan::V0::AlertEvent::AlertInstance`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Turboscan::V0::AlertEvent::AlertInstance`.

class Hydro::Schemas::Turboscan::V0::AlertEvent::AlertInstance
  sig do
    params(
      analysis_key: T.nilable(Hydro::Schemas::Turboscan::V0::AlertEvent::AnalysisKey),
      classification: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      commit_oid: T.nilable(String),
      created_at: T.nilable(Google::Protobuf::Timestamp),
      has_file_classification: T.nilable(T::Boolean),
      is_fixed: T.nilable(T::Boolean),
      is_outdated: T.nilable(T::Boolean),
      location: T.nilable(Hydro::Schemas::Turboscan::V0::AlertEvent::Location),
      message_text: T.nilable(String),
      ref_name_bytes: T.nilable(String)
    ).void
  end
  def initialize(analysis_key: nil, classification: T.unsafe(nil), commit_oid: nil, created_at: nil, has_file_classification: nil, is_fixed: nil, is_outdated: nil, location: nil, message_text: nil, ref_name_bytes: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Turboscan::V0::AlertEvent::AnalysisKey)) }
  def analysis_key; end

  sig { params(value: T.nilable(Hydro::Schemas::Turboscan::V0::AlertEvent::AnalysisKey)).void }
  def analysis_key=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def classification; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def classification=(value); end

  sig { void }
  def clear_analysis_key; end

  sig { void }
  def clear_classification; end

  sig { void }
  def clear_commit_oid; end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_has_file_classification; end

  sig { void }
  def clear_is_fixed; end

  sig { void }
  def clear_is_outdated; end

  sig { void }
  def clear_location; end

  sig { void }
  def clear_message_text; end

  sig { void }
  def clear_ref_name_bytes; end

  sig { returns(String) }
  def commit_oid; end

  sig { params(value: String).void }
  def commit_oid=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(T::Boolean) }
  def has_file_classification; end

  sig { params(value: T::Boolean).void }
  def has_file_classification=(value); end

  sig { returns(T::Boolean) }
  def is_fixed; end

  sig { params(value: T::Boolean).void }
  def is_fixed=(value); end

  sig { returns(T::Boolean) }
  def is_outdated; end

  sig { params(value: T::Boolean).void }
  def is_outdated=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Turboscan::V0::AlertEvent::Location)) }
  def location; end

  sig { params(value: T.nilable(Hydro::Schemas::Turboscan::V0::AlertEvent::Location)).void }
  def location=(value); end

  sig { returns(String) }
  def message_text; end

  sig { params(value: String).void }
  def message_text=(value); end

  sig { returns(String) }
  def ref_name_bytes; end

  sig { params(value: String).void }
  def ref_name_bytes=(value); end
end
