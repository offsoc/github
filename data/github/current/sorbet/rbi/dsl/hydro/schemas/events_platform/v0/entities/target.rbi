# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::EventsPlatform::V0::Entities::Target`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::EventsPlatform::V0::Entities::Target`.

class Hydro::Schemas::EventsPlatform::V0::Entities::Target
  sig do
    params(
      primary_entity: T.nilable(Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference),
      related_entities: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference], T::Array[Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference]))
    ).void
  end
  def initialize(primary_entity: nil, related_entities: T.unsafe(nil)); end

  sig { void }
  def clear_primary_entity; end

  sig { void }
  def clear_related_entities; end

  sig { returns(T.nilable(Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference)) }
  def primary_entity; end

  sig { params(value: T.nilable(Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference)).void }
  def primary_entity=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference]) }
  def related_entities; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::EventsPlatform::V0::Entities::EntityReference]
    ).void
  end
  def related_entities=(value); end
end
