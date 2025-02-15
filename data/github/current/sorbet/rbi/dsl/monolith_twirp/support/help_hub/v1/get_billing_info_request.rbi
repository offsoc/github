# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Support::HelpHub::V1::GetBillingInfoRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Support::HelpHub::V1::GetBillingInfoRequest`.

class MonolithTwirp::Support::HelpHub::V1::GetBillingInfoRequest
  sig { params(user_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))).void }
  def initialize(user_ids: T.unsafe(nil)); end

  sig { void }
  def clear_user_ids; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def user_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def user_ids=(value); end
end
