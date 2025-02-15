# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V1::ExemptionResponseStatus`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V1::ExemptionResponseStatus`.

module GitHub::Proto::SecretScanning::Api::V1::ExemptionResponseStatus
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Proto::SecretScanning::Api::V1::ExemptionResponseStatus::APPROVED = 2
GitHub::Proto::SecretScanning::Api::V1::ExemptionResponseStatus::PENDING = 1
GitHub::Proto::SecretScanning::Api::V1::ExemptionResponseStatus::REJECTED = 3
GitHub::Proto::SecretScanning::Api::V1::ExemptionResponseStatus::UNKNOWN_EXEMPTION_RESPONSE_STATUS = 0
