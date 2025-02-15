# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::CodeScanning::Turboghas::V1::GetEntitiesRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::CodeScanning::Turboghas::V1::GetEntitiesRequest`.

class MonolithTwirp::CodeScanning::Turboghas::V1::GetEntitiesRequest
  sig do
    params(
      entities: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::CodeScanning::Turboghas::V1::GetEntitiesRequest::Entity], T::Array[MonolithTwirp::CodeScanning::Turboghas::V1::GetEntitiesRequest::Entity]))
    ).void
  end
  def initialize(entities: T.unsafe(nil)); end

  sig { void }
  def clear_entities; end

  sig do
    returns(Google::Protobuf::RepeatedField[MonolithTwirp::CodeScanning::Turboghas::V1::GetEntitiesRequest::Entity])
  end
  def entities; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[MonolithTwirp::CodeScanning::Turboghas::V1::GetEntitiesRequest::Entity]
    ).void
  end
  def entities=(value); end
end
