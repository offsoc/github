# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::Users::V1::GetBlockingUsersRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::Users::V1::GetBlockingUsersRequest`.

class GitHub::Proto::Users::V1::GetBlockingUsersRequest
  sig do
    params(
      target_user_id: T.nilable(Integer),
      user_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))
    ).void
  end
  def initialize(target_user_id: nil, user_ids: T.unsafe(nil)); end

  sig { void }
  def clear_target_user_id; end

  sig { void }
  def clear_user_ids; end

  sig { returns(Integer) }
  def target_user_id; end

  sig { params(value: Integer).void }
  def target_user_id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def user_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def user_ids=(value); end
end
