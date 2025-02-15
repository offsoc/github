# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::MigrationMapConflict`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::MigrationMapConflict`.

class Api::App::PlatformTypes::MigrationMapConflict < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def model_name; end

  sig { returns(T::Boolean) }
  def model_name?; end

  sig { returns(String) }
  def notes; end

  sig { returns(T::Boolean) }
  def notes?; end

  sig { returns(String) }
  def recommended_action; end

  sig { returns(T::Boolean) }
  def recommended_action?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def source_url; end

  sig { returns(T::Boolean) }
  def source_url?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def target_url; end

  sig { returns(T::Boolean) }
  def target_url?; end
end
