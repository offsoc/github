# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Credz::DeleteRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Credz::DeleteRequest`.

class GitHub::Launch::Services::Credz::DeleteRequest
  sig do
    params(
      credential: T.nilable(GitHub::Launch::Services::Credz::Credential),
      repository: T.nilable(GitHub::Launch::Services::Credz::Repository)
    ).void
  end
  def initialize(credential: nil, repository: nil); end

  sig { void }
  def clear_credential; end

  sig { void }
  def clear_repository; end

  sig { returns(T.nilable(GitHub::Launch::Services::Credz::Credential)) }
  def credential; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Credz::Credential)).void }
  def credential=(value); end

  sig { returns(T.nilable(GitHub::Launch::Services::Credz::Repository)) }
  def repository; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Credz::Repository)).void }
  def repository=(value); end
end
