# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::SavedViewOrderField`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::SavedViewOrderField`.

module PlatformTypes::SavedViewOrderField
  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  CREATED_AT = T.let("CREATED_AT", String)
  UPDATED_AT = T.let("UPDATED_AT", String)
end
