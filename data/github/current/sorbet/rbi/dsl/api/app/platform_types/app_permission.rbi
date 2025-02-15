# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::AppPermission`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::AppPermission`.

class Api::App::PlatformTypes::AppPermission < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def access; end

  sig { returns(T::Boolean) }
  def access?; end

  sig { returns(String) }
  def resource; end

  sig { returns(T::Boolean) }
  def resource?; end
end
