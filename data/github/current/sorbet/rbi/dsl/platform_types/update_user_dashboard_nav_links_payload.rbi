# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::UpdateUserDashboardNavLinksPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::UpdateUserDashboardNavLinksPayload`.

class PlatformTypes::UpdateUserDashboardNavLinksPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::UserDashboard)) }
  def dashboard; end

  sig { returns(T::Boolean) }
  def dashboard?; end

  sig { returns(T::Array[GraphQL::Client::Schema::InterfaceType]) }
  def errors; end

  sig { returns(T::Boolean) }
  def errors?; end

  sig { returns(T.nilable(T::Array[PlatformTypes::UserDashboardNavLink])) }
  def nav_links; end

  sig { returns(T::Boolean) }
  def nav_links?; end
end
