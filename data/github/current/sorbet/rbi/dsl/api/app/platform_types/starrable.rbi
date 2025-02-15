# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::Starrable`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::Starrable`.

class Api::App::PlatformTypes::Starrable < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(Integer) }
  def stargazer_count; end

  sig { returns(T::Boolean) }
  def stargazer_count?; end

  sig { returns(Api::App::PlatformTypes::StargazerConnection) }
  def stargazers; end

  sig { returns(T::Boolean) }
  def stargazers?; end

  sig { returns(T::Boolean) }
  def viewer_can_star; end

  sig { returns(T::Boolean) }
  def viewer_can_star?; end

  sig { returns(T::Boolean) }
  def viewer_has_starred; end

  sig { returns(T::Boolean) }
  def viewer_has_starred?; end
end
