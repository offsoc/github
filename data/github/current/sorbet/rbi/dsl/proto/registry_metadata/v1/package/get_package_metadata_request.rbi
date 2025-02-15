# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Package::GetPackageMetadataRequest`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Package::GetPackageMetadataRequest`.

class Proto::RegistryMetadata::V1::Package::GetPackageMetadataRequest
  sig do
    params(
      actor_type: T.nilable(T.any(Symbol, Integer)),
      containerVersionFilter: T.nilable(T.any(Symbol, Integer)),
      ecosystem: T.nilable(T.any(Symbol, Integer)),
      include_deleted: T.nilable(T::Boolean),
      include_download_count: T.nilable(T::Boolean),
      integration_name: T.nilable(String),
      name: T.nilable(String),
      namespace: T.nilable(String),
      package_subtype: T.nilable(T.any(Symbol, Integer)),
      user_id: T.nilable(Integer),
      version_limit: T.nilable(Integer),
      version_offset: T.nilable(Integer),
      version_order: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(actor_type: nil, containerVersionFilter: nil, ecosystem: nil, include_deleted: nil, include_download_count: nil, integration_name: nil, name: nil, namespace: nil, package_subtype: nil, user_id: nil, version_limit: nil, version_offset: nil, version_order: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def actor_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def actor_type=(value); end

  sig { void }
  def clear_actor_type; end

  sig { void }
  def clear_containerVersionFilter; end

  sig { void }
  def clear_ecosystem; end

  sig { void }
  def clear_include_deleted; end

  sig { void }
  def clear_include_download_count; end

  sig { void }
  def clear_integration_name; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_namespace; end

  sig { void }
  def clear_package_subtype; end

  sig { void }
  def clear_user_id; end

  sig { void }
  def clear_version_limit; end

  sig { void }
  def clear_version_offset; end

  sig { void }
  def clear_version_order; end

  sig { returns(T.any(Symbol, Integer)) }
  def containerVersionFilter; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def containerVersionFilter=(value); end

  sig { returns(T.nilable(Symbol)) }
  def eco_version_filter; end

  sig { returns(T.any(Symbol, Integer)) }
  def ecosystem; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def ecosystem=(value); end

  sig { returns(T::Boolean) }
  def include_deleted; end

  sig { params(value: T::Boolean).void }
  def include_deleted=(value); end

  sig { returns(T::Boolean) }
  def include_download_count; end

  sig { params(value: T::Boolean).void }
  def include_download_count=(value); end

  sig { returns(String) }
  def integration_name; end

  sig { params(value: String).void }
  def integration_name=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def namespace; end

  sig { params(value: String).void }
  def namespace=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def package_subtype; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def package_subtype=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end

  sig { returns(Integer) }
  def version_limit; end

  sig { params(value: Integer).void }
  def version_limit=(value); end

  sig { returns(Integer) }
  def version_offset; end

  sig { params(value: Integer).void }
  def version_offset=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def version_order; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def version_order=(value); end
end
