# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PublicForkPrWorkflowsPolicy`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PublicForkPrWorkflowsPolicy`.

class Api::App::PlatformTypes::PublicForkPrWorkflowsPolicy < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def public_fork_pr_workflows_policy; end

  sig { returns(T::Boolean) }
  def public_fork_pr_workflows_policy?; end
end
