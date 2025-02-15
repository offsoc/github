# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::Core::V1::GetMembershipsResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::Core::V1::GetMembershipsResponse`.

class MonolithTwirp::Copilotapi::Core::V1::GetMembershipsResponse
  sig { params(org_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))).void }
  def initialize(org_ids: T.unsafe(nil)); end

  sig { void }
  def clear_org_ids; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def org_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def org_ids=(value); end
end
