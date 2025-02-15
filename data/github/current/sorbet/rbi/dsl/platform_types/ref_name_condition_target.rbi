# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::RefNameConditionTarget`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::RefNameConditionTarget`.

class PlatformTypes::RefNameConditionTarget < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Array[String]) }
  def exclude; end

  sig { returns(T::Boolean) }
  def exclude?; end

  sig { returns(T::Array[String]) }
  def include; end

  sig { returns(T::Boolean) }
  def include?; end
end
