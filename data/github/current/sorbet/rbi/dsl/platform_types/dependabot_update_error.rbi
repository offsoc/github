# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DependabotUpdateError`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DependabotUpdateError`.

class PlatformTypes::DependabotUpdateError < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def body; end

  sig { returns(T::Boolean) }
  def body?; end

  sig { returns(String) }
  def error_type; end

  sig { returns(T::Boolean) }
  def error_type?; end

  sig { returns(String) }
  def title; end

  sig { returns(T::Boolean) }
  def title?; end
end
