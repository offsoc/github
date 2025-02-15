# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Credz::ListSecretsForRepositoryResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Credz::ListSecretsForRepositoryResponse`.

class GitHub::Launch::Services::Credz::ListSecretsForRepositoryResponse
  sig do
    params(
      environment_secrets: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential], T::Array[GitHub::Launch::Services::Credz::Credential])),
      error: T.nilable(GitHub::Launch::Services::Credz::Error),
      organization_secrets: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential], T::Array[GitHub::Launch::Services::Credz::Credential])),
      repository_secrets: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential], T::Array[GitHub::Launch::Services::Credz::Credential]))
    ).void
  end
  def initialize(environment_secrets: T.unsafe(nil), error: nil, organization_secrets: T.unsafe(nil), repository_secrets: T.unsafe(nil)); end

  sig { void }
  def clear_environment_secrets; end

  sig { void }
  def clear_error; end

  sig { void }
  def clear_organization_secrets; end

  sig { void }
  def clear_repository_secrets; end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential]) }
  def environment_secrets; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential]).void }
  def environment_secrets=(value); end

  sig { returns(T.nilable(GitHub::Launch::Services::Credz::Error)) }
  def error; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Credz::Error)).void }
  def error=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential]) }
  def organization_secrets; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential]).void }
  def organization_secrets=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential]) }
  def repository_secrets; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Launch::Services::Credz::Credential]).void }
  def repository_secrets=(value); end
end
