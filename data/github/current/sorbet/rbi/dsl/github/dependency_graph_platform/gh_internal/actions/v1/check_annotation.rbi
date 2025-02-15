# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencyGraphPlatform::GhInternal::Actions::V1::CheckAnnotation`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencyGraphPlatform::GhInternal::Actions::V1::CheckAnnotation`.

class Github::DependencyGraphPlatform::GhInternal::Actions::V1::CheckAnnotation
  sig { params(level: T.nilable(T.any(Symbol, Integer)), message: T.nilable(String)).void }
  def initialize(level: nil, message: nil); end

  sig { void }
  def clear_level; end

  sig { void }
  def clear_message; end

  sig { returns(T.any(Symbol, Integer)) }
  def level; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def level=(value); end

  sig { returns(String) }
  def message; end

  sig { params(value: String).void }
  def message=(value); end
end
