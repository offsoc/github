# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Credz::RepositoryWithOwner`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Credz::RepositoryWithOwner`.

class GitHub::Launch::Services::Credz::RepositoryWithOwner
  sig do
    params(
      owner: T.nilable(GitHub::Launch::Services::Credz::CredentialOwner),
      repository: T.nilable(GitHub::Launch::Services::Credz::Repository)
    ).void
  end
  def initialize(owner: nil, repository: nil); end

  sig { void }
  def clear_owner; end

  sig { void }
  def clear_repository; end

  sig { returns(T.nilable(GitHub::Launch::Services::Credz::CredentialOwner)) }
  def owner; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Credz::CredentialOwner)).void }
  def owner=(value); end

  sig { returns(T.nilable(GitHub::Launch::Services::Credz::Repository)) }
  def repository; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Credz::Repository)).void }
  def repository=(value); end
end
