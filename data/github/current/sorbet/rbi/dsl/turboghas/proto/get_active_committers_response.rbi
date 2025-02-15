# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboghas::Proto::GetActiveCommittersResponse`.
# Please instead update this file by running `bin/tapioca dsl Turboghas::Proto::GetActiveCommittersResponse`.

class Turboghas::Proto::GetActiveCommittersResponse
  sig do
    params(
      users: T.nilable(T.any(Google::Protobuf::RepeatedField[Turboghas::Proto::GetActiveCommittersResponse::User], T::Array[Turboghas::Proto::GetActiveCommittersResponse::User]))
    ).void
  end
  def initialize(users: T.unsafe(nil)); end

  sig { void }
  def clear_users; end

  sig { returns(Google::Protobuf::RepeatedField[Turboghas::Proto::GetActiveCommittersResponse::User]) }
  def users; end

  sig { params(value: Google::Protobuf::RepeatedField[Turboghas::Proto::GetActiveCommittersResponse::User]).void }
  def users=(value); end
end
