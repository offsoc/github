# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Container::ContainerMetadata`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Container::ContainerMetadata`.

class Proto::RegistryMetadata::V1::Container::ContainerMetadata
  sig do
    params(
      labels: T.nilable(Proto::RegistryMetadata::V1::Container::Labels),
      manifest: T.nilable(Proto::RegistryMetadata::V1::Container::Manifest),
      pkg_subtype: T.nilable(String),
      tag: T.nilable(Proto::RegistryMetadata::V1::Container::Tag),
      tags: T.nilable(T.any(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Container::Tag], T::Array[Proto::RegistryMetadata::V1::Container::Tag]))
    ).void
  end
  def initialize(labels: nil, manifest: nil, pkg_subtype: nil, tag: nil, tags: T.unsafe(nil)); end

  sig { void }
  def clear_labels; end

  sig { void }
  def clear_manifest; end

  sig { void }
  def clear_pkg_subtype; end

  sig { void }
  def clear_tag; end

  sig { void }
  def clear_tags; end

  sig { returns(T.nilable(Proto::RegistryMetadata::V1::Container::Labels)) }
  def labels; end

  sig { params(value: T.nilable(Proto::RegistryMetadata::V1::Container::Labels)).void }
  def labels=(value); end

  sig { returns(T.nilable(Proto::RegistryMetadata::V1::Container::Manifest)) }
  def manifest; end

  sig { params(value: T.nilable(Proto::RegistryMetadata::V1::Container::Manifest)).void }
  def manifest=(value); end

  sig { returns(String) }
  def pkg_subtype; end

  sig { params(value: String).void }
  def pkg_subtype=(value); end

  sig { returns(T.nilable(Proto::RegistryMetadata::V1::Container::Tag)) }
  def tag; end

  sig { params(value: T.nilable(Proto::RegistryMetadata::V1::Container::Tag)).void }
  def tag=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Container::Tag]) }
  def tags; end

  sig { params(value: Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Container::Tag]).void }
  def tags=(value); end
end
