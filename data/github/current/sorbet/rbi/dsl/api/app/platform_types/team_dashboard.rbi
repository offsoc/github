# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TeamDashboard`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TeamDashboard`.

class Api::App::PlatformTypes::TeamDashboard < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(Api::App::PlatformTypes::TeamSearchShortcutConnection) }
  def shortcuts; end

  sig { returns(T::Boolean) }
  def shortcuts?; end

  sig { returns(Api::App::PlatformTypes::Team) }
  def team; end

  sig { returns(T::Boolean) }
  def team?; end
end
