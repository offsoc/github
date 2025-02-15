# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::StripeConnectAccount`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::StripeConnectAccount`.

class Api::App::PlatformTypes::StripeConnectAccount < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def account_id; end

  sig { returns(T::Boolean) }
  def account_id?; end

  sig { returns(T.nilable(String)) }
  def billing_country_or_region; end

  sig { returns(T::Boolean) }
  def billing_country_or_region?; end

  sig { returns(T.nilable(String)) }
  def country_or_region; end

  sig { returns(T::Boolean) }
  def country_or_region?; end

  sig { returns(T::Boolean) }
  def is_active; end

  sig { returns(T::Boolean) }
  def is_active?; end

  sig { returns(Api::App::PlatformTypes::SponsorsListing) }
  def sponsors_listing; end

  sig { returns(T::Boolean) }
  def sponsors_listing?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def stripe_dashboard_url; end

  sig { returns(T::Boolean) }
  def stripe_dashboard_url?; end
end
