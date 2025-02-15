# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::AdvisoryCredit`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::AdvisoryCredit`.

class Api::App::PlatformTypes::AdvisoryCredit < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def advisory; end

  sig { returns(T::Boolean) }
  def advisory?; end

  sig { returns(String) }
  def ghsa_id; end

  sig { returns(T::Boolean) }
  def ghsa_id?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def recipient; end

  sig { returns(T::Boolean) }
  def recipient?; end

  sig { returns(String) }
  def state; end

  sig { returns(T::Boolean) }
  def state?; end
end
