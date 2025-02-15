# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::SetTradeScreeningStatusPayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::SetTradeScreeningStatusPayload`.

class Api::App::PlatformTypes::SetTradeScreeningStatusPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Api::App::PlatformTypes::AccountScreeningProfile)) }
  def account_screening_profile; end

  sig { returns(T::Boolean) }
  def account_screening_profile?; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end
end
