# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::MarketplaceOrderPreview`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::MarketplaceOrderPreview`.

class PlatformTypes::MarketplaceOrderPreview < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig do
    returns(T.any(PlatformTypes::User, PlatformTypes::Organization, PlatformTypes::Enterprise, PlatformTypes::Bot, PlatformTypes::Mannequin, PlatformTypes::ProgrammaticAccessBot))
  end
  def account; end

  sig { returns(T::Boolean) }
  def account?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(PlatformTypes::MarketplaceListing) }
  def listing; end

  sig { returns(T::Boolean) }
  def listing?; end

  sig { returns(T.nilable(PlatformTypes::MarketplaceListingPlan)) }
  def listing_plan; end

  sig { returns(T::Boolean) }
  def listing_plan?; end

  sig { returns(Integer) }
  def quantity; end

  sig { returns(T::Boolean) }
  def quantity?; end

  sig { returns(PlatformTypes::User) }
  def user; end

  sig { returns(T::Boolean) }
  def user?; end
end
