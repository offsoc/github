# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::CustomRepositoryRoles::V0::CustomRepositoryRoleDeleted`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::CustomRepositoryRoles::V0::CustomRepositoryRoleDeleted`.

class Hydro::Schemas::Github::CustomRepositoryRoles::V0::CustomRepositoryRoleDeleted
  sig do
    params(
      org_custom_roles_count: T.nilable(Integer),
      role: T.nilable(Hydro::Schemas::Github::V1::Entities::CustomRepositoryRole)
    ).void
  end
  def initialize(org_custom_roles_count: nil, role: nil); end

  sig { void }
  def clear_org_custom_roles_count; end

  sig { void }
  def clear_role; end

  sig { returns(Integer) }
  def org_custom_roles_count; end

  sig { params(value: Integer).void }
  def org_custom_roles_count=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::CustomRepositoryRole)) }
  def role; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::CustomRepositoryRole)).void }
  def role=(value); end
end
