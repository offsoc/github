# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ApplyContentWarningsPayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ApplyContentWarningsPayload`.

class Api::App::PlatformTypes::ApplyContentWarningsPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(T::Array[String])) }
  def errors; end

  sig { returns(T::Boolean) }
  def errors?; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::Repository])) }
  def failures; end

  sig { returns(T::Boolean) }
  def failures?; end

  sig { returns(T.nilable(T::Boolean)) }
  def forks; end

  sig { returns(T::Boolean) }
  def forks?; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::Repository])) }
  def successes; end

  sig { returns(T::Boolean) }
  def successes?; end

  sig { returns(T.nilable(String)) }
  def type; end

  sig { returns(T::Boolean) }
  def type?; end
end
