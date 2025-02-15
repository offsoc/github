# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TeamRole`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TeamRole`.

module Api::App::PlatformTypes::TeamRole
  sig { returns(T::Boolean) }
  def admin?; end

  sig { returns(T::Boolean) }
  def member?; end

  ADMIN = T.let("ADMIN", String)
  MEMBER = T.let("MEMBER", String)
end
