# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::Comparison`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::Comparison`.

class Api::App::PlatformTypes::Comparison < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def ahead_by; end

  sig { returns(T::Boolean) }
  def ahead_by?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def base_target; end

  sig { returns(T::Boolean) }
  def base_target?; end

  sig { returns(Integer) }
  def behind_by; end

  sig { returns(T::Boolean) }
  def behind_by?; end

  sig { returns(Api::App::PlatformTypes::ComparisonCommitConnection) }
  def commits; end

  sig { returns(T::Boolean) }
  def commits?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def head_target; end

  sig { returns(T::Boolean) }
  def head_target?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(String) }
  def status; end

  sig { returns(T::Boolean) }
  def status?; end
end
