# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ForkPrWorkflowsPolicyValue`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ForkPrWorkflowsPolicyValue`.

module Api::App::PlatformTypes::ForkPrWorkflowsPolicyValue
  sig { returns(T::Boolean) }
  def disabled?; end

  sig { returns(T::Boolean) }
  def run_with_secrets?; end

  sig { returns(T::Boolean) }
  def run_with_tokens?; end

  sig { returns(T::Boolean) }
  def run_with_tokens_and_secrets?; end

  sig { returns(T::Boolean) }
  def run_workflows?; end

  DISABLED = T.let("DISABLED", String)
  RUN_WITH_SECRETS = T.let("RUN_WITH_SECRETS", String)
  RUN_WITH_TOKENS = T.let("RUN_WITH_TOKENS", String)
  RUN_WITH_TOKENS_AND_SECRETS = T.let("RUN_WITH_TOKENS_AND_SECRETS", String)
  RUN_WORKFLOWS = T.let("RUN_WORKFLOWS", String)
end
