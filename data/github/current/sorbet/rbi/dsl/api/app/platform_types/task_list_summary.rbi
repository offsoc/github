# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TaskListSummary`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TaskListSummary`.

class Api::App::PlatformTypes::TaskListSummary < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def complete_count; end

  sig { returns(T::Boolean) }
  def complete_count?; end

  sig { returns(T::Boolean) }
  def has_items; end

  sig { returns(T::Boolean) }
  def has_items?; end

  sig { returns(Integer) }
  def incomplete_count; end

  sig { returns(T::Boolean) }
  def incomplete_count?; end

  sig { returns(Integer) }
  def item_count; end

  sig { returns(T::Boolean) }
  def item_count?; end
end
