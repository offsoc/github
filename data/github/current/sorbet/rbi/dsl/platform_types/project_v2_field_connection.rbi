# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ProjectV2FieldConnection`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ProjectV2FieldConnection`.

class PlatformTypes::ProjectV2FieldConnection < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T::Array[PlatformTypes::ProjectV2FieldEdge])) }
  def edges; end

  sig { returns(T::Boolean) }
  def edges?; end

  sig { returns(T.nilable(T::Array[PlatformTypes::ProjectV2Field])) }
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
