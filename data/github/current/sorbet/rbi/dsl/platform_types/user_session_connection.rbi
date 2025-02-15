# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::UserSessionConnection`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::UserSessionConnection`.

class PlatformTypes::UserSessionConnection < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T::Array[PlatformTypes::UserSessionEdge])) }
  def edges; end

  sig { returns(T::Boolean) }
  def edges?; end

  sig { returns(T.nilable(T::Array[PlatformTypes::UserSession])) }
  def nodes; end

  sig { returns(T::Boolean) }
  def nodes?; end

  sig { returns(PlatformTypes::PageInfo) }
  def page_info; end

  sig { returns(T::Boolean) }
  def page_info?; end

  sig { returns(Integer) }
  def total_count; end

  sig { returns(T::Boolean) }
  def total_count?; end
end
