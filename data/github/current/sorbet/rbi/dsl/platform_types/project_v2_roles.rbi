# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ProjectV2Roles`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ProjectV2Roles`.

module PlatformTypes::ProjectV2Roles
  sig { returns(T::Boolean) }
  def admin?; end

  sig { returns(T::Boolean) }
  def none?; end

  sig { returns(T::Boolean) }
  def reader?; end

  sig { returns(T::Boolean) }
  def writer?; end

  ADMIN = T.let("ADMIN", String)
  NONE = T.let("NONE", String)
  READER = T.let("READER", String)
  WRITER = T.let("WRITER", String)
end
