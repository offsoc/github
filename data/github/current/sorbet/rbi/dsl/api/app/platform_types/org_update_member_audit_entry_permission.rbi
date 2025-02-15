# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::OrgUpdateMemberAuditEntryPermission`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::OrgUpdateMemberAuditEntryPermission`.

module Api::App::PlatformTypes::OrgUpdateMemberAuditEntryPermission
  sig { returns(T::Boolean) }
  def admin?; end

  sig { returns(T::Boolean) }
  def read?; end

  ADMIN = T.let("ADMIN", String)
  READ = T.let("READ", String)
end
