# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::VerifiableDomain`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::VerifiableDomain`.

class PlatformTypes::VerifiableDomain < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def dns_host_name; end

  sig { returns(T::Boolean) }
  def dns_host_name?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def domain; end

  sig { returns(T::Boolean) }
  def domain?; end

  sig { returns(T::Boolean) }
  def has_found_host_name; end

  sig { returns(T::Boolean) }
  def has_found_host_name?; end

  sig { returns(T::Boolean) }
  def has_found_verification_token; end

  sig { returns(T::Boolean) }
  def has_found_verification_token?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def is_approved; end

  sig { returns(T::Boolean) }
  def is_approved?; end

  sig { returns(T::Boolean) }
  def is_required_for_policy_enforcement; end

  sig { returns(T::Boolean) }
  def is_required_for_policy_enforcement?; end

  sig { returns(T::Boolean) }
  def is_verified; end

  sig { returns(T::Boolean) }
  def is_verified?; end

  sig { returns(T.any(PlatformTypes::Enterprise, PlatformTypes::Organization)) }
  def owner; end

  sig { returns(T::Boolean) }
  def owner?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def punycode_encoded_domain; end

  sig { returns(T::Boolean) }
  def punycode_encoded_domain?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def token_expiration_time; end

  sig { returns(T::Boolean) }
  def token_expiration_time?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(T.nilable(String)) }
  def verification_token; end

  sig { returns(T::Boolean) }
  def verification_token?; end
end
