# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::Sponsorship`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::Sponsorship`.

class PlatformTypes::Sponsorship < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

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

  sig { returns(T::Boolean) }
  def is_one_time_payment; end

  sig { returns(T::Boolean) }
  def is_one_time_payment?; end

  sig { returns(T.nilable(T::Boolean)) }
  def is_sponsor_opted_into_email; end

  sig { returns(T::Boolean) }
  def is_sponsor_opted_into_email?; end

  sig { returns(PlatformTypes::User) }
  def maintainer; end

  sig { returns(T::Boolean) }
  def maintainer?; end

  sig { returns(T.nilable(String)) }
  def payment_source; end

  sig { returns(T::Boolean) }
  def payment_source?; end

  sig { returns(String) }
  def privacy_level; end

  sig { returns(T::Boolean) }
  def privacy_level?; end

  sig { returns(T.nilable(PlatformTypes::User)) }
  def sponsor; end

  sig { returns(T::Boolean) }
  def sponsor?; end

  sig { returns(T.nilable(T.any(PlatformTypes::User, PlatformTypes::Organization))) }
  def sponsor_entity; end

  sig { returns(T::Boolean) }
  def sponsor_entity?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def sponsorable; end

  sig { returns(T::Boolean) }
  def sponsorable?; end

  sig { returns(T.nilable(PlatformTypes::SponsorsTier)) }
  def tier; end

  sig { returns(T::Boolean) }
  def tier?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def tier_selected_at; end

  sig { returns(T::Boolean) }
  def tier_selected_at?; end
end
