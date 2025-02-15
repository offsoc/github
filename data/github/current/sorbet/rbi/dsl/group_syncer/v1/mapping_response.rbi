# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GroupSyncer::V1::MappingResponse`.
# Please instead update this file by running `bin/tapioca dsl GroupSyncer::V1::MappingResponse`.

class GroupSyncer::V1::MappingResponse
  sig do
    params(
      mappings: T.nilable(T.any(Google::Protobuf::RepeatedField[GroupSyncer::V1::Mapping], T::Array[GroupSyncer::V1::Mapping]))
    ).void
  end
  def initialize(mappings: T.unsafe(nil)); end

  sig { void }
  def clear_mappings; end

  sig { returns(Google::Protobuf::RepeatedField[GroupSyncer::V1::Mapping]) }
  def mappings; end

  sig { params(value: Google::Protobuf::RepeatedField[GroupSyncer::V1::Mapping]).void }
  def mappings=(value); end
end
