# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::InactiveQueuesResponse`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::InactiveQueuesResponse`.

class Aqueduct::Api::V1::InactiveQueuesResponse
  sig do
    params(
      queues: T.nilable(T.any(Google::Protobuf::RepeatedField[Aqueduct::Api::V1::Queue], T::Array[Aqueduct::Api::V1::Queue]))
    ).void
  end
  def initialize(queues: T.unsafe(nil)); end

  sig { void }
  def clear_queues; end

  sig { returns(Google::Protobuf::RepeatedField[Aqueduct::Api::V1::Queue]) }
  def queues; end

  sig { params(value: Google::Protobuf::RepeatedField[Aqueduct::Api::V1::Queue]).void }
  def queues=(value); end
end
