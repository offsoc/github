# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Management::V3::GetRolloutTreeRequest`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Management::V3::GetRolloutTreeRequest`.

class FeatureManagement::FeatureFlags::Management::V3::GetRolloutTreeRequest
  sig { params(id: T.nilable(String)).void }
  def initialize(id: nil); end

  sig { void }
  def clear_id; end

  sig { returns(String) }
  def id; end

  sig { params(value: String).void }
  def id=(value); end
end
