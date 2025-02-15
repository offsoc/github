# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PackagesMutationResult`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PackagesMutationResult`.

class Api::App::PlatformTypes::PackagesMutationResult < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def error_type; end

  sig { returns(T::Boolean) }
  def error_type?; end

  sig { returns(T::Boolean) }
  def success; end

  sig { returns(T::Boolean) }
  def success?; end

  sig { returns(String) }
  def user_safe_message; end

  sig { returns(T::Boolean) }
  def user_safe_message?; end

  sig { returns(Integer) }
  def user_safe_status; end

  sig { returns(T::Boolean) }
  def user_safe_status?; end

  sig { returns(T::Array[GraphQL::Client::Schema::InterfaceType]) }
  def validation_errors; end

  sig { returns(T::Boolean) }
  def validation_errors?; end
end
