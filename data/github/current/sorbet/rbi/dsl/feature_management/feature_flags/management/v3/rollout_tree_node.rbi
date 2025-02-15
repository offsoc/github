# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode`.

class FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode
  sig { params(name: T.nilable(String), parent: T.nilable(String)).void }
  def initialize(name: nil, parent: nil); end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_parent; end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def parent; end

  sig { params(value: String).void }
  def parent=(value); end
end
