# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::IpAllowListEntry`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::IpAllowListEntry`.

class Api::App::PlatformTypes::IpAllowListEntry < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def allow_list_value; end

  sig { returns(T::Boolean) }
  def allow_list_value?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def is_active; end

  sig { returns(T::Boolean) }
  def is_active?; end

  sig { returns(T.nilable(String)) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig do
    returns(T.any(Api::App::PlatformTypes::Enterprise, Api::App::PlatformTypes::Organization, Api::App::PlatformTypes::App))
  end
  def owner; end

  sig { returns(T::Boolean) }
  def owner?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end
end
