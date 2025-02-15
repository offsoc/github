# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Deploy::GetWorkflowBillingDetailsRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Deploy::GetWorkflowBillingDetailsRequest`.

class GitHub::Launch::Services::Deploy::GetWorkflowBillingDetailsRequest
  sig { params(fields: T.untyped).void }
  def initialize(**fields); end

  sig { returns(T::Boolean) }
  def IsHostedRunner; end

  sig { params(value: T::Boolean).void }
  def IsHostedRunner=(value); end

  sig { returns(String) }
  def JobID; end

  sig { params(value: String).void }
  def JobID=(value); end

  sig { returns(String) }
  def ProductSku; end

  sig { params(value: String).void }
  def ProductSku=(value); end

  sig { returns(String) }
  def WorkflowID; end

  sig { params(value: String).void }
  def WorkflowID=(value); end

  sig { void }
  def clear_IsHostedRunner; end

  sig { void }
  def clear_JobID; end

  sig { void }
  def clear_ProductSku; end

  sig { void }
  def clear_WorkflowID; end
end
