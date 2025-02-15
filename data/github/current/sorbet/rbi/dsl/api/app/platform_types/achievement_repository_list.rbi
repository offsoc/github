# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::AchievementRepositoryList`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::AchievementRepositoryList`.

class Api::App::PlatformTypes::AchievementRepositoryList < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Api::App::PlatformTypes::RepositoryConnection) }
  def repositories; end

  sig { returns(T::Boolean) }
  def repositories?; end
end
