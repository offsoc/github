# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::TeamChangePrivacyAuditEntryPrivacy`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::TeamChangePrivacyAuditEntryPrivacy`.

module PlatformTypes::TeamChangePrivacyAuditEntryPrivacy
  sig { returns(T::Boolean) }
  def secret?; end

  sig { returns(T::Boolean) }
  def visible?; end

  SECRET = T.let("SECRET", String)
  VISIBLE = T.let("VISIBLE", String)
end
