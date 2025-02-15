# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TeamMembersFilter`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TeamMembersFilter`.

module Api::App::PlatformTypes::TeamMembersFilter
  sig { returns(T::Boolean) }
  def empty?; end

  sig { returns(T::Boolean) }
  def me?; end

  EMPTY = T.let("EMPTY", String)
  ME = T.let("ME", String)
end
