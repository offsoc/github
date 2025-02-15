# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::GetEnabledThrottledQueuesResponse`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::GetEnabledThrottledQueuesResponse`.

class Aqueduct::Api::V1::GetEnabledThrottledQueuesResponse
  sig do
    params(
      throttle_configs: T.nilable(T.any(Google::Protobuf::RepeatedField[Aqueduct::Api::V1::ThrottleConfig], T::Array[Aqueduct::Api::V1::ThrottleConfig]))
    ).void
  end
  def initialize(throttle_configs: T.unsafe(nil)); end

  sig { void }
  def clear_throttle_configs; end

  sig { returns(Google::Protobuf::RepeatedField[Aqueduct::Api::V1::ThrottleConfig]) }
  def throttle_configs; end

  sig { params(value: Google::Protobuf::RepeatedField[Aqueduct::Api::V1::ThrottleConfig]).void }
  def throttle_configs=(value); end
end
