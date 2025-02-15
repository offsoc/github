# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Deploy::RepoByAZPTenantRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Deploy::RepoByAZPTenantRequest`.

class GitHub::Launch::Services::Deploy::RepoByAZPTenantRequest
  sig { params(name: T.nilable(String)).void }
  def initialize(name: nil); end

  sig { void }
  def clear_name; end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end
end
