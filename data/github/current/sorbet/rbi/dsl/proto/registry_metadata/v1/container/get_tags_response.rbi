# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Container::GetTagsResponse`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Container::GetTagsResponse`.

class Proto::RegistryMetadata::V1::Container::GetTagsResponse
  sig do
    params(
      next: T.nilable(String),
      tags: T.nilable(T.any(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Container::Tag], T::Array[Proto::RegistryMetadata::V1::Container::Tag]))
    ).void
  end
  def initialize(next: nil, tags: T.unsafe(nil)); end

  sig { void }
  def clear_next; end

  sig { void }
  def clear_tags; end

  sig { returns(String) }
  def next; end

  sig { params(value: String).void }
  def next=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Container::Tag]) }
  def tags; end

  sig { params(value: Google::Protobuf::RepeatedField[Proto::RegistryMetadata::V1::Container::Tag]).void }
  def tags=(value); end
end
