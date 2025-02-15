# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TeamSearchShortcut`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TeamSearchShortcut`.

class Api::App::PlatformTypes::TeamSearchShortcut < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def color; end

  sig { returns(T::Boolean) }
  def color?; end

  sig { returns(String) }
  def description; end

  sig { returns(T::Boolean) }
  def description?; end

  sig { returns(String) }
  def icon; end

  sig { returns(T::Boolean) }
  def icon?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(String) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(String) }
  def query; end

  sig { returns(T::Boolean) }
  def query?; end

  sig do
    returns(T::Array[T.any(Api::App::PlatformTypes::SearchShortcutQueryCategoryTerm, Api::App::PlatformTypes::SearchShortcutQueryLabelTerm, Api::App::PlatformTypes::SearchShortcutQueryLoginRefTerm, Api::App::PlatformTypes::SearchShortcutQueryMilestoneTerm, Api::App::PlatformTypes::SearchShortcutQueryProjectTerm, Api::App::PlatformTypes::SearchShortcutQueryRepoTerm, Api::App::PlatformTypes::SearchShortcutQueryTerm, Api::App::PlatformTypes::SearchShortcutQueryText)])
  end
  def query_terms; end

  sig { returns(T::Boolean) }
  def query_terms?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::Repository)) }
  def scoping_repository; end

  sig { returns(T::Boolean) }
  def scoping_repository?; end

  sig { returns(String) }
  def search_type; end

  sig { returns(T::Boolean) }
  def search_type?; end
end
