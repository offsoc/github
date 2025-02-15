# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::RepositoryRulesetBypassActorEdge`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::RepositoryRulesetBypassActorEdge`.

class PlatformTypes::RepositoryRulesetBypassActorEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(PlatformTypes::RepositoryRulesetBypassActor)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
