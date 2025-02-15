# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::PackagesErrorType`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::PackagesErrorType`.

module PlatformTypes::PackagesErrorType
  sig { returns(T::Boolean) }
  def account_disabled?; end

  sig { returns(T::Boolean) }
  def billing_vnext_blocked?; end

  sig { returns(T::Boolean) }
  def feature_flag?; end

  sig { returns(T::Boolean) }
  def file_exists?; end

  sig { returns(T::Boolean) }
  def none?; end

  sig { returns(T::Boolean) }
  def package_exists?; end

  sig { returns(T::Boolean) }
  def plan_ineligible?; end

  sig { returns(T::Boolean) }
  def repository_archived?; end

  sig { returns(T::Boolean) }
  def repository_disabled?; end

  sig { returns(T::Boolean) }
  def repository_locked?; end

  sig { returns(T::Boolean) }
  def repository_spammy?; end

  sig { returns(T::Boolean) }
  def resource_limited?; end

  sig { returns(T::Boolean) }
  def trade_restriction?; end

  sig { returns(T::Boolean) }
  def user_blocked?; end

  sig { returns(T::Boolean) }
  def user_spammy?; end

  sig { returns(T::Boolean) }
  def validation?; end

  sig { returns(T::Boolean) }
  def version_exists?; end

  sig { returns(T::Boolean) }
  def wrong_repository?; end

  ACCOUNT_DISABLED = T.let("ACCOUNT_DISABLED", String)
  BILLING_VNEXT_BLOCKED = T.let("BILLING_VNEXT_BLOCKED", String)
  FEATURE_FLAG = T.let("FEATURE_FLAG", String)
  FILE_EXISTS = T.let("FILE_EXISTS", String)
  NONE = T.let("NONE", String)
  PACKAGE_EXISTS = T.let("PACKAGE_EXISTS", String)
  PLAN_INELIGIBLE = T.let("PLAN_INELIGIBLE", String)
  REPOSITORY_ARCHIVED = T.let("REPOSITORY_ARCHIVED", String)
  REPOSITORY_DISABLED = T.let("REPOSITORY_DISABLED", String)
  REPOSITORY_LOCKED = T.let("REPOSITORY_LOCKED", String)
  REPOSITORY_SPAMMY = T.let("REPOSITORY_SPAMMY", String)
  RESOURCE_LIMITED = T.let("RESOURCE_LIMITED", String)
  TRADE_RESTRICTION = T.let("TRADE_RESTRICTION", String)
  USER_BLOCKED = T.let("USER_BLOCKED", String)
  USER_SPAMMY = T.let("USER_SPAMMY", String)
  VALIDATION = T.let("VALIDATION", String)
  VERSION_EXISTS = T.let("VERSION_EXISTS", String)
  WRONG_REPOSITORY = T.let("WRONG_REPOSITORY", String)
end
