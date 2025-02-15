# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::BlockUserFromOrganizationPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::BlockUserFromOrganizationPayload`.

class PlatformTypes::BlockUserFromOrganizationPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def blocked_until; end

  sig { returns(T::Boolean) }
  def blocked_until?; end

  sig { returns(T.nilable(PlatformTypes::User)) }
  def blocked_user; end

  sig { returns(T::Boolean) }
  def blocked_user?; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(String)) }
  def duration; end

  sig { returns(T::Boolean) }
  def duration?; end

  sig { returns(T::Array[GraphQL::Client::Schema::InterfaceType]) }
  def errors; end

  sig { returns(T::Boolean) }
  def errors?; end

  sig { returns(T.nilable(PlatformTypes::User)) }
  def viewer; end

  sig { returns(T::Boolean) }
  def viewer?; end
end
