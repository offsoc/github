# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::SearchShortcutQueryCategoryTerm`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::SearchShortcutQueryCategoryTerm`.

class Api::App::PlatformTypes::SearchShortcutQueryCategoryTerm < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Api::App::PlatformTypes::DiscussionCategory)) }
  def discussion_category; end

  sig { returns(T::Boolean) }
  def discussion_category?; end

  sig { returns(String) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(T::Boolean) }
  def negative; end

  sig { returns(T::Boolean) }
  def negative?; end

  sig { returns(String) }
  def term; end

  sig { returns(T::Boolean) }
  def term?; end

  sig { returns(String) }
  def value; end

  sig { returns(T::Boolean) }
  def value?; end
end
