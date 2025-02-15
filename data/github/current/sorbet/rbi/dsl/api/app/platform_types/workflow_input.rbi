# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::WorkflowInput`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::WorkflowInput`.

class Api::App::PlatformTypes::WorkflowInput < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T::Array[String])) }
  def choices; end

  sig { returns(T::Boolean) }
  def choices?; end

  sig { returns(T.nilable(String)) }
  def default_value; end

  sig { returns(T::Boolean) }
  def default_value?; end

  sig { returns(T.nilable(String)) }
  def description; end

  sig { returns(T::Boolean) }
  def description?; end

  sig { returns(T::Boolean) }
  def required; end

  sig { returns(T::Boolean) }
  def required?; end

  sig { returns(String) }
  def title_id; end

  sig { returns(T::Boolean) }
  def title_id?; end

  sig { returns(String) }
  def type; end

  sig { returns(T::Boolean) }
  def type?; end
end
