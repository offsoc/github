# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ToggleableFeature`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ToggleableFeature`.

class Api::App::PlatformTypes::ToggleableFeature < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def description; end

  sig { returns(T::Boolean) }
  def description?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def documentation_url; end

  sig { returns(T::Boolean) }
  def documentation_url?; end

  sig { returns(T::Boolean) }
  def enrolled_by_default; end

  sig { returns(T::Boolean) }
  def enrolled_by_default?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def feedback_url; end

  sig { returns(T::Boolean) }
  def feedback_url?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def image_url; end

  sig { returns(T::Boolean) }
  def image_url?; end

  sig { returns(String) }
  def public_name; end

  sig { returns(T::Boolean) }
  def public_name?; end

  sig { returns(String) }
  def slug; end

  sig { returns(T::Boolean) }
  def slug?; end

  sig { returns(T::Boolean) }
  def viewer_is_enrolled; end

  sig { returns(T::Boolean) }
  def viewer_is_enrolled?; end

  sig { returns(T::Boolean) }
  def viewer_opted_out; end

  sig { returns(T::Boolean) }
  def viewer_opted_out?; end
end
