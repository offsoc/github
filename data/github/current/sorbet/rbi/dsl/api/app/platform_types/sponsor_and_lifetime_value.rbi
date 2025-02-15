# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::SponsorAndLifetimeValue`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::SponsorAndLifetimeValue`.

class Api::App::PlatformTypes::SponsorAndLifetimeValue < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def amount_in_cents; end

  sig { returns(T::Boolean) }
  def amount_in_cents?; end

  sig { returns(String) }
  def formatted_amount; end

  sig { returns(T::Boolean) }
  def formatted_amount?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def sponsor; end

  sig { returns(T::Boolean) }
  def sponsor?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def sponsorable; end

  sig { returns(T::Boolean) }
  def sponsorable?; end
end
