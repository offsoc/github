# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::UserContentEditConnection`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::UserContentEditConnection`.

class Api::App::PlatformTypes::UserContentEditConnection < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::UserContentEditEdge])) }
  def edges; end

  sig { returns(T::Boolean) }
  def edges?; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::UserContentEdit])) }
  def nodes; end

  sig { returns(T::Boolean) }
  def nodes?; end

  sig { returns(Api::App::PlatformTypes::PageInfo) }
  def page_info; end

  sig { returns(T::Boolean) }
  def page_info?; end

  sig { returns(Integer) }
  def total_count; end

  sig { returns(T::Boolean) }
  def total_count?; end
end
