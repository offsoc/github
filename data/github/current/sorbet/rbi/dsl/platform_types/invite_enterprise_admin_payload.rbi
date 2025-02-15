# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::InviteEnterpriseAdminPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::InviteEnterpriseAdminPayload`.

class PlatformTypes::InviteEnterpriseAdminPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::EnterpriseAdministratorInvitation)) }
  def invitation; end

  sig { returns(T::Boolean) }
  def invitation?; end
end
