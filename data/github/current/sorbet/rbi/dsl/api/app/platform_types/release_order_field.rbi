# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ReleaseOrderField`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ReleaseOrderField`.

module Api::App::PlatformTypes::ReleaseOrderField
  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T::Boolean) }
  def name?; end

  CREATED_AT = T.let("CREATED_AT", String)
  NAME = T.let("NAME", String)
end
