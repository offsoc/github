# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::RepositoryRulesetBypassActor`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::RepositoryRulesetBypassActor`.

class PlatformTypes::RepositoryRulesetBypassActor < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T.any(PlatformTypes::Team, PlatformTypes::App))) }
  def actor; end

  sig { returns(T::Boolean) }
  def actor?; end

  sig { returns(T.nilable(String)) }
  def bypass_mode; end

  sig { returns(T::Boolean) }
  def bypass_mode?; end

  sig { returns(T::Boolean) }
  def deploy_key; end

  sig { returns(T::Boolean) }
  def deploy_key?; end

  sig { returns(T::Boolean) }
  def enterprise_owner; end

  sig { returns(T::Boolean) }
  def enterprise_owner?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def organization_admin; end

  sig { returns(T::Boolean) }
  def organization_admin?; end

  sig { returns(T.nilable(Integer)) }
  def repository_role_database_id; end

  sig { returns(T::Boolean) }
  def repository_role_database_id?; end

  sig { returns(T.nilable(String)) }
  def repository_role_name; end

  sig { returns(T::Boolean) }
  def repository_role_name?; end

  sig { returns(T.nilable(PlatformTypes::RepositoryRuleset)) }
  def repository_ruleset; end

  sig { returns(T::Boolean) }
  def repository_ruleset?; end
end
