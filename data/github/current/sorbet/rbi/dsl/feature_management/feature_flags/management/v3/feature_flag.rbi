# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Management::V3::FeatureFlag`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Management::V3::FeatureFlag`.

class FeatureManagement::FeatureFlags::Management::V3::FeatureFlag
  sig do
    params(
      description: T.nilable(String),
      etag: T.nilable(String),
      last_updated: T.nilable(Google::Protobuf::Timestamp),
      long_lived: T.nilable(T::Boolean),
      name: T.nilable(String),
      nodes: T.nilable(T.any(Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Management::V3::Node], T::Array[FeatureManagement::FeatureFlags::Management::V3::Node])),
      owning_service: T.nilable(String),
      rollout_tree_id: T.nilable(String),
      slack_channel: T.nilable(String),
      state: T.nilable(T.any(Symbol, Integer)),
      tracking_url: T.nilable(String)
    ).void
  end
  def initialize(description: nil, etag: nil, last_updated: nil, long_lived: nil, name: nil, nodes: T.unsafe(nil), owning_service: nil, rollout_tree_id: nil, slack_channel: nil, state: nil, tracking_url: nil); end

  sig { void }
  def clear_description; end

  sig { void }
  def clear_etag; end

  sig { void }
  def clear_last_updated; end

  sig { void }
  def clear_long_lived; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_nodes; end

  sig { void }
  def clear_owning_service; end

  sig { void }
  def clear_rollout_tree_id; end

  sig { void }
  def clear_slack_channel; end

  sig { void }
  def clear_state; end

  sig { void }
  def clear_tracking_url; end

  sig { returns(String) }
  def description; end

  sig { params(value: String).void }
  def description=(value); end

  sig { returns(String) }
  def etag; end

  sig { params(value: String).void }
  def etag=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def last_updated; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def last_updated=(value); end

  sig { returns(T::Boolean) }
  def long_lived; end

  sig { params(value: T::Boolean).void }
  def long_lived=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Management::V3::Node]) }
  def nodes; end

  sig { params(value: Google::Protobuf::RepeatedField[FeatureManagement::FeatureFlags::Management::V3::Node]).void }
  def nodes=(value); end

  sig { returns(String) }
  def owning_service; end

  sig { params(value: String).void }
  def owning_service=(value); end

  sig { returns(String) }
  def rollout_tree_id; end

  sig { params(value: String).void }
  def rollout_tree_id=(value); end

  sig { returns(String) }
  def slack_channel; end

  sig { params(value: String).void }
  def slack_channel=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def state; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def state=(value); end

  sig { returns(String) }
  def tracking_url; end

  sig { params(value: String).void }
  def tracking_url=(value); end
end
