# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::TrustMetadataApi::V0::ListAttestationsBySubjectDigestResponse`.
# Please instead update this file by running `bin/tapioca dsl Proto::TrustMetadataApi::V0::ListAttestationsBySubjectDigestResponse`.

class Proto::TrustMetadataApi::V0::ListAttestationsBySubjectDigestResponse
  sig do
    params(
      attestations: T.nilable(T.any(Google::Protobuf::RepeatedField[Proto::TrustMetadataApi::V0::ArtifactAttestation], T::Array[Proto::TrustMetadataApi::V0::ArtifactAttestation])),
      owner_id: T.nilable(Integer),
      page_info: T.nilable(Proto::TrustMetadataApi::V0::PageInfo),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(attestations: T.unsafe(nil), owner_id: nil, page_info: nil, repository_id: nil); end

  sig { returns(Google::Protobuf::RepeatedField[Proto::TrustMetadataApi::V0::ArtifactAttestation]) }
  def attestations; end

  sig { params(value: Google::Protobuf::RepeatedField[Proto::TrustMetadataApi::V0::ArtifactAttestation]).void }
  def attestations=(value); end

  sig { void }
  def clear_attestations; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_page_info; end

  sig { void }
  def clear_repository_id; end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(T.nilable(Proto::TrustMetadataApi::V0::PageInfo)) }
  def page_info; end

  sig { params(value: T.nilable(Proto::TrustMetadataApi::V0::PageInfo)).void }
  def page_info=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
