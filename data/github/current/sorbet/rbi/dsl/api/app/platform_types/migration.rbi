# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::Migration`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::Migration`.

class Api::App::PlatformTypes::Migration < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Boolean) }
  def continue_on_error; end

  sig { returns(T::Boolean) }
  def continue_on_error?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(String)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T.nilable(String)) }
  def failure_reason; end

  sig { returns(T::Boolean) }
  def failure_reason?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def migration_log_url; end

  sig { returns(T::Boolean) }
  def migration_log_url?; end

  sig { returns(Api::App::PlatformTypes::MigrationSource) }
  def migration_source; end

  sig { returns(T::Boolean) }
  def migration_source?; end

  sig { returns(String) }
  def repository_name; end

  sig { returns(T::Boolean) }
  def repository_name?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def source_url; end

  sig { returns(T::Boolean) }
  def source_url?; end

  sig { returns(String) }
  def state; end

  sig { returns(T::Boolean) }
  def state?; end

  sig { returns(Integer) }
  def warnings_count; end

  sig { returns(T::Boolean) }
  def warnings_count?; end
end
