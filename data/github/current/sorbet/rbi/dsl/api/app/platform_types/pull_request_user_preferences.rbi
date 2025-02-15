# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PullRequestUserPreferences`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PullRequestUserPreferences`.

class Api::App::PlatformTypes::PullRequestUserPreferences < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def diff_view; end

  sig { returns(T::Boolean) }
  def diff_view?; end

  sig { returns(T.nilable(T::Boolean)) }
  def ignore_whitespace; end

  sig { returns(T::Boolean) }
  def ignore_whitespace?; end

  sig { returns(Integer) }
  def tab_size; end

  sig { returns(T::Boolean) }
  def tab_size?; end
end
