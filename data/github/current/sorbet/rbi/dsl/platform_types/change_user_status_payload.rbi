# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ChangeUserStatusPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ChangeUserStatusPayload`.

class PlatformTypes::ChangeUserStatusPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::UserStatus)) }
  def status; end

  sig { returns(T::Boolean) }
  def status?; end
end
