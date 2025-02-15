# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::DeploymentEnvironmentChangedEvent`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::DeploymentEnvironmentChangedEvent`.

class Api::App::PlatformTypes::DeploymentEnvironmentChangedEvent < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def actor; end

  sig { returns(T::Boolean) }
  def actor?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(Api::App::PlatformTypes::DeploymentStatus) }
  def deployment_status; end

  sig { returns(T::Boolean) }
  def deployment_status?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def full_database_id; end

  sig { returns(T::Boolean) }
  def full_database_id?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(Api::App::PlatformTypes::PullRequest) }
  def pull_request; end

  sig { returns(T::Boolean) }
  def pull_request?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def resource_path; end

  sig { returns(T::Boolean) }
  def resource_path?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def safe_actor; end

  sig { returns(T::Boolean) }
  def safe_actor?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::App)) }
  def via_app; end

  sig { returns(T::Boolean) }
  def via_app?; end
end
