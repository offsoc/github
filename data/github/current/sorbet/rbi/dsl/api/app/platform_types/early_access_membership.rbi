# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::EarlyAccessMembership`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::EarlyAccessMembership`.

class Api::App::PlatformTypes::EarlyAccessMembership < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig do
    returns(T.nilable(T.any(Api::App::PlatformTypes::User, Api::App::PlatformTypes::Organization, Api::App::PlatformTypes::Enterprise, Api::App::PlatformTypes::Bot, Api::App::PlatformTypes::Mannequin, Api::App::PlatformTypes::ProgrammaticAccessBot)))
  end
  def account; end

  sig { returns(T::Boolean) }
  def account?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::User)) }
  def actor; end

  sig { returns(T::Boolean) }
  def actor?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(String) }
  def feature; end

  sig { returns(T::Boolean) }
  def feature?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def is_approved; end

  sig { returns(T::Boolean) }
  def is_approved?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end
end
