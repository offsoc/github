# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::TeamGroupMappingOrderField`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::TeamGroupMappingOrderField`.

module PlatformTypes::TeamGroupMappingOrderField
  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T::Boolean) }
  def group_id?; end

  sig { returns(T::Boolean) }
  def group_name?; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def synced_at?; end

  CREATED_AT = T.let("CREATED_AT", String)
  GROUP_ID = T.let("GROUP_ID", String)
  GROUP_NAME = T.let("GROUP_NAME", String)
  ID = T.let("ID", String)
  SYNCED_AT = T.let("SYNCED_AT", String)
end
