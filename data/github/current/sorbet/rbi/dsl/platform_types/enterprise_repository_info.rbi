# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::EnterpriseRepositoryInfo`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::EnterpriseRepositoryInfo`.

class PlatformTypes::EnterpriseRepositoryInfo < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def is_private; end

  sig { returns(T::Boolean) }
  def is_private?; end

  sig { returns(String) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(String) }
  def name_with_owner; end

  sig { returns(T::Boolean) }
  def name_with_owner?; end
end
