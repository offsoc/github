# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::SecretScanningResultReport`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::SecretScanningResultReport`.

class Hydro::Schemas::Github::V1::SecretScanningResultReport
  sig do
    params(
      blob_summary: T.nilable(Hydro::Schemas::Github::V1::SecretScanningResultReport::BlobSummary),
      ref_updates: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::RefUpdate], T::Array[Hydro::Schemas::Github::V1::SecretScanningResultReport::RefUpdate])),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      service: T.nilable(T.any(Symbol, Integer)),
      token_counts: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::TokenCount], T::Array[Hydro::Schemas::Github::V1::SecretScanningResultReport::TokenCount])),
      unprocessed_token_counts: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::TokenCount], T::Array[Hydro::Schemas::Github::V1::SecretScanningResultReport::TokenCount]))
    ).void
  end
  def initialize(blob_summary: nil, ref_updates: T.unsafe(nil), repository: nil, service: nil, token_counts: T.unsafe(nil), unprocessed_token_counts: T.unsafe(nil)); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::SecretScanningResultReport::BlobSummary)) }
  def blob_summary; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::SecretScanningResultReport::BlobSummary)).void }
  def blob_summary=(value); end

  sig { void }
  def clear_blob_summary; end

  sig { void }
  def clear_ref_updates; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_service; end

  sig { void }
  def clear_token_counts; end

  sig { void }
  def clear_unprocessed_token_counts; end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::RefUpdate]) }
  def ref_updates; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::RefUpdate]
    ).void
  end
  def ref_updates=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def service; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def service=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::TokenCount]) }
  def token_counts; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::TokenCount]
    ).void
  end
  def token_counts=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::TokenCount]) }
  def unprocessed_token_counts; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::SecretScanningResultReport::TokenCount]
    ).void
  end
  def unprocessed_token_counts=(value); end
end
