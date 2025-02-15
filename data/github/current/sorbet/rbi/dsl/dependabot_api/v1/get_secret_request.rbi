# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DependabotApi::V1::GetSecretRequest`.
# Please instead update this file by running `bin/tapioca dsl DependabotApi::V1::GetSecretRequest`.

class DependabotApi::V1::GetSecretRequest
  sig { params(workflow_run_id: T.nilable(Integer)).void }
  def initialize(workflow_run_id: nil); end

  sig { void }
  def clear_workflow_run_id; end

  sig { returns(Integer) }
  def workflow_run_id; end

  sig { params(value: Integer).void }
  def workflow_run_id=(value); end
end
