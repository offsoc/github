# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ExternalIdentitySamlAttributes`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ExternalIdentitySamlAttributes`.

class PlatformTypes::ExternalIdentitySamlAttributes < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Array[PlatformTypes::ExternalIdentityAttribute]) }
  def attributes; end

  sig { returns(T::Boolean) }
  def attributes?; end

  sig { returns(T.nilable(T::Array[PlatformTypes::UserEmailMetadata])) }
  def emails; end

  sig { returns(T::Boolean) }
  def emails?; end

  sig { returns(T.nilable(String)) }
  def external_id; end

  sig { returns(T::Boolean) }
  def external_id?; end

  sig { returns(T.nilable(String)) }
  def family_name; end

  sig { returns(T::Boolean) }
  def family_name?; end

  sig { returns(T.nilable(String)) }
  def given_name; end

  sig { returns(T::Boolean) }
  def given_name?; end

  sig { returns(T.nilable(T::Array[String])) }
  def groups; end

  sig { returns(T::Boolean) }
  def groups?; end

  sig { returns(T.nilable(String)) }
  def name_id; end

  sig { returns(T::Boolean) }
  def name_id?; end

  sig { returns(T.nilable(String)) }
  def username; end

  sig { returns(T::Boolean) }
  def username?; end
end
