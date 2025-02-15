# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::RegistryMetadata::V0::LayerDeleted`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::RegistryMetadata::V0::LayerDeleted`.

class Hydro::Schemas::RegistryMetadata::V0::LayerDeleted
  sig do
    params(
      actor_id: T.nilable(Integer),
      actor_type: T.nilable(T.any(Symbol, Integer)),
      deleted_at: T.nilable(Google::Protobuf::Timestamp),
      layer: T.nilable(Hydro::Schemas::RegistryMetadata::V0::Entities::ContainerLayer),
      owner_id: T.nilable(Integer),
      request_context: T.nilable(Hydro::Schemas::RegistryMetadata::V0::Entities::RequestContext),
      user_agent: T.nilable(String)
    ).void
  end
  def initialize(actor_id: nil, actor_type: nil, deleted_at: nil, layer: nil, owner_id: nil, request_context: nil, user_agent: nil); end

  sig { returns(Integer) }
  def actor_id; end

  sig { params(value: Integer).void }
  def actor_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def actor_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def actor_type=(value); end

  sig { void }
  def clear_actor_id; end

  sig { void }
  def clear_actor_type; end

  sig { void }
  def clear_deleted_at; end

  sig { void }
  def clear_layer; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_user_agent; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def deleted_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def deleted_at=(value); end

  sig { returns(T.nilable(Hydro::Schemas::RegistryMetadata::V0::Entities::ContainerLayer)) }
  def layer; end

  sig { params(value: T.nilable(Hydro::Schemas::RegistryMetadata::V0::Entities::ContainerLayer)).void }
  def layer=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::RegistryMetadata::V0::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::RegistryMetadata::V0::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(String) }
  def user_agent; end

  sig { params(value: String).void }
  def user_agent=(value); end
end
