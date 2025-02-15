# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::CreateBranchProtectionRulePayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::CreateBranchProtectionRulePayload`.

class Api::App::PlatformTypes::CreateBranchProtectionRulePayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Api::App::PlatformTypes::BranchProtectionRule)) }
  def branch_protection_rule; end

  sig { returns(T::Boolean) }
  def branch_protection_rule?; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end
end
