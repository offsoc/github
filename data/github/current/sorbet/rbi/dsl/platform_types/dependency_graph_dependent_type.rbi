# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DependencyGraphDependentType`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DependencyGraphDependentType`.

module PlatformTypes::DependencyGraphDependentType
  sig { returns(T::Boolean) }
  def package?; end

  sig { returns(T::Boolean) }
  def repository?; end

  PACKAGE = T.let("PACKAGE", String)
  REPOSITORY = T.let("REPOSITORY", String)
end
