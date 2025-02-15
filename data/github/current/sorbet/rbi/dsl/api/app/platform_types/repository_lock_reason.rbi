# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::RepositoryLockReason`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::RepositoryLockReason`.

module Api::App::PlatformTypes::RepositoryLockReason
  sig { returns(T::Boolean) }
  def billing?; end

  sig { returns(T::Boolean) }
  def migrating?; end

  sig { returns(T::Boolean) }
  def moving?; end

  sig { returns(T::Boolean) }
  def rename?; end

  sig { returns(T::Boolean) }
  def trade_restriction?; end

  sig { returns(T::Boolean) }
  def transferring_ownership?; end

  BILLING = T.let("BILLING", String)
  MIGRATING = T.let("MIGRATING", String)
  MOVING = T.let("MOVING", String)
  RENAME = T.let("RENAME", String)
  TRADE_RESTRICTION = T.let("TRADE_RESTRICTION", String)
  TRANSFERRING_OWNERSHIP = T.let("TRANSFERRING_OWNERSHIP", String)
end
