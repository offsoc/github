# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::Workflow`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::Workflow`.

class PlatformTypes::Workflow < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T::Boolean) }
  def has_workflow_dispatch_trigger; end

  sig { returns(T::Boolean) }
  def has_workflow_dispatch_trigger?; end

  sig { returns(T::Boolean) }
  def has_workflow_dispatch_trigger_for_branch; end

  sig { returns(T::Boolean) }
  def has_workflow_dispatch_trigger_for_branch?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T.nilable(T::Array[PlatformTypes::WorkflowInput])) }
  def inputs; end

  sig { returns(T::Boolean) }
  def inputs?; end

  sig { returns(String) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def resource_path; end

  sig { returns(T::Boolean) }
  def resource_path?; end

  sig { returns(PlatformTypes::WorkflowRunConnection) }
  def runs; end

  sig { returns(T::Boolean) }
  def runs?; end

  sig { returns(String) }
  def state; end

  sig { returns(T::Boolean) }
  def state?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end
end
