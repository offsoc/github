# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::InProgressJobsResponse`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::InProgressJobsResponse`.

class Aqueduct::Api::V1::InProgressJobsResponse
  sig do
    params(
      error: T.nilable(String),
      in_progress: T.nilable(T.any(Google::Protobuf::RepeatedField[Aqueduct::Api::V1::InProgressJobsResponse::Job], T::Array[Aqueduct::Api::V1::InProgressJobsResponse::Job]))
    ).void
  end
  def initialize(error: nil, in_progress: T.unsafe(nil)); end

  sig { void }
  def clear_error; end

  sig { void }
  def clear_in_progress; end

  sig { returns(String) }
  def error; end

  sig { params(value: String).void }
  def error=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Aqueduct::Api::V1::InProgressJobsResponse::Job]) }
  def in_progress; end

  sig { params(value: Google::Protobuf::RepeatedField[Aqueduct::Api::V1::InProgressJobsResponse::Job]).void }
  def in_progress=(value); end
end
