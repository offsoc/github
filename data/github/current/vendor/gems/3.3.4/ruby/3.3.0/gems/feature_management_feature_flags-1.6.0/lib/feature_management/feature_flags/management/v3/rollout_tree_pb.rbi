# Code generated by protoc-gen-rbi. DO NOT EDIT.
# source: feature_management/feature_flags/management/v3/rollout_tree.proto
# typed: strict

# *
#  RolloutTree is the definition of a tree in the feature flag hub. It contains the metadata and a list of nodes (stamps or virtual parent groups) that are part of the tree.
class FeatureManagement::FeatureFlags::Management::V3::RolloutTree
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  sig { params(str: String).returns(FeatureManagement::FeatureFlags::Management::V3::RolloutTree) }
  def self.decode(str)
  end

  sig { params(msg: FeatureManagement::FeatureFlags::Management::V3::RolloutTree).returns(String) }
  def self.encode(msg)
  end

  sig { params(str: String, kw: T.untyped).returns(FeatureManagement::FeatureFlags::Management::V3::RolloutTree) }
  def self.decode_json(str, **kw)
  end

  sig { params(msg: FeatureManagement::FeatureFlags::Management::V3::RolloutTree, kw: T.untyped).returns(String) }
  def self.encode_json(msg, **kw)
  end

  sig { returns(::Google::Protobuf::Descriptor) }
  def self.descriptor
  end

  sig do
    params(
      id: T.nilable(String),
      name: T.nilable(String),
      version: T.nilable(Integer),
      description: T.nilable(String),
      created_at: T.nilable(Google::Protobuf::Timestamp),
      nodes: T.nilable(T::Array[T.nilable(FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode)])
    ).void
  end
  def initialize(
    id: "",
    name: "",
    version: 0,
    description: "",
    created_at: nil,
    nodes: []
  )
  end

  # This field contains the unique rollout tree GUID.
  sig { returns(String) }
  def id
  end

  # This field contains the unique rollout tree GUID.
  sig { params(value: String).void }
  def id=(value)
  end

  # This field contains the unique rollout tree GUID.
  sig { void }
  def clear_id
  end

  # This field contains the unique display name of the rollout tree.
  sig { returns(String) }
  def name
  end

  # This field contains the unique display name of the rollout tree.
  sig { params(value: String).void }
  def name=(value)
  end

  # This field contains the unique display name of the rollout tree.
  sig { void }
  def clear_name
  end

  # This field is used to hide older version of a tree in the UI. Only the most recent version of a tree is able to be used when a new feature flag is created.
  sig { returns(Integer) }
  def version
  end

  # This field is used to hide older version of a tree in the UI. Only the most recent version of a tree is able to be used when a new feature flag is created.
  sig { params(value: Integer).void }
  def version=(value)
  end

  # This field is used to hide older version of a tree in the UI. Only the most recent version of a tree is able to be used when a new feature flag is created.
  sig { void }
  def clear_version
  end

  # This field contains the description of the rollout tree.
  sig { returns(String) }
  def description
  end

  # This field contains the description of the rollout tree.
  sig { params(value: String).void }
  def description=(value)
  end

  # This field contains the description of the rollout tree.
  sig { void }
  def clear_description
  end

  # This field contains the creation date of the rollout tree.
  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at
  end

  # This field contains the creation date of the rollout tree.
  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value)
  end

  # This field contains the creation date of the rollout tree.
  sig { void }
  def clear_created_at
  end

  # This field contains a list of nodes in the rollout tree.
  sig { returns(T::Array[T.nilable(FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode)]) }
  def nodes
  end

  # This field contains a list of nodes in the rollout tree.
  sig { params(value: ::Google::Protobuf::RepeatedField).void }
  def nodes=(value)
  end

  # This field contains a list of nodes in the rollout tree.
  sig { void }
  def clear_nodes
  end

  sig { params(field: String).returns(T.untyped) }
  def [](field)
  end

  sig { params(field: String, value: T.untyped).void }
  def []=(field, value)
  end

  sig { returns(T::Hash[Symbol, T.untyped]) }
  def to_h
  end
end

# *
# RolloutTreeNode defines on node in the rollout tree. It contains the name of the node and the name of the parent's node. Since it a directed tree, the root node will have an empty parent field.
# These node names are either the name of a "stamp" use by the deployment system or the name of a virtual parent group.
class FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  sig { params(str: String).returns(FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode) }
  def self.decode(str)
  end

  sig { params(msg: FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode).returns(String) }
  def self.encode(msg)
  end

  sig { params(str: String, kw: T.untyped).returns(FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode) }
  def self.decode_json(str, **kw)
  end

  sig { params(msg: FeatureManagement::FeatureFlags::Management::V3::RolloutTreeNode, kw: T.untyped).returns(String) }
  def self.encode_json(msg, **kw)
  end

  sig { returns(::Google::Protobuf::Descriptor) }
  def self.descriptor
  end

  sig do
    params(
      name: T.nilable(String),
      parent: T.nilable(String)
    ).void
  end
  def initialize(
    name: "",
    parent: ""
  )
  end

  # This field contains the name of the node.
  sig { returns(String) }
  def name
  end

  # This field contains the name of the node.
  sig { params(value: String).void }
  def name=(value)
  end

  # This field contains the name of the node.
  sig { void }
  def clear_name
  end

  # This field contains the name of parent node.
  sig { returns(String) }
  def parent
  end

  # This field contains the name of parent node.
  sig { params(value: String).void }
  def parent=(value)
  end

  # This field contains the name of parent node.
  sig { void }
  def clear_parent
  end

  sig { params(field: String).returns(T.untyped) }
  def [](field)
  end

  sig { params(field: String, value: T.untyped).void }
  def []=(field, value)
  end

  sig { returns(T::Hash[Symbol, T.untyped]) }
  def to_h
  end
end
