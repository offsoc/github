# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::RegistryMetadata::V1::Maven::MavenRepository`.
# Please instead update this file by running `bin/tapioca dsl Proto::RegistryMetadata::V1::Maven::MavenRepository`.

class Proto::RegistryMetadata::V1::Maven::MavenRepository
  sig { params(url: T.nilable(String)).void }
  def initialize(url: nil); end

  sig { void }
  def clear_url; end

  sig { returns(String) }
  def url; end

  sig { params(value: String).void }
  def url=(value); end
end
