# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::Deployment`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::Deployment`.

class Api::App::PlatformTypes::Deployment < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Api::App::PlatformTypes::CheckRun)) }
  def check_run; end

  sig { returns(T::Boolean) }
  def check_run?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::Commit)) }
  def commit; end

  sig { returns(T::Boolean) }
  def commit?; end

  sig { returns(String) }
  def commit_oid; end

  sig { returns(T::Boolean) }
  def commit_oid?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def creator; end

  sig { returns(T::Boolean) }
  def creator?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(String) }
  def deployment_dashboard_environment_channel; end

  sig { returns(T::Boolean) }
  def deployment_dashboard_environment_channel?; end

  sig { returns(T.nilable(String)) }
  def description; end

  sig { returns(T::Boolean) }
  def description?; end

  sig { returns(T.nilable(String)) }
  def environment; end

  sig { returns(T::Boolean) }
  def environment?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def is_production_environment; end

  sig { returns(T::Boolean) }
  def is_production_environment?; end

  sig { returns(T::Boolean) }
  def is_transient_environment; end

  sig { returns(T::Boolean) }
  def is_transient_environment?; end

  sig { returns(T.nilable(String)) }
  def latest_environment; end

  sig { returns(T::Boolean) }
  def latest_environment?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::DeploymentStatus)) }
  def latest_status; end

  sig { returns(T::Boolean) }
  def latest_status?; end

  sig { returns(T.nilable(String)) }
  def original_environment; end

  sig { returns(T::Boolean) }
  def original_environment?; end

  sig { returns(T.nilable(String)) }
  def payload; end

  sig { returns(T::Boolean) }
  def payload?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::Ref)) }
  def ref; end

  sig { returns(T::Boolean) }
  def ref?; end

  sig { returns(T.nilable(String)) }
  def ref_name; end

  sig { returns(T::Boolean) }
  def ref_name?; end

  sig { returns(Api::App::PlatformTypes::Repository) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end

  sig { returns(T.nilable(String)) }
  def state; end

  sig { returns(T::Boolean) }
  def state?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::DeploymentStatusConnection)) }
  def statuses; end

  sig { returns(T::Boolean) }
  def statuses?; end

  sig { returns(T.nilable(String)) }
  def task; end

  sig { returns(T::Boolean) }
  def task?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::App)) }
  def via_app; end

  sig { returns(T::Boolean) }
  def via_app?; end
end
