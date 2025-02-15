# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::EnterpriseOrganizationMembershipEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::EnterpriseOrganizationMembershipEdge`.

class Api::App::PlatformTypes::EnterpriseOrganizationMembershipEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::Organization)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end

  sig { returns(String) }
  def role; end

  sig { returns(T::Boolean) }
  def role?; end
end
