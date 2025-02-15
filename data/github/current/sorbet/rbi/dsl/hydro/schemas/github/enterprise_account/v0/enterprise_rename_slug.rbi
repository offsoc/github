# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::EnterpriseAccount::V0::EnterpriseRenameSlug`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::EnterpriseAccount::V0::EnterpriseRenameSlug`.

class Hydro::Schemas::Github::EnterpriseAccount::V0::EnterpriseRenameSlug
  sig do
    params(
      enterprise: T.nilable(Hydro::Schemas::Github::V1::Entities::Business),
      slug: T.nilable(String),
      slug_was: T.nilable(String)
    ).void
  end
  def initialize(enterprise: nil, slug: nil, slug_was: nil); end

  sig { void }
  def clear_enterprise; end

  sig { void }
  def clear_slug; end

  sig { void }
  def clear_slug_was; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Business)) }
  def enterprise; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Business)).void }
  def enterprise=(value); end

  sig { returns(String) }
  def slug; end

  sig { params(value: String).void }
  def slug=(value); end

  sig { returns(String) }
  def slug_was; end

  sig { params(value: String).void }
  def slug_was=(value); end
end
