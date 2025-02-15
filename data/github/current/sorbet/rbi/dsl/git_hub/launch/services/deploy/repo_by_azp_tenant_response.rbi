# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Deploy::RepoByAZPTenantResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Deploy::RepoByAZPTenantResponse`.

class GitHub::Launch::Services::Deploy::RepoByAZPTenantResponse
  sig { params(env: T.nilable(String), nwo: T.nilable(String), repository_id: T.nilable(String)).void }
  def initialize(env: nil, nwo: nil, repository_id: nil); end

  sig { void }
  def clear_env; end

  sig { void }
  def clear_nwo; end

  sig { void }
  def clear_repository_id; end

  sig { returns(String) }
  def env; end

  sig { params(value: String).void }
  def env=(value); end

  sig { returns(String) }
  def nwo; end

  sig { params(value: String).void }
  def nwo=(value); end

  sig { returns(String) }
  def repository_id; end

  sig { params(value: String).void }
  def repository_id=(value); end
end
