# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::UserEmailMetadata`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::UserEmailMetadata`.

class PlatformTypes::UserEmailMetadata < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T::Boolean)) }
  def primary; end

  sig { returns(T::Boolean) }
  def primary?; end

  sig { returns(T.nilable(String)) }
  def type; end

  sig { returns(T::Boolean) }
  def type?; end

  sig { returns(String) }
  def value; end

  sig { returns(T::Boolean) }
  def value?; end
end
