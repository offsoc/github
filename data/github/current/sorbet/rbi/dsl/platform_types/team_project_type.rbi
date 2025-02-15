# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::TeamProjectType`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::TeamProjectType`.

module PlatformTypes::TeamProjectType
  sig { returns(T::Boolean) }
  def all?; end

  sig { returns(T::Boolean) }
  def immediate?; end

  sig { returns(T::Boolean) }
  def inherited?; end

  ALL = T.let("ALL", String)
  IMMEDIATE = T.let("IMMEDIATE", String)
  INHERITED = T.let("INHERITED", String)
end
