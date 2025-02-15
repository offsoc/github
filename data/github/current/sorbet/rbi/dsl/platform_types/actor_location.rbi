# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ActorLocation`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ActorLocation`.

class PlatformTypes::ActorLocation < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def city; end

  sig { returns(T::Boolean) }
  def city?; end

  sig { returns(T.nilable(String)) }
  def country; end

  sig { returns(T::Boolean) }
  def country?; end

  sig { returns(T.nilable(String)) }
  def country_code; end

  sig { returns(T::Boolean) }
  def country_code?; end

  sig { returns(T.nilable(Float)) }
  def latitude; end

  sig { returns(T::Boolean) }
  def latitude?; end

  sig { returns(T.nilable(Float)) }
  def longitude; end

  sig { returns(T::Boolean) }
  def longitude?; end

  sig { returns(T.nilable(String)) }
  def postal_code; end

  sig { returns(T::Boolean) }
  def postal_code?; end

  sig { returns(T.nilable(String)) }
  def region; end

  sig { returns(T::Boolean) }
  def region?; end

  sig { returns(T.nilable(String)) }
  def region_code; end

  sig { returns(T::Boolean) }
  def region_code?; end
end
