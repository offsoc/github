# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TopicConnection`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TopicConnection`.

class Api::App::PlatformTypes::TopicConnection < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::TopicEdge])) }
  def edges; end

  sig { returns(T::Boolean) }
  def edges?; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::Topic])) }
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
