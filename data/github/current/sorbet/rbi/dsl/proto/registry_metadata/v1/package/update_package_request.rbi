# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Package::UpdatePackageRequest`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Package::UpdatePackageRequest`.

class Proto::RegistryMetadata::V1::Package::UpdatePackageRequest
  sig do
    params(
      active_sync_perms: T.nilable(T::Boolean),
      actor_type: T.nilable(T.any(Symbol, Integer)),
      ecosystem: T.nilable(T.any(Symbol, Integer)),
      name: T.nilable(String),
      namespace: T.nilable(String),
      repo_id: T.nilable(Integer),
      update_mask: T.nilable(Google::Protobuf::FieldMask),
      user_id: T.nilable(Integer),
      visibility: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(active_sync_perms: nil, actor_type: nil, ecosystem: nil, name: nil, namespace: nil, repo_id: nil, update_mask: nil, user_id: nil, visibility: nil); end

  sig { returns(T::Boolean) }
  def active_sync_perms; end

  sig { params(value: T::Boolean).void }
  def active_sync_perms=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def actor_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def actor_type=(value); end

  sig { void }
  def clear_active_sync_perms; end

  sig { void }
  def clear_actor_type; end

  sig { void }
  def clear_ecosystem; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_namespace; end

  sig { void }
  def clear_repo_id; end

  sig { void }
  def clear_update_mask; end

  sig { void }
  def clear_user_id; end

  sig { void }
  def clear_visibility; end

  sig { returns(T.any(Symbol, Integer)) }
  def ecosystem; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def ecosystem=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def namespace; end

  sig { params(value: String).void }
  def namespace=(value); end

  sig { returns(Integer) }
  def repo_id; end

  sig { params(value: Integer).void }
  def repo_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::FieldMask)) }
  def update_mask; end

  sig { params(value: T.nilable(Google::Protobuf::FieldMask)).void }
  def update_mask=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def visibility; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def visibility=(value); end
end
