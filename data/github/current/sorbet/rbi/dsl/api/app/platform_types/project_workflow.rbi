# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ProjectWorkflow`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ProjectWorkflow`.

class Api::App::PlatformTypes::ProjectWorkflow < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Api::App::PlatformTypes::ProjectWorkflowActionConnection) }
  def actions; end

  sig { returns(T::Boolean) }
  def actions?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def creator; end

  sig { returns(T::Boolean) }
  def creator?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def last_updater; end

  sig { returns(T::Boolean) }
  def last_updater?; end

  sig { returns(Api::App::PlatformTypes::Project) }
  def project; end

  sig { returns(T::Boolean) }
  def project?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::ProjectColumn)) }
  def project_column; end

  sig { returns(T::Boolean) }
  def project_column?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def resource_path; end

  sig { returns(T::Boolean) }
  def resource_path?; end

  sig { returns(String) }
  def trigger_type; end

  sig { returns(T::Boolean) }
  def trigger_type?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end
end
