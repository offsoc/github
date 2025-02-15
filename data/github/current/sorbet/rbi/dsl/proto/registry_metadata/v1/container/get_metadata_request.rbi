# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Container::GetMetadataRequest`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Container::GetMetadataRequest`.

class Proto::RegistryMetadata::V1::Container::GetMetadataRequest
  sig do
    params(
      is_non_download: T.nilable(T::Boolean),
      namespace: T.nilable(String),
      package_name: T.nilable(String),
      tag: T.nilable(Proto::RegistryMetadata::V1::Container::Tag),
      user_agent: T.nilable(String)
    ).void
  end
  def initialize(is_non_download: nil, namespace: nil, package_name: nil, tag: nil, user_agent: nil); end

  sig { void }
  def clear_is_non_download; end

  sig { void }
  def clear_namespace; end

  sig { void }
  def clear_package_name; end

  sig { void }
  def clear_tag; end

  sig { void }
  def clear_user_agent; end

  sig { returns(T::Boolean) }
  def is_non_download; end

  sig { params(value: T::Boolean).void }
  def is_non_download=(value); end

  sig { returns(String) }
  def namespace; end

  sig { params(value: String).void }
  def namespace=(value); end

  sig { returns(String) }
  def package_name; end

  sig { params(value: String).void }
  def package_name=(value); end

  sig { returns(T.nilable(Proto::RegistryMetadata::V1::Container::Tag)) }
  def tag; end

  sig { params(value: T.nilable(Proto::RegistryMetadata::V1::Container::Tag)).void }
  def tag=(value); end

  sig { returns(String) }
  def user_agent; end

  sig { params(value: String).void }
  def user_agent=(value); end
end
