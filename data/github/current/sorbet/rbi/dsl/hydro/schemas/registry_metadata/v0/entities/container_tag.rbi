# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::RegistryMetadata::V0::Entities::ContainerTag`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::RegistryMetadata::V0::Entities::ContainerTag`.

class Hydro::Schemas::RegistryMetadata::V0::Entities::ContainerTag
  sig { params(digest: T.nilable(String), name: T.nilable(String)).void }
  def initialize(digest: nil, name: nil); end

  sig { void }
  def clear_digest; end

  sig { void }
  def clear_name; end

  sig { returns(String) }
  def digest; end

  sig { params(value: String).void }
  def digest=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end
end
