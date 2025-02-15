# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::TrustMetadataApi::V0::CreateAttestationByOwnerRepositoryRequest`.
# Please instead update this file by running `bin/tapioca dsl Proto::TrustMetadataApi::V0::CreateAttestationByOwnerRepositoryRequest`.

class Proto::TrustMetadataApi::V0::CreateAttestationByOwnerRepositoryRequest
  sig do
    params(
      bundle: T.nilable(Sigstore::Bundle::V1::Bundle),
      owner_id: T.nilable(Integer),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(bundle: nil, owner_id: nil, repository_id: nil); end

  sig { returns(T.nilable(Sigstore::Bundle::V1::Bundle)) }
  def bundle; end

  sig { params(value: T.nilable(Sigstore::Bundle::V1::Bundle)).void }
  def bundle=(value); end

  sig { void }
  def clear_bundle; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_repository_id; end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
