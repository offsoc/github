# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::CheckAnnotation`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::CheckAnnotation`.

class Hydro::Schemas::Github::V1::Entities::CheckAnnotation
  sig do
    params(
      annotation_level: T.nilable(String),
      check_run_id: T.nilable(Integer),
      created_at: T.nilable(Google::Protobuf::Timestamp),
      end_column: T.nilable(Integer),
      end_line: T.nilable(Integer),
      global_relay_id: T.nilable(String),
      id: T.nilable(Integer),
      message: T.nilable(String),
      path: T.nilable(String),
      raw_details: T.nilable(String),
      start_column: T.nilable(Integer),
      start_line: T.nilable(Integer),
      suggested_change: T.nilable(String),
      title: T.nilable(String),
      updated_at: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(annotation_level: nil, check_run_id: nil, created_at: nil, end_column: nil, end_line: nil, global_relay_id: nil, id: nil, message: nil, path: nil, raw_details: nil, start_column: nil, start_line: nil, suggested_change: nil, title: nil, updated_at: nil); end

  sig { returns(String) }
  def annotation_level; end

  sig { params(value: String).void }
  def annotation_level=(value); end

  sig { returns(Integer) }
  def check_run_id; end

  sig { params(value: Integer).void }
  def check_run_id=(value); end

  sig { void }
  def clear_annotation_level; end

  sig { void }
  def clear_check_run_id; end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_end_column; end

  sig { void }
  def clear_end_line; end

  sig { void }
  def clear_global_relay_id; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_message; end

  sig { void }
  def clear_path; end

  sig { void }
  def clear_raw_details; end

  sig { void }
  def clear_start_column; end

  sig { void }
  def clear_start_line; end

  sig { void }
  def clear_suggested_change; end

  sig { void }
  def clear_title; end

  sig { void }
  def clear_updated_at; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(Integer) }
  def end_column; end

  sig { params(value: Integer).void }
  def end_column=(value); end

  sig { returns(Integer) }
  def end_line; end

  sig { params(value: Integer).void }
  def end_line=(value); end

  sig { returns(String) }
  def global_relay_id; end

  sig { params(value: String).void }
  def global_relay_id=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(String) }
  def message; end

  sig { params(value: String).void }
  def message=(value); end

  sig { returns(String) }
  def path; end

  sig { params(value: String).void }
  def path=(value); end

  sig { returns(String) }
  def raw_details; end

  sig { params(value: String).void }
  def raw_details=(value); end

  sig { returns(Integer) }
  def start_column; end

  sig { params(value: Integer).void }
  def start_column=(value); end

  sig { returns(Integer) }
  def start_line; end

  sig { params(value: Integer).void }
  def start_line=(value); end

  sig { returns(String) }
  def suggested_change; end

  sig { params(value: String).void }
  def suggested_change=(value); end

  sig { returns(String) }
  def title; end

  sig { params(value: String).void }
  def title=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def updated_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def updated_at=(value); end
end
