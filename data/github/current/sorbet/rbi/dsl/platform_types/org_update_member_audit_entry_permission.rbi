# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::OrgUpdateMemberAuditEntryPermission`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::OrgUpdateMemberAuditEntryPermission`.

module PlatformTypes::OrgUpdateMemberAuditEntryPermission
  sig { returns(T::Boolean) }
  def admin?; end

  sig { returns(T::Boolean) }
  def read?; end

  ADMIN = T.let("ADMIN", String)
  READ = T.let("READ", String)
end
