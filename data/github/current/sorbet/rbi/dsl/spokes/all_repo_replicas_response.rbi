# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Spokes::AllRepoReplicasResponse`.
# Please instead update this file by running `bin/tapioca dsl Spokes::AllRepoReplicasResponse`.

class Spokes::AllRepoReplicasResponse
  sig do
    params(
      replicas: T.nilable(T.any(Google::Protobuf::RepeatedField[Spokes::Replica], T::Array[Spokes::Replica]))
    ).void
  end
  def initialize(replicas: T.unsafe(nil)); end

  sig { void }
  def clear_replicas; end

  sig { returns(Google::Protobuf::RepeatedField[Spokes::Replica]) }
  def replicas; end

  sig { params(value: Google::Protobuf::RepeatedField[Spokes::Replica]).void }
  def replicas=(value); end
end
