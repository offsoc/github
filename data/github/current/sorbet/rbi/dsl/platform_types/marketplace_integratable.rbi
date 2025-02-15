# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::MarketplaceIntegratable`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::MarketplaceIntegratable`.

class PlatformTypes::MarketplaceIntegratable < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def preferred_background_color; end

  sig { returns(T::Boolean) }
  def preferred_background_color?; end
end
