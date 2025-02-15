# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Container::GetTagResponse`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Container::GetTagResponse`.

class Proto::RegistryMetadata::V1::Container::GetTagResponse
  sig { params(tag: T.nilable(Proto::RegistryMetadata::V1::Container::Tag)).void }
  def initialize(tag: nil); end

  sig { void }
  def clear_tag; end

  sig { returns(T.nilable(Proto::RegistryMetadata::V1::Container::Tag)) }
  def tag; end

  sig { params(value: T.nilable(Proto::RegistryMetadata::V1::Container::Tag)).void }
  def tag=(value); end
end
