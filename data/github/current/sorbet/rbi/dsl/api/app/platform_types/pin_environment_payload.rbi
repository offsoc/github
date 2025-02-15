# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PinEnvironmentPayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PinEnvironmentPayload`.

class Api::App::PlatformTypes::PinEnvironmentPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::Environment)) }
  def environment; end

  sig { returns(T::Boolean) }
  def environment?; end

  sig { returns(T::Array[GraphQL::Client::Schema::InterfaceType]) }
  def errors; end

  sig { returns(T::Boolean) }
  def errors?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::PinnedEnvironment)) }
  def pinned_environment; end

  sig { returns(T::Boolean) }
  def pinned_environment?; end
end
