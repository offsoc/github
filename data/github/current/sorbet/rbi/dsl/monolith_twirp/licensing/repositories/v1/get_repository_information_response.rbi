# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Licensing::Repositories::V1::GetRepositoryInformationResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Licensing::Repositories::V1::GetRepositoryInformationResponse`.

class MonolithTwirp::Licensing::Repositories::V1::GetRepositoryInformationResponse
  sig do
    params(
      collaborator_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      repository: T.nilable(MonolithTwirp::Licensing::Repositories::V1::Repository)
    ).void
  end
  def initialize(collaborator_ids: T.unsafe(nil), repository: nil); end

  sig { void }
  def clear_collaborator_ids; end

  sig { void }
  def clear_repository; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def collaborator_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def collaborator_ids=(value); end

  sig { returns(T.nilable(MonolithTwirp::Licensing::Repositories::V1::Repository)) }
  def repository; end

  sig { params(value: T.nilable(MonolithTwirp::Licensing::Repositories::V1::Repository)).void }
  def repository=(value); end
end
